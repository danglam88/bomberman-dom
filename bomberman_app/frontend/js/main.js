import MiniFramework from "../mini_framework/mini-framework.js";
import { createMap } from "./map.js";

import { Bomb, Player } from "./class.js";
import { GLOBAL_SPEED, flashDuration, movePlayer, animateBomb, noBombPlaced, createFlashPieces, destroyObjects, removeFlashPieces, isGameOver, setGameOver, removePlayerFromBackend } from "./game.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let playerChecked = false;

let waitingError = "";
let players = [];
let playersFetched = false;
let waitTime = undefined;
let timer = undefined;

let gameStarted = false;
let canPlayerMove = true;

let socket;

export const Info = () => {
  return `
    <MF>
      <div class="howtoplay" style="text-align: center;">Use arrows to move, shift to place bombs</div>
      <div class="stats" style="height: 45px; width: 900px; top: 130px;">
      </div>
    </MF>
    `;
};

export const Naming = () => {
  if (!playerChecked) {
    const nickname = localStorage.getItem("nickname");
    if (nickname && nickname.trim().length > 0) {
      checkPlayerAlreadyExists(nickname, "true");
    }
  }

  const validateInput = (event) => {
    if (!regex.test(event.key) && event.key !== "Enter") {
      event.preventDefault();
    }else if (event.target.value.length >= 10 && event.key !== "Enter") {
      event.preventDefault();
    } else if (event.key === "Enter" && event.target.value !== "") {
      checkPlayerAlreadyExists(event.target.value, "false");
    }
  };

  MiniFramework.defineFunc(validateInput);

  return `
  <MF>
    ${(Array.isArray(players) && players.length === 4) || gameStarted
    ? `
    <div class="start" style="background: url(&quot;img/story.png&quot;); height: 900px; width: 900px;">
      <div class="storytext" style="align-self: center;">
        Game is not available at the moment. Please try again later...
      </div>
    </div>
    `
    : `
    <div class="naming" style="background: url(&quot;img/story.png&quot;); height: 900px; width: 900px;">
      <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
      <input class="playername" id="nameplayer" maxlength="10" placeholder="add nickname here..." onkeypress="validateInput">
      <div class="invalidnotice" style="align-self: center;">Only letters and numbers are allowed</div>
      ${
        validateError !== ""
          ? `<div class="invalidnotice" style="align-self: center;">${validateError}</div>`
          : ""
      }
    </div>
    `}
  </MF>
  `;
};

