import MiniFramework from "../mini_framework/mini-framework.js";
import { createMap } from "./map.js";
import { Player } from "./class.js";
import { GLOBAL_SPEED, movePlayer, animateBomb, noBombPlaced } from "./game.js";

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
        <div class="lives">Lives: 3</div>
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
      <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here..." onkeypress="validateInput">
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
            : waitingError !== "" ? waitingError : `Counter is loading... localStorage: ${localStorage.getItem("nickname")}, players: ${JSON.stringify(players)}, waitTime: ${waitTime}, timer: ${timer}`
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
        console.log("from waiting to root");
        window.location.hash = "#/";
      }
    } else if (window.location.hash === "#/gamestart") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length <=4 && gameStarted) {
        createMap(players);
      } else {
        console.log("from gamestart to root");
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
      console.log("player: ", player)
      const isMe = player.name == localStorage.getItem("nickname")
      players.push(new Player(player.name, player.x, player.y, player.color, GLOBAL_SPEED, i+1, isMe))
    })

    console.log("players: ", players)

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

    const handleKeyInput = (e) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        const msg = {
          Type: "game-update",
          Key: e.keyCode,
          Pressed: true,
        };
        socket.send(JSON.stringify(msg));
      } else if (e.key == "Shift") {
        const player = players.find(player => player.me)

        if (player.getBomb() > 0 && noBombPlaced(player.getX(), player.getY())) {
          const msg = {
            Type : "game-update",
            Key : e.keyCode,
            Pressed: true,
          };

          socket.send(JSON.stringify(msg));
        }
      }
    };

    const handleKeyOutput = (e) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        const msg = {
          Type: "game-update",
          Key: e.keyCode,
          Pressed: false,
        };
        socket.send(JSON.stringify(msg));
      }
    };

    socket.onopen = () => localStorage.setItem("websocketOpen", "true");
    socket.onclose = () => localStorage.setItem("websocketOpen", "false");
    socket.onerror = (error) => console.log("WebSocket error: " + error);
    socket.onmessage = (event) => handleWebSocketMessage(event, socket);

    initEventListeners(socket, handleKeyInput, handleKeyOutput);
  } else {
    chat.style.display = "";
    localStorage.setItem("websocketOpen", "false");
    console.log("from chat to root");
    //window.location.hash = "#/";
  }
}

const initWebSocket = (nickname) => {
  return new WebSocket("ws://localhost:8080/ws/" + nickname);
}

const handleWebSocketMessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "message") {
    const player = players.find(player => player.name === msg.nickname);
    const node = document.createElement("div");
    const picture = document.createElement("img");
    picture.src = "img/" + player.color + "-front0.png";
    const textnode = document.createTextNode(msg.nickname + ": " + msg.message);
    node.appendChild(picture);
    node.appendChild(textnode);
    const chatContainer = document.getElementById("chat-messages");
    chatContainer.appendChild(node);
    chatContainer.scrollTop = chatContainer.scrollHeight;
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
    }
    if (!gameStarted) {
      fetchPlayersRenderWaitingTimer();
    }
    const node = document.createElement("div");
    const textnode = document.createTextNode(msg.nickname + " left the game");
    node.appendChild(textnode);
    document.getElementById("chat-messages").appendChild(node);
  }

  if (msg.type === "game-update") {
    const player = players.find(player => player.name == msg.player);
    if (player !== undefined) {
      if (msg.key === 16) {
        if (player.getBomb() > 0 && noBombPlaced(player.getX(), player.getY())) {
          animateBomb(player.dropBomb());
        }
      } else if (msg.key >= 37 && msg.key <= 40) {
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
    }
  }
};


const initEventListeners = (socket, handleKeyInput, handleKeyOutput) => {
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("input");
    const message = input.value;
    input.value = "";
    const msg = { Type: "message", Message: message };
    socket.send(JSON.stringify(msg));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
    }
    handleKeyInput(e);
  });

  window.addEventListener('keyup', handleKeyOutput);

  window.addEventListener("beforeunload", (e) => {
    const nickname = localStorage.getItem("nickname");
    const msg = { Type: "leave", nickname: nickname };
    socket.send(JSON.stringify(msg));
  });
}


Router();
