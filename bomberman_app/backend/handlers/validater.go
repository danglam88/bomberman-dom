package handlers

import (
	"encoding/json"
	"net/http"
)

var sessions = []string{}

func ValidateNickname(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var s map[string]string
	err := decoder.Decode(&s)
	if err != nil {
		GetErrResponse(w, "500 INTERNAL SERVER ERROR: FETCHING REQUEST BODY FAILED", http.StatusInternalServerError)
		return
	}

	// Getting the credentials (given by the user) from the login form
	nickname := s["nickname"]

	// Check if the nickname is already in use
	if !isNicknameAvailable(nickname) {
		w.WriteHeader(http.StatusConflict)

	} else {
		sessions = append(sessions, nickname)
		w.WriteHeader(http.StatusOK)
	}
}

func isNicknameAvailable(nickname string) bool {
	for _, session := range sessions {
		if session == nickname {
			return false
		}
	}

	return true
}