export const Counter = () => {
  if (!playersFetched) {
    fetchPlayersRenderWaitingTimer();
  }

  return `
  <MF>
    <div class="start" style="background: url(&quot;img/story.png&quot;); height: 900px; width: 900px;">
      <div class="storytext" style="align-self: center;">
        ${
          localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 &&
          Array.isArray(players) &&
          players.length === 1
            ? `You (${localStorage.getItem(
                "nickname"
              )}) are the only one who joined the game. Let's wait for other players...`
            : localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 &&
              Array.isArray(players) &&
              players.length > 1 &&
              players.length < 4 &&
              waitTime !== undefined &&
              waitTime >= 0
            ? `There are totally ${
                players.length
              } players in the game: You (${localStorage.getItem(
                "nickname"
              )}), ${players
                .filter(
                  (player) => player.name !== localStorage.getItem("nickname")
                )
                .map((player) => player.name)
                .join(", ")}. Let's wait for ${waitTime} more seconds...`
            : localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 &&
              Array.isArray(players) &&
              players.length > 1 &&
              players.length <= 4 &&
              timer !== undefined &&
              timer >= 0
            ? `There are totally ${
                players.length
              } players in the game: You (${localStorage.getItem(
                "nickname"
              )}), ${players
                .filter(
                  (player) => player.name !== localStorage.getItem("nickname")
                )
                .map((player) => player.name)
                .join(", ")}. Game will start in ${timer} seconds...`
            : waitingError !== "" ? waitingError : `Loading...`
        }
      </div>
    </div>
  </MF>
  `;
};

export const Start = () => {
  return `
  <MF>
    <div id="core-part" class="core-part">
      <div id="game" class="game">
        <div id="info">${Info()}</div>
        ${Naming()}
      </div>
    </div>
  </MF>
  `;
};

export const Waiting = () => {
  return `
  <MF>
    <div id="core-part" class="core-part">
      <div id="game" class="game">
        <div id="info">${Info()}</div>
        ${Counter()}
      </div>
    </div>
  </MF>
  `;
};

export const GameOver = () => {
  let winnerPicture = "";
  const winner = JSON.parse(localStorage.getItem('winner'))
  if (winner !== null) {
    winnerPicture = "img/" + winner.color + "-front0.png";
  }

  return `
  <MF>
  <div id="core-part" style="display: flex; align-items: center; flex-direction: column;">
  <div id="gameover">
      ${winner !== null
        ? `<div id="gameover-text" style="color: white;"><h1>GAME OVER! ${winner.name} won!</h1></div>
          <div><img class="winner-image" src="${winnerPicture}"></div>`
        : `<div id="gameover-text" style="color: white;"><h1>GAME OVER! No one won!</h1></div>`}
        </div>
      <div>
        <a href="http://localhost:8080/" class="button">Play a new game</a>
      </div>
    </div>
  </MF>
  `;
}

function Router() {
  function routeChange() {
    const container = document.getElementById("root");
    container.innerHTML = "";
    if (
      window.location.hash !== "#/waiting" &&
      window.location.hash !== "#/gamestart" &&
      window.location.hash !== "#/gameover"
    ) {
      // if you change to some other hash route, you will be redirected to root
      if (socket !== undefined) {
        window.location = "/";
      }
      MiniFramework.render(Start, container);
    } else if (window.location.hash === "#/waiting") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length <= 3) {
        MiniFramework.render(Waiting, container);
        setTimeout(() => {
          if (waitingError === "") {
            openChat();
          }
        }, 100);
      } else {
        window.location.hash = "#/";
      }
    } else if (window.location.hash === "#/gamestart") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length <=4 && gameStarted) {
        createMap(players);
      } else {
        window.location.hash = "#/";
      }
    } else if (window.location.hash == "#/gameover"){
      if (localStorage.getItem("winner") && localStorage.getItem("winner").trim().length > 0 && Array.isArray(players) && players.length <= 1 && isGameOver) {
        MiniFramework.render(GameOver, container);
        setTimeout(() => {
          resetGame();
        }, 100);
      } else {
        window.location.hash = "#/";
      }
    }

    // Set focus on the input textfield when the page is loaded
    window.onload = () => {
      localStorage.setItem("websocketOpen", "false");
      const input = document.getElementById("nameplayer");
      if (input !== null) {
        input.focus();
      }
    };
  }
  window.onhashchange = routeChange;
  routeChange();
}

function checkPlayerAlreadyExists(nickname, initialCheck) {
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname, initialCheck }),
  };

  fetch("/validate", options)
    .then((response) => {
      playerChecked = true;

      if (response.status === 200 && initialCheck === "false") {
        localStorage.setItem("nickname", nickname);
        window.location.hash = "#/waiting";
      } else if (response.status === 423) {
        validateError =
          "Game has already started, please try again later";
        MiniFramework.updateState();
      } else if (response.status === 429) {
        validateError =
          "There are already 4 players in the game, please try again later";
        MiniFramework.updateState();
      } else if (response.status === 409) {
        validateError =
          "Nickname was already taken, please choose another one";
        MiniFramework.updateState();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchPlayersRenderWaitingTimer() {
  fetch("/players")
  .then((response) => response.json())
  .then((data) => {
    playersFetched = true;
    players = []

    if (data.started) {
      waitingError = "Game is not available at the moment. Please try again later..."
    }

    data.players.forEach((player, i) => {
      const isMe = player.name == localStorage.getItem("nickname")
      players.push(new Player(player.name, player.x, player.y, player.color, GLOBAL_SPEED, i+1, isMe))
    })

    MiniFramework.updateState();

    if (timer === 0) {
      gameStarted = true;
      window.location.hash = "#/gamestart";
    }
  })
  .catch((error) => {
    console.error(error);
  });
}

const openChat = () => {
  const chat = document.getElementById("chat");
  chat.style.display = "";
  const nickname = localStorage.getItem("nickname");
  const isWebSocketOpen = localStorage.getItem("websocketOpen") === "true";

  if (!isWebSocketOpen) {
    socket = initWebSocket(nickname);

    const handleKeyInput = (e, player) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        const msg = {
          Type: "game-update",
          Key: e.keyCode,
        };
        socket.send(JSON.stringify(msg));

      } else if (e.key == "Shift" && player.isMe() && player.getBomb() > 0 && noBombPlaced(player.getX(), player.getY())) {
            const msg = {
              Type: "game-update-bomb",
              X: player.getX(),
              Y: player.getY(),
              Range: player.getRange(),
              Player : player.getName(),
            };
            socket.send(JSON.stringify(msg));
      }
    };

    socket.onopen = () => localStorage.setItem("websocketOpen", "true");
    socket.onclose = () => localStorage.setItem("websocketOpen", "false");
    socket.onerror = (error) => console.log("WebSocket error: " + error);
    socket.onmessage = (event) => handleWebSocketMessage(event, socket);

    initEventListeners(socket, handleKeyInput);
  } else {
    chat.style.display = "";
    localStorage.setItem("websocketOpen", "false");
  }
}

const initWebSocket = (nickname) => {
  return new WebSocket("ws://localhost:8080/ws/" + nickname);
}

const handleWebSocketMessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "message") {
    const player = players.find(player => player.name === msg.nickname);
    if (player !== undefined) {
      const node = document.createElement("div");
      const picture = document.createElement("img");
      const playerName = document.createElement("p");
      playerName.className = "player-name-" + player.getColor();
      playerName.innerHTML = msg.nickname + ":";

      picture.src = "img/" + player.getColor() + "-front0.png";
      const textnode = document.createTextNode(msg.message);
      node.appendChild(picture);
      node.appendChild(playerName);
      node.appendChild(textnode);
      const chatContainer = document.getElementById("chat-messages");
      if (chatContainer !== null) {
        chatContainer.appendChild(node);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  } 

  if (msg.type === "wait-time" || msg.type === "timer") {
    if (msg.type === "wait-time") {
      waitTime = parseInt(msg.message);
    } else if (msg.type === "timer") {
      timer = parseInt(msg.message);
      waitTime = undefined;
    }
    fetchPlayersRenderWaitingTimer();
  }

  if (msg.type === "leave") {
    if (players.length === 2) {
      timer = undefined;
      waitTime = undefined;

      fetchPlayersRenderWaitingTimer();
    }
    if (!gameStarted) {
      fetchPlayersRenderWaitingTimer();
    }
    if (gameStarted) {
      const player = players.find(player => player.name === msg.nickname);
      if (player !== undefined) {
        player.remove();
        players.splice(players.indexOf(player), 1);
        if (players.length <= 1) {
          const winner = players.length === 1 ? players[0] : null;
          localStorage.setItem('winner', JSON.stringify(winner));
          setGameOver(true);
        }
      }
    }

    const node = document.createElement("div");
    const textnode = document.createTextNode(msg.nickname + " left the game");
    node.appendChild(textnode);
    let chatMessages = document.getElementById("chat-messages");
    if (chatMessages !== null) {
      chatMessages.appendChild(node);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  //movements of players
  if (msg.type === "game-update") {
    const player = players.find(player => player.name == msg.player);
    if (player !== undefined) {
      if (msg.key >= 37 && msg.key <= 40) {
          player.setDirection(msg.key);
          movePlayer(player);
      }
    }

  //dropping a bomb 
  } else if (msg.type=== "game-update-bomb") {
      const player = players.find(player => player.name == msg.player);
      player.dropBomb()

      const bomb = new Bomb(msg.x, msg.y, msg.range, player)
      animateBomb(bomb);

  //explosure of the bomb    
  } else if (msg.type  === "game-update-bomb-explode") {
      const player = players.find(player => player.name == msg.player);
      const bomb = new Bomb(msg.x, msg.y, msg.range, player)
      
      bomb.setId(msg.x + "-" +msg.y)
      bomb.setDiv(document.getElementById(bomb.getId()))

      createFlashPieces(bomb.getId(), bomb);
      destroyObjects(bomb.getId(), bomb, players);

      setTimeout(() => {
          removeFlashPieces(bomb.getId());

          const bombDiv = bomb.getDiv()
          if (bombDiv !== null) {
              bombDiv.remove();
          }
          bomb.explode();

      }, flashDuration)
  }
};

const initEventListeners = (socket, handleKeyInput) => {
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("input");
    const message = input.value;
    if (message.trim().length > 0) {
      input.value = "";
      const msg = { Type: "message", Message: message };
      socket.send(JSON.stringify(msg));
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
    }

    const player = players.find(player => player.me)

    if (player !== undefined && player.getLives() > 0 && canPlayerMove) {
      handleKeyInput(e, player);
      canPlayerMove = false
      setTimeout(() => {
        canPlayerMove = true
      }, 50)
    }
  });

  window.addEventListener("beforeunload", () => {
    resetGame();
    //redirect to root
    window.location.hash = "#/";
  });
}

function resetGame() {
  validateError = "";
  playerChecked = false;
  players = [];
  gameStarted = false;
  timer = undefined;
  waitTime = undefined;
  playersFetched = false;
  waitingError = undefined;
  canPlayerMove = true;

  const nickname = localStorage.getItem("nickname");
  const msg = { Type: "leave", nickname: nickname };
  socket.send(JSON.stringify(msg));
  removePlayerFromBackend(nickname);

  //close websocket for client
  socket.close();

  localStorage.removeItem("websocketOpen");
  localStorage.removeItem("nickname");
  localStorage.removeItem("winner");
}

Router();
