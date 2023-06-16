package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func NewGame(w http.ResponseWriter, r *http.Request) {
	fmt.Println("NewGame")
	gameMap := [10][10]int{}
	jsonData, err := json.Marshal(gameMap)
	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
