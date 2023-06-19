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
	players := []Player{}

	for i, session := range sessions {
		switch i {
		case 0:
			players = append(players, Player{Name: session, X: 5, Y: 10, Color: "blue"})
		case 1:
			players = append(players, Player{Name: session, X: 850, Y: 845, Color: "red"})
		case 2:
			players = append(players, Player{Name: session, X: 850, Y: 10, Color: "purple"})
		case 3:
			players = append(players, Player{Name: session, X: 5, Y: 845, Color: "dark"})
		}
	}

	jsonData, err := json.Marshal(players)
	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
