package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	MESSAGE_TYPE = "message"
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

type Manager struct {
	clients ClientList
	nextID  int
	sync.RWMutex
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

		res.Username = "User " + strconv.Itoa(c.userId)
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

			for wsclient := range c.manager.clients {

				wsclient.egress <- message //broadcast to all available clients

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
