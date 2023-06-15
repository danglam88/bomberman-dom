package handlers

import (
	"encoding/json"
	"net/http"
)

type Player struct {
	Name  string `json:"name"`
	XPos  string `json:"xpos"`
	YPos  string `json:"ypos"`
	Color string `json:"color"`
}

func GetPlayers(w http.ResponseWriter, r *http.Request) {
	players := []Player{}

	for i, session := range sessions {
		switch i {
		case 0:
			players = append(players, Player{Name: session, XPos: "left", YPos: "top", Color: "blue"})
		case 1:
			players = append(players, Player{Name: session, XPos: "right", YPos: "bottom", Color: "red"})
		case 2:
			players = append(players, Player{Name: session, XPos: "right", YPos: "top", Color: "purple"})
		case 3:
			players = append(players, Player{Name: session, XPos: "left", YPos: "bottom", Color: "dark"})
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
