package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	MESSAGE_TYPE = "message"
	GAME_UPDATE  = "game-update"
)

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

var timerTimestamp time.Time

type Manager struct {
	clients ClientList
	nextID  int
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

func NewManager() *Manager {
	return &Manager{
		clients: make(ClientList),
		nextID:  1, // Initialize the nextID to 1
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

	nickname := r.Header.Get("nickname")
	fmt.Println(nickname)
	fmt.Println(r.Header)

	client := NewClient(conn, m, id)
	m.addClient(client)

	//Start client
	go client.readMessages()
	go client.writeMessages()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true

	// not working yet. Broadcast joinmsg with countdowntimer and nickname
	joinMsg := Message{
		From:     client.userId,
		Type:     "join",
		Nickname: "Player " + strconv.Itoa(client.userId),
	}

	if timerTimestamp.IsZero() {
		joinMsg.Timestamp = time.Now()
	} else {
		joinMsg.Timestamp = timerTimestamp
	}

	joinMsgJson, err := json.Marshal(joinMsg)
	if err != nil {
		log.Println(err)
	} else {
		for c := range client.manager.clients {
			c.egress <- joinMsgJson
		}
	}
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)

		// If only one player is left, stop the timer
		if len(m.clients) == 1 {
			timerTimestamp = time.Time{} // Reset the timer timestamp
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

func NewClient(conn *websocket.Conn, manager *Manager, id int) *Client {
	client := &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan []byte, 1),
		userId:     id,
	}

	if len(manager.clients) == 1 {
		timerTimestamp = time.Now()
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

		if msgType.Type == "leave" {
			c.manager.removeClient(c)
			continue
		}

		if msgType.Type == "nickname" {
			// Handle the nickname payload
			var nicknamePayload struct {
				Nickname string `json:"nickname"`
			}

			err = json.Unmarshal(payload, &nicknamePayload)

			if err != nil {
				log.Printf("error unmarshalling nickname payload: %v", err)
				continue
			}

			nickname := nicknamePayload.Nickname

			// Update the client's username
			c.Nickname = nickname

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
			fmt.Println(data)

			data.Player = c.Nickname

			message, err := json.Marshal(data)
			if err != nil {
				log.Println(err)
				return
			}

			//todo this part should be separate in the loop
			for wsclient := range c.manager.clients {
				wsclient.egress <- message //broadcast to all available clients
			}
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
