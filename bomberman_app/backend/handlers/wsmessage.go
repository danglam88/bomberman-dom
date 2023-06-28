package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	MESSAGE_TYPE             = "message"
	GAME_UPDATE              = "game-update"
	GAME_UPDATE_BOMB         = "game-update-bomb"
	GAME_UPDATE_BOMB_EXPLODE = "game-update-bomb-explode"
	LEAVE_MSG                = "leave"
	WAITTIME_MSG             = "wait-time"
	TIMER_MSG                = "timer"
)

// Set the timeout duration
const BOMB_DURATION = 3

var (
	websocketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, //Allow all origins
	}
)

var Mgr *Manager

func SetManager(m *Manager) {
	Mgr = m
}

var waitTimeActivated = false
var timerActivated = false
var waitTime = 20
var timer = 10

type Manager struct {
	clients  ClientList
	nextID   int
	cancelCh chan struct{}
	sync.RWMutex
}

type Message struct {
	From      int       `json:"from"`
	Message   string    `json:"message"`
	Type      string    `json:"type"`
	Nickname  string    `json:"nickname"`
	Timestamp time.Time `json:"timestamp"`
}

type GameUpdateMessage struct {
	Type   string `json:"type"`
	Player string `json:"player"`
	Key    int    `json:"key"`
}

