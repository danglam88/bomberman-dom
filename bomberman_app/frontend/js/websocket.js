import { animateBomb, movePlayer, noBombPlaced, players, waitTime, timer, gameStarted, canPlayerMove } from "./game.js";

export function openChat() {
    const chatElement = document.getElementById("chat");
    const nickname = localStorage.getItem("nickname");
    const websocketOpen = localStorage.getItem("websocketOpen");
  
    if (websocketOpen !== "true") {
      const socket = initializeWebSocket(nickname);
      attachEventListeners(socket, nickname);
    } else {
      chatElement.style.display = "";
      localStorage.setItem("websocketOpen", "false");

    }
  }
  
  function initializeWebSocket(nickname) {
    const socket = new WebSocket(`ws://localhost:8080/ws/${nickname}`);
  
    socket.onopen = () => localStorage.setItem("websocketOpen", "true");
    socket.onclose = () => localStorage.setItem("websocketOpen", "false");
    socket.onerror = (error) => console.log(`WebSocket error: ${error}`);
  
    return socket;
  }
  
  function attachEventListeners(socket, nickname) {
    socket.onmessage = (event) => handleSocketMessage(event, socket);
    document.getElementById("form").addEventListener("submit", (e) => handleFormSubmit(e, socket));
    window.addEventListener('keydown', (e) => handleKeyInput(e, socket));
    window.addEventListener('keyup', (e) => handleKeyOutput(e, socket));
    window.addEventListener("beforeunload", (e) => handleBeforeUnload(e, socket, nickname));
  }
  
  function handleSocketMessage(event, socket) {
    const msg = JSON.parse(event.data);
    const chatContainer = document.getElementById("chat-messages");
  
    switch (msg.type) {
      case "message":
        handleMessage(msg, chatContainer);
        break;
      case "wait-time":
      case "timer":
        handleTimer(msg);
        break;
      case "leave":
        handleLeave(msg, chatContainer);
        break;
      case "game-update":
        handleGameUpdate(msg);
        break;
      default:
        console.log(`Unknown message type: ${msg.type}`);
    }
  }
  
  function handleMessage(msg, chatContainer) {
    const player = players.find(player => player.name === msg.nickname);
    const node = document.createElement("div");
    const picture = document.createElement("img");
    picture.src = `img/${player.color}-front0.png`;
  
    const textnode = document.createTextNode(`${msg.nickname}: ${msg.message}`);
    node.appendChild(picture);
    node.appendChild(textnode);
    chatContainer.appendChild(node);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function handleTimer(msg) {
    if (msg.type === "wait-time") {
      waitTime = parseInt(msg.message);
    } else if (msg.type === "timer") {
      timer = parseInt(msg.message);
      waitTime = undefined;
    }
  
    fetchPlayersRenderWaitingTimer();
  }
  
  function handleLeave(msg, chatContainer) {
    if (players.length == 2) {
      timer = undefined;
      waitTime = undefined;
    }
  
    fetchPlayersRenderWaitingTimer();
  
    const node = document.createElement("div");
    const textnode = document.createTextNode(`${msg.nickname} left the game`);
  
    node.appendChild(textnode);
    chatContainer.appendChild(node);
  }
  
  function handleGameUpdate(msg) {
    const player = players.find(player => player.name == msg.player);
  
    if (player !== undefined) {
      if (msg.key === 16) {
        if (player.bombStillLeft() && noBombPlaced(player.getX(), player.getY())) {
          animateBomb(player.dropBomb());
        }
      } else if (msg.key >= 37 && msg.key <= 40) {
        handlePlayerMovement(msg, player);
      }
    }
  }
  
  function handlePlayerMovement(msg, player) {
    if (!msg.pressed) {
      player.setDirection(null);
      movePlayer(player);
    } else if (canPlayerMove) {
      player.setDirection(msg.key);
      movePlayer(player);
  
      canPlayerMove = false;
      setTimeout(() => {
        canPlayerMove = true;
      }, 50);
    }
  }
  
  function handleFormSubmit(e, socket) {
    e.preventDefault();
  
    const input = document.getElementById("input");
    const message = input.value;
    input.value = "";
  
    const msg = {
      Type: "message",
      Message: message,
    };
  
    socket.send(JSON.stringify(msg));
  }
  
  function handleKeyInput(e, socket) {
    if ((e.keyCode >= 37 && e.keyCode <= 40) || e.key == "Shift") {
      const msg = {
        Type : "game-update",
        Key : e.keyCode,
        Pressed: true,
      };
  
      socket.send(JSON.stringify(msg));
    }
  }
  
  function handleKeyOutput(e, socket) {
    if (e.keyCode >= 37 && e.keyCode <= 40) {
      const msg = {
        Type : "game-update",
        Key : e.keyCode,
        Pressed: false,
      };
  
      socket.send(JSON.stringify(msg));
    }
  }
  
  function handleBeforeUnload(e, socket, nickname) {
    const msg = {
      Type: "leave",
      nickname: nickname,
    };
  
    socket.send(JSON.stringify(msg));
  }