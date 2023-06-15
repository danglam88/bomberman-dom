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
	}

	handlers.Start(collection)
}