type GameUpdateBombMessage struct {
	Type   string `json:"type"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
	Range  int    `json:"range"`
	Player string `json:"player"`
}

func NewManager() *Manager {
	return &Manager{
		clients:  make(ClientList),
		nextID:   1, // Initialize the nextID to 1
		cancelCh: make(chan struct{}),
	}
}

func (m *Manager) serveWS(w http.ResponseWriter, r *http.Request) {
	SetManager(m)

	// Obtain a unique ID and increment the counter
	m.Lock()
	id := m.nextID
	m.nextID++
	m.Unlock()

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	pathString := strings.TrimPrefix(r.URL.Path, "/ws/")
	nickname := strings.Split(pathString, "/")[0]
	fmt.Println("Nickname: " + nickname)

	client := NewClient(conn, m, id, nickname)
	m.addClient(client)

	//Start client
	go client.readMessages()
	go client.writeMessages()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true

	fmt.Println("waiteTimeActivated: " + strconv.FormatBool(waitTimeActivated))
	fmt.Println("timerActivated: " + strconv.FormatBool(timerActivated))
	fmt.Println("waitTime: " + strconv.Itoa(waitTime))
	fmt.Println("timer: " + strconv.Itoa(timer))
	if (waitTimeActivated || timerActivated) && waitTime == 20 && timer == 10 {
		m.cancelCh = make(chan struct{})
		fmt.Println("Start countdown")
		go m.countDown()
	}
}

func (m *Manager) countDown() {
	waitTimeTicker := time.NewTicker(1 * time.Second)
	timerTicker := time.NewTicker(1 * time.Second)

	for {
		select {
		case <-waitTimeTicker.C:
			if waitTimeActivated && waitTime >= 0 {
				msg := Message{Type: WAITTIME_MSG}
				msg.Message = strconv.Itoa(waitTime)
				msgJson, err := json.Marshal(msg)
				if err != nil {
					log.Println(err)
				} else {
					for c := range m.clients {
						c.egress <- msgJson
					}
				}
				waitTime--
				fmt.Println("waitTime: " + strconv.Itoa(waitTime))
				if waitTime == -1 {
					timerActivated = true
					waitTimeActivated = false
				}
			}
		case <-timerTicker.C:
			if timerActivated && timer >= 0 {
				msg := Message{Type: TIMER_MSG}
				msg.Message = strconv.Itoa(timer)
				msgJson, err := json.Marshal(msg)
				if err != nil {
					log.Println(err)
				} else {
					for c := range m.clients {
						c.egress <- msgJson
					}
				}
				timer--
				if timer == -1 {
					timerActivated = false
					timer = 10
					waitTime = 20
				}
			}
		case <-m.cancelCh:
			waitTimeTicker.Stop()
			timerTicker.Stop()
			return
		}
	}
}

func (m *Manager) removeClient(client *Client) {
	fmt.Println("removeClient")
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)

		if len(m.clients) <= 1 {
			waitTimeActivated = false
			timerActivated = false
			waitTime = 20
			timer = 10
			m.cancelCh <- struct{}{}
			fmt.Println("Client deleted, number of clients: " + strconv.Itoa(len(m.clients)))
		}
	}
}

func (m *Manager) FindClientByNickname(nickname string) {
	fmt.Println("Nbr of clients: " + strconv.Itoa(len(m.clients)) + "Nickname: " + nickname)
	m.Lock()
	defer m.Unlock()

	for client := range m.clients {
		fmt.Println("Client nickname: " + client.Nickname)
		if client.Nickname == nickname {
			fmt.Println("Client found")
			client.connection.Close()
			delete(m.clients, client)
			fmt.Println("Client deleted, number of clients: " + strconv.Itoa(len(m.clients)))
		}
	}
}

type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	manager    *Manager
	egress     chan []byte
	userId     int
	Nickname   string
}

func NewClient(conn *websocket.Conn, manager *Manager, id int, nickname string) *Client {
	client := &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan []byte, 1),
		userId:     id,
		Nickname:   nickname,
	}

	if len(manager.clients) == 1 {
		waitTimeActivated = true
	} else if len(manager.clients) == 3 {
		timerActivated = true
		waitTimeActivated = false
	}

	return client
}

func (c *Client) readMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for {
		_, payload, err := c.connection.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}

		var res Message

		// Check the message type
		var msgType struct {
			Type string `json:"type"`
		}

		err = json.Unmarshal(payload, &msgType)

		if err != nil {
			log.Printf("error unmarshalling message type: %v", err)
			continue
		}

		if msgType.Type == LEAVE_MSG {
			// Handle the leave message
			res = Message{
				From:      c.userId,
				Type:      LEAVE_MSG,
				Timestamp: time.Now(),
				Nickname:  c.Nickname,
			}

			resJson, err := json.Marshal(res)

			//fmt.Println(resJson)

			if err != nil {
				log.Printf("error marshalling leave message: %v", err)
				continue
			}

			for i, session := range sessions {
				if session == c.Nickname {
					sessions = append(sessions[:i], sessions[i+1:]...)
					break
				}
			}

			for client := range c.manager.clients {
				client.egress <- resJson
			}

			continue
		}

		if msgType.Type == GAME_UPDATE {

			var data GameUpdateMessage
			err = json.Unmarshal(payload, &data)

			if err != nil {
				log.Printf("error unmarshalling message: %v", err)
				continue
			}

			//todo remove
			//fmt.Println(data)

			data.Player = c.Nickname

			message, err := json.Marshal(data)
			if err != nil {
				log.Println(err)
				return
			}

			for wsclient := range c.manager.clients {
				wsclient.egress <- message //broadcast to all available clients
			}
		}

		if msgType.Type == GAME_UPDATE_BOMB {

			var data GameUpdateBombMessage
			err = json.Unmarshal(payload, &data)

			if err != nil {
				log.Printf("error unmarshalling message: %v", err)
			}

			message, err := json.Marshal(data)
			if err != nil {
				log.Println(err)
				return
			}

			for wsclient := range c.manager.clients {
				wsclient.egress <- message //broadcast to all available clients
			}

			// Start a goroutine to perform the delayed task
			go func() {
				time.Sleep(BOMB_DURATION * time.Second)

				data.Type = GAME_UPDATE_BOMB_EXPLODE

				message, err := json.Marshal(data)
				if err != nil {
					log.Println(err)
					return
				}

				for wsclient := range c.manager.clients {
					wsclient.egress <- message //broadcast to all available clients
				}
			}()
		}

		if msgType.Type == MESSAGE_TYPE {

			err = json.Unmarshal(payload, &res)

			if err != nil {
				log.Printf("error unmarshalling message: %v", err)
				continue
			}

			res.From = c.userId

			if c.Nickname != "" {
				res.Nickname = c.Nickname
			} else {
				nickname := "User " + strconv.Itoa(c.userId)
				res.Nickname = nickname
			}

			if err != nil {
				log.Println(err)
			}

			if res.From > 0 {
				res.Timestamp = time.Now()
				message, err := json.Marshal(res)
				if err != nil {
					log.Println(err)
					return
				}

				for wsclient := range c.manager.clients {

					wsclient.egress <- message //broadcast to all available clients

				}
			}

		}
	}
}

func (c *Client) writeMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for message := range c.egress {
		if err := c.connection.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Println(err)
		}
	}

}
