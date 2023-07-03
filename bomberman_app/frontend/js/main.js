import MiniFramework from "../mini_framework/mini-framework.js";
import { createMap } from "./map.js";

import { socket, isGameOver, resetGame, openChat, waitTime, timer, fetchPlayersRenderWaitingTimer, players, playersFetched, waitingError, gameStarted, validateError, playerChecked, checkPlayerAlreadyExists } from "./game.js";

const regex = /^[a-zA-Z0-9]+$/;

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
  const winner = localStorage.getItem("winner");
  const winnerColor = "img/" + localStorage.getItem("winnerColor") + "-front0.png";

  return `
  <MF>
  <div id="core-part" style="display: flex; align-items: center; flex-direction: column;">
  <div id="gameover">
      ${players.length === 1
        ? `<div id="gameover-text" style="color: white;">GAME OVER!<br>${winner} was the winner</div>
          <div><img class="winner-image" src="${winnerColor}"></div>`
        : `<div id="gameover-text" style="color: white;">GAME OVER!<br>No one won!</div>`}
        </div>
      <div>
        <a href="http://localhost:8080" class="button">Play a new game</a>
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
    } else if (window.location.hash == "#/gameover") {
      if (localStorage.getItem("winner") && localStorage.getItem("winnerColor") && Array.isArray(players) && players.length <= 1 && isGameOver) {
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

Router();
