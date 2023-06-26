package handlers

import (
	"encoding/json"
	"fmt"
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
	initialCheck := s["initialCheck"]

	// Check if the nickname is already in use
	if len(sessions) >= 4 {
		w.WriteHeader(http.StatusTooManyRequests)
	} else if !isNicknameAvailable(nickname, initialCheck) {
		if initialCheck == "true" {
			w.WriteHeader(http.StatusOK)
		} else {
			w.WriteHeader(http.StatusConflict)
		}
	} else if gameStarted {
		w.WriteHeader(http.StatusLocked)
	} else if initialCheck == "false" {
		sessions = append(sessions, nickname)
		fmt.Println("Sessions: ", sessions)
		w.WriteHeader(http.StatusOK)
	}
}

func isNicknameAvailable(nickname, initialCheck string) bool {
	for i, session := range sessions {
		if session == nickname {
			if initialCheck == "true" {
				sessions = append(sessions[:i], sessions[i+1:]...)
			}
			return false
		}
	}

	return true
}
