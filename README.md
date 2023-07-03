## AUTHORS

Danilo Cangucu, Dang Lam, Iuliia Chipsanova, Malin Oscarius, Johannes Eckerman

## DESCRIPTION

Engage in an explosive multiplayer battle with Multiplayer Bomberman! Developed as a part of our coding bootcamp, this game tests your survival instincts and strategic skills against 2-4 players in a fixed map. The goal? Outwit and defeat your opponents with your bomb-placing prowess until only you remain standing.

This game was built with a specific focus on performance. We decided to render the game client-side and send only the keystrokes over a WebSocket to the backend for broadcasting. This approach enhances the game's responsiveness, delivering a seamless and engaging experience to the players.

We are aware that this decision may open up the possibility of client-side manipulation of the game state. However, under normal use cases, the game operates as expected. This is an educational project, and this design choice offers an interesting point of discussion about trade-offs in game development.

To get started, just clone the repository and follow the installation instructions provided. Then, gather your friends, plan your strategy, and prepare for an adrenaline-fueled adventure in Multiplayer Bomberman!

Game Features:
Interactive multiplayer gameplay
Strategically placed bombs to defeat opponents
Real-time chat system for communication
High-performance client-side rendering

Technical Stack
Backend: WebSocket for broadcasting player movements
Frontend: HTML/JavaScript/CSS powered by our own JavaScript-framework

## USAGE

- Go to bomberman_app/backend then run "go run ."
- Open web browsers to the following address: http://localhost:8080
