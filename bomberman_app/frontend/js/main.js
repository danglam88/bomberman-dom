import MiniFramework from "../mini_framework/mini-framework.js";
import { createMap } from "./map.js";
import { Player } from "./class.js";
import { GLOBAL_SPEED } from "./game.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let players = [];

let playersFetched = false;
let waitTime = undefined;
let timer = undefined;

const waitTimeConst = 20;
const timerConst = 10;

let timerTimestamp = undefined;
let waitTimeActivated = false;
let timerActivated = false;

let gameStarted = false;

export const Title = () => {
  return `
  <MF>
    <h1>BOMBERMAN • DOM</h1>
  </MF>
  `;
};

export const Info = () => {
  return `
    <MF>
      <div class="howtoplay" style="text-align: center;">Use arrows to move, shift to place bombs</div>
      <div class="stats" style="height: 45px; width: 900px; top: 130px;">
        <div class="lives">Lives: 3</div>
        <div class="timer">Time: 3:00</div>
        <div class="score">Score: 0</div>
      </div>
    </MF>
    `;
};

export const Naming = () => {
  const validateInput = (event) => {
    if (!regex.test(event.key) && event.key !== "Enter") {
      event.preventDefault();
    } else if (event.key === "Enter" && event.target.value !== "") {
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: event.target.value }),
      };

      fetch("/validate", options)
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem("nickname", event.target.value);
            window.location.hash = "#/waiting";
          } else if (response.status === 409) {
            validateError =
              "Nickname was already taken, please choose another one";
            MiniFramework.updateState();
          } else if (response.status === 429) {
            validateError =
              "There are already 4 players in the game, please try again later";
            MiniFramework.updateState();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  MiniFramework.defineFunc(validateInput);

  return `
  <MF>
    ${(localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0) || (Array.isArray(players) && players.length === 4) || gameStarted
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
              waitTime > 0
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
              timer > 0
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
            : `Game is not available at the moment. Please try again later...`
        }
      </div>
    </div>
  </MF>
  `;
};

export const Start = () => {
  return `
  <MF>
    ${Title()}
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
    ${Title()}
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
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length <= 3 && !gameStarted) {
        MiniFramework.render(Waiting, container);
        setTimeout(openChat, 100);
      } else {
        window.location.hash = "#/";
      }
    } else if (window.location.hash === "#/gamestart") {
      if (localStorage.getItem("nickname") && localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length <=4 && gameStarted) {
        createMap(players);
      } else {
        window.location.hash = "#/";
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

function fetchPlayersRenderWaitingTimer() {
  fetch("/players")
  .then((response) => response.json())
  .then((data) => {
    playersFetched = true;

    players = []

    data.forEach((player, i) => {
      players.push(new Player(player.name, player.color, GLOBAL_SPEED, i+1))
    })

    console.log("ww", players)

    if (timerTimestamp === undefined) {
      if (data.length === 2) {
        console.log("waitTime timer 2: ");
        waitTime = waitTimeConst;
        timer = timerConst;
      } else if (data.length === 4) {
        console.log("waitTime timer 4: ");
        waitTime = 0;
        timer = timerConst;
      }
    } else {
      // Parse the timestamp into a Date object
      const date = new Date(timerTimestamp);
      // Get the timestamp in milliseconds from the parsed date
      const givenTimestamp = date.getTime();
      const diff = Date.now() - givenTimestamp;

      if (diff <= 20000) {
        console.log("diff small: ", diff);
        waitTime = players.length === 4 ? 0 : Math.floor((20000 - diff) / 1000);
        timer = timerConst;
        console.log("small diff: ", waitTime);
      } else {
        console.log("diff big: ", diff);
        waitTime = 0;
        timer = Math.floor((30000 - diff) / 1000);
        console.log("big diff: ", timer);
      }
    }

    MiniFramework.updateState();

    if (waitTime !== undefined && !waitTimeActivated) {
      console.log("waitTime activated: ", waitTime);
      waitTimeActivated = true;

      const waitTimeId = setInterval(() => {
        if (waitTime > 0) {
          waitTime--;
          MiniFramework.updateState();
        }

        if (waitTime === 0) {
          clearInterval(waitTimeId);

          console.log("timer out 1: ", timer);
          if (timer !== undefined && !timerActivated) {
            console.log("timer in 1: ", timer);
            timerActivated = true;

            const timerId = setInterval(() => {
              console.log("timer setinterval: ", timer);
              if (timer > 0) {
                timer--;
                MiniFramework.updateState();
              }

              if (timer === 0) {
                clearInterval(timerId);

                gameStarted = true;
                window.location.hash = "#/gamestart";
              }
            }, 1000);
            console.log("timer in 2: ", timer);
          }
          console.log("timer out 2: ", timer);
        }
      }, 1000);
    }
  })
  .catch((error) => {
    console.error(error);
  });
}

function openChat() {
  const chatDiv = document.createElement("div");
  chatDiv.id = "player-chat";
  const form = document.createElement("form")
  const input = document.createElement("input")
  const button = document.createElement("button")
  form.id = "form"
  button.innerText = "Send"
  input.id = "input"
  form.appendChild(input)
  form.appendChild(button)
  chatDiv.appendChild(form)
  const chatMessages = document.createElement('div')
  chatMessages.id = "chat-messages"
  chatMessages.className = "chat-messages"
  chatDiv.appendChild(chatMessages)
  document.getElementById("core-part").appendChild(chatDiv);
  console.log(document.getElementById("player-chat"))
  console.log("openChat")
  const nickname = localStorage.getItem("nickname");
  console.log(nickname)

  var socket = new WebSocket("ws://localhost:8080/ws");

  socket.onopen = function () {
    console.log("Connected!");

    var payload = JSON.stringify({
      type: "nickname",
      nickname: nickname,
    });

    socket.send(payload);
  };

  socket.onerror = function (error) {
    console.log("WebSocket error: " + error);
  };

  socket.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    
    if (msg.type === "message") {
  
      var node = document.createElement("div");
      var textnode = document.createTextNode(msg.nickname + ": " + msg.message);
      node.appendChild(textnode);
      document.getElementById("chat-messages").appendChild(node);
    }
    // if message type is join and the timer is not running, start the timer
    if (msg.type === "join") {
      console.log("timestamp 1-2: ", msg.timestamp);
      console.log("players-length: ", players.length);
      if (players.length >= 3 && players.length <= 4) {
        console.log("timestamp 3-4: ", msg.timestamp);
        timerTimestamp = msg.timestamp;
        console.log("timerTimestamp: ", timerTimestamp);
      }
      fetchPlayersRenderWaitingTimer();
    }

    // if message type is leave and the timer is running, stop the timer
    if (msg.type === "leave") {
      

      if (players.length == 2) {
        timerTimestamp = undefined;
        timer = undefined;
        waitTime = undefined;
        timerActivated = false;
        waitTimeActivated = false;

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
        player.setDirection(msg.key)
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
  };
}

Router();
