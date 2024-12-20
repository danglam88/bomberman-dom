package handlers

import (
	"encoding/json"
	"net/http"
)

type Player struct {
	Name  string `json:"name"`
	X     int    `json:"x"`
	Y     int    `json:"y"`
	Color string `json:"color"`
}

type GameStatus struct {
	Players []Player `json:"players"`
	Started bool     `json:"started"`
}

func GetPlayers(w http.ResponseWriter, r *http.Request) {

	GameState := GameStatus{Players: []Player{}, Started: false}

	for i, session := range sessions {
		switch i {
		case 0:
			GameState.Players = append(GameState.Players, Player{Name: session, X: 0, Y: 0, Color: "blue"})
		case 1:
			GameState.Players = append(GameState.Players, Player{Name: session, X: 855, Y: 0, Color: "dark"})
		case 2:
			GameState.Players = append(GameState.Players, Player{Name: session, X: 0, Y: 855, Color: "red"})
		case 3:
			GameState.Players = append(GameState.Players, Player{Name: session, X: 855, Y: 855, Color: "purple"})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if gameStarted {
		GameState.Started = true
	}

	jsonData, err := json.Marshal(GameState)
	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(jsonData)
}

func UpdatePlayers(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var p string
	err := decoder.Decode(&p)

	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for i, session := range sessions {
		if session == p {
			sessions = append(sessions[:i], sessions[i+1:]...)
		}
	}

	if len(sessions) == 0 {
		gameStarted = false
	}

	w.WriteHeader(http.StatusOK)
}
