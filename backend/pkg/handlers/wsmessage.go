package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	MESSAGE_TYPE             = "message"
	LOGOUT_TYPE              = "logout"
	LOGIN_TYPE               = "login"
	FOLLOWNOTIFICATION_TYPE  = "follownotification"
	INVITENOTIFICATION_TYPE  = "invitenotification"
	JOINREQNOTIFICATION_TYPE = "joinreqnotification"
	EVENTNOTIFICATION_TYPE   = "eventnotification"
)

var (
	websocketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true }, //Allow all origins
	}
)

type Manager struct {
	clients ClientList
	sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients: make(ClientList),
	}
}

var Mgr *Manager

func SetManager(m *Manager) {
	Mgr = m
}

func (m *Manager) serveWS(w http.ResponseWriter, r *http.Request) {
	SetManager(m)

	id := 1 //set ID HERE :D

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

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
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)
	}
}

type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	manager    *Manager
	egress     chan []byte
	userId     int
}

func NewClient(conn *websocket.Conn, manager *Manager, id int) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan []byte),
		userId:     id,
	}
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

		type Message struct {
			From      int    `json:"from"`
			To        int    `json:"to"`
			Message   string `json:"message"`
			Type      string `json:"type"`
			Username  string `json:"username"`
			Timestamp string `json:"timestamp"`
		}

		var res Message

		err = json.Unmarshal(payload, &res)

		if err != nil {
			log.Printf("error unmarshalling message: %v", err)
			continue
		}

		res.From = c.userId

		res.Username = "hello"
		if err != nil {
			log.Println(err)
		}

		if res.From > 0 {
			res.Timestamp = time.Now().Format("2006-01-02 15:04:05")
			message, err := json.Marshal(res)
			if err != nil {
				log.Println(err)
				return
			}
			chatUsers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9}
			if res.Type == MESSAGE_TYPE {
				for _, chatUser := range chatUsers {
					for wsclient := range c.manager.clients {
						if wsclient.userId == chatUser {
							wsclient.egress <- message
						}
					}
				}
			}
		}
	}
}

func (c *Client) writeMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	for {
		select {
		case message, ok := <-c.egress:
			if !ok {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed: ", err)
				}
				return
			}

			if err := c.connection.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println(err)
			}
		}
	}
}
