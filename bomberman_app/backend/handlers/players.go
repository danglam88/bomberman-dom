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

func GetPlayers(w http.ResponseWriter, r *http.Request) {

	Players := []Player{}

	for i, session := range sessions {
		switch i {
		case 0:
			Players = append(Players, Player{Name: session, X: 0, Y: 0, Color: "blue"})
		case 1:
			Players = append(Players, Player{Name: session, X: 855, Y: 0, Color: "dark"})
		case 2:
			Players = append(Players, Player{Name: session, X: 0, Y: 855, Color: "red"})
		case 3:
			Players = append(Players, Player{Name: session, X: 855, Y: 855, Color: "purple"})
		}
	}

	jsonData, err := json.Marshal(Players)
	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if gameMap.Data != nil {
		w.WriteHeader(http.StatusLocked)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	w.Write(jsonData)
}
