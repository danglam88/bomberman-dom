import MiniFramework from "../mini_framework/mini-framework.js";
import { createMap } from "./map.js";
import { Player } from "./class.js";
import { GLOBAL_SPEED, movePlayer, animateBomb } from "./game.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let playerChecked = false;

let players = [];
let playersFetched = false;
let waitTime = undefined;
let timer = undefined;

let gameStarted = false;
let canPlayerMove = true;

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
            : `Counter is loading...`
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
      MiniFramework.render(Start, container);
    } else if (window.location.hash === "#/waiting") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length <= 3) {
        MiniFramework.render(Waiting, container);
        setTimeout(openChat, 100);
      } else {
        console.log("from waiting to root");
        window.location.hash = "#/";
        window.location.reload();
      }
    } else if (window.location.hash === "#/gamestart") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length <=4 && gameStarted) {
        createMap(players);
      } else {
        console.log("from gamestart to root");
        window.location.hash = "#/";
        window.location.reload();
      }
    }

    // Set focus on the input textfield when the page is loaded
    window.onload = () => {
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
  .then((response) => {
    if (response.status === 423) {
      throw new Error("Game is not available at the moment. Please try again later...");
    }
    return response.json()
  })
  .then((data) => {
    playersFetched = true;
    players = []

    data.forEach((player, i) => {
      console.log("player: ", player)
      players.push(new Player(player.name, player.x, player.y, player.color, GLOBAL_SPEED, i+1))
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

function openChat() {
  document.getElementById("chat").style.display = "";

  const nickname = localStorage.getItem("nickname");

  // Check if the WebSocket is already open
  if (localStorage.getItem("websocketOpen") !== "true") {
    var socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function () {
      // Set the flag in localStorage
      localStorage.setItem("websocketOpen", "true");

      var payload = JSON.stringify({
        type: "nickname",
        nickname: nickname,
      });
      socket.send(payload);
    };

    socket.onclose = function () {
      // Clear the flag in localStorage when the WebSocket is closed
      localStorage.setItem("websocketOpen", "false");
    };

    socket.onerror = function (error) {
      console.log("WebSocket error: " + error);
    };

    socket.onmessage = function (event) {
      var msg = JSON.parse(event.data);
    
      if (msg.type === "message") {
        let player = players.find(player => player.name === msg.nickname)
  
        var node = document.createElement("div");
        var picture = document.createElement("img");
        picture.src = "img/"+player.color+"-front0.png";
  
        var textnode = document.createTextNode(msg.nickname + ": " + msg.message);
        node.appendChild(picture);
        node.appendChild(textnode);
        var chatContainer = document.getElementById("chat-messages")
        chatContainer.appendChild(node);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      // if message type is join and the timer is not running, start the timer
      if (msg.type === "wait-time" || msg.type === "timer") {

        if (msg.type === "wait-time") {
          waitTime = parseInt(msg.message);
        } else if (msg.type === "timer") {
          timer = parseInt(msg.message);
          waitTime = undefined;
        }

        fetchPlayersRenderWaitingTimer();
      }

      // if message type is leave and the timer is running, stop the timer
      if (msg.type === "leave") {

        if (players.length == 2) {
          timer = undefined;
          waitTime = undefined;
        }

        fetchPlayersRenderWaitingTimer();

        var node = document.createElement("div");
        var textnode = document.createTextNode(msg.nickname + " left the game");

        node.appendChild(textnode);
        document.getElementById("chat-messages").appendChild(node);
      }

      if (msg.type = "game-update") {
        const player = players.find(player => player.name == msg.player)
        if (player !== undefined) {

          if (msg.key === 16) {
            console.log(msg)
            player.dropBomb()
            animateBomb(player)

            console.log(player.bomb)
          
            // Drop Bomb visualisation
          } else {
            // Move Player
            if (canPlayerMove) {
              player.setDirection(msg.key)
              movePlayer(player);
              canPlayerMove = false
              setTimeout(() => {
                canPlayerMove = true
              }, 50)
            }
          }
        }
      }
    };

    document.getElementById("form").addEventListener("submit", function (e) {
      e.preventDefault();

      var input = document.getElementById("input");
      var message = input.value;
      input.value = "";

      var msg = {
        Type: "message",
        Message: message,
      };

      socket.send(JSON.stringify(msg));
    }) // Call routeChange to handle initial page load

    //logic for a game (which needed a socket) 
    //todo maybe export socket (export handleKeyInput func at least)? 
    //todo set from onkeydown in MF template
    document.addEventListener('keydown', (e) => {
      handleKeyInput(e)
    });

    window.addEventListener("beforeunload", function (e) {
      //also check if game is started, to prevent staying in the game on hash change

      var msg = {
        Type: "leave",
        nickname: nickname,
      };

      socket.send(JSON.stringify(msg));
    });

    const handleKeyInput = (e) => {
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        const msg = {
          Type : "game-update",
          Key : e.keyCode
        };

        socket.send(JSON.stringify(msg));
      }

      if (e.key == "Shift") {
        const msg = {
          Type : "game-update",
          Key : e.keyCode
        };

        socket.send(JSON.stringify(msg));
      }
    };
  } else {
    document.getElementById("chat").style.display = "";
    // set websocketOpen to false if websocket is not open
    localStorage.setItem("websocketOpen", "false");
    // send user to root if websocket is not open
    console.log("from chat to root");
    //window.location.hash = "#/";
  };
}

Router();
