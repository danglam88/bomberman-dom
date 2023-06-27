package main

import (
	"bomberman-dom/handlers"
)

func main() {
	collection := []handlers.Handler{
		{
			Endpoint:     "/validate",
			PostFunction: handlers.ValidateNickname,
		},
		{
			Endpoint:     "/players",
			GetFunction:  handlers.GetPlayers,
			PostFunction: handlers.UpdatePlayers,
		},
		{
			Endpoint:    "/new_game",
			GetFunction: handlers.NewGame,
		},
	}

	handlers.Start(collection)
}
