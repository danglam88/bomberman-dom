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
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	nickname := s["nickname"]

	// Check if the nickname is already in use
	if len(sessions) == 4 {
		w.WriteHeader(http.StatusTooManyRequests)
	} else if !isNicknameAvailable(nickname) {
		w.WriteHeader(http.StatusConflict)
	} else if gameMap.Data != nil {
		w.WriteHeader(http.StatusLocked)
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
