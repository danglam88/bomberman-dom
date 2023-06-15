import MiniFramework from "../mini_framework/mini-framework.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let players = [];
let playersFetched = false;
let waitTime = undefined;
let timer = undefined;

export const Title = () => {
  return `
  <MF>
    <h1>BOMBERMAN • DOM</h1>
  </MF>
  `;
}

export const Chat = () => {
  return `
  <MF>
    <div class="player-chat">
      <h2>CHAT</h2>
      <p>Wait for other players...</p>
    </div>
  </MF>
  `;
}

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
}

export const Naming = () => {
  const validateInput = (event) => {
    if (!regex.test(event.key) && event.key !== "Enter") {
      event.preventDefault();
    } else if (event.key === "Enter" && event.target.value !== "") {
      let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "nickname": event.target.value })
      };

      fetch("/validate", options)
        .then(response => {
          if (response.status === 200) {
            localStorage.setItem("nickname", event.target.value);
            window.location.hash = "#/waiting";
          } else if (response.status === 409) {
            validateError = "Nickname was already taken, please choose another one";
            MiniFramework.updateState();
          } else if (response.status === 429) {
            validateError = "There are already 4 players in the game, please try again later";
            MiniFramework.updateState();
          }
        })
        .catch(error => {
          console.error(error)
        })
    }
  }

  MiniFramework.defineFunc(validateInput)

  return `
  <MF>
    <div class="naming" style="background: url(&quot;img/story.png&quot;); height: 900px; width: 900px;">
      <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
      <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here..." onkeypress="validateInput">
      <div class="invalidnotice" style="align-self: center;">Only letters and numbers are allowed</div>
      ${validateError !== "" ? `<div class="invalidnotice" style="align-self: center;">${validateError}</div>` : ""}
    </div>
  </MF>
  `;
}

export const Counter = () => {
  if (!playersFetched) {
  fetch("/players")
    .then(response => response.json())
    .then(data => {
      playersFetched = true;
      players = data;

      if (data.length > 1 && data.length <= 4) {
        timer = 10;
      }

      if (data.length > 1 && data.length < 4) {
        waitTime = 20;
      }

      MiniFramework.updateState();

      if (waitTime !== undefined) {
        const waitTimeId = setInterval(() => {
          waitTime--;
          MiniFramework.updateState();

          if (waitTime === 0) {
            clearInterval(waitTimeId);

            if (timer !== undefined) {
              const timerId = setInterval(() => {
                timer--;
                MiniFramework.updateState();

                if (timer === 0) {
                  clearInterval(timerId);
                  window.location.hash = "#/gamestart";
                }
              }, 1000);
            }
          }
        }, 1000);
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  return `
  <MF>
    <div class="start" style="background: url(&quot;img/story.png&quot;); height: 900px; width: 900px;">
      <div class="storytext" style="align-self: center;">
        ${localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length === 1
          ? `You (${localStorage.getItem("nickname")}) are the only one who joined the game. Let's wait for other players...`
          : localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length < 4 && waitTime !== undefined && waitTime > 0
            ? `There are totally ${players.length} players in the game: You (${localStorage.getItem("nickname")}), ${players.filter(player => player.name !== localStorage.getItem("nickname")).map(player => player.name).join(", ")}. Let's wait for ${waitTime} more seconds...`
            : localStorage.getItem("nickname").trim().length > 0 && Array.isArray(players) && players.length > 1 && players.length <= 4 && timer !== undefined && timer > 0
              ? `There are totally ${players.length} players in the game: You (${localStorage.getItem("nickname")}), ${players.filter(player => player.name !== localStorage.getItem("nickname")).map(player => player.name).join(", ")}. Game will start in ${timer} seconds...`
              : "Please type in your nickname first"}
      </div>
    </div>
  </MF>
  `;
}

export const Start = () => {
  return `
  <MF>
    ${Title()}
    <div class="core-part">
      <div id="game" class="game">
        ${Info()}
        ${Naming()}
      </div>
      ${Chat()}
    </div>
  </MF>
  `;
}

export const Waiting = () => {
  return `
  <MF>
    ${Title()}
    <div class="core-part">
      <div id="game" class="game">
        ${Info()}
        ${Counter()}
      </div>
      ${Chat()}
    </div>
  </MF>
  `;
}

function Router() {
	function routeChange() {
		const container = document.getElementById("root");
		container.innerHTML = "";
    if (window.location.hash !== "#/waiting" && window.location.hash !== "#/gamestart" && window.location.hash !== "#/gameover") {
		  MiniFramework.render(Start, container);
    } else if (window.location.hash === "#/waiting") {
      MiniFramework.render(Waiting, container);
    }

		// Set focus on the input textfield when the page is loaded
		window.onload = () => {
		  const input = document.querySelector("#nameplayer");
		  if (input !== null) {
				input.focus();
		  }
		}
	}

	// Call routeChange every time the hash is changed in the url
	window.onhashchange = routeChange;
	routeChange(); // Call routeChange to handle initial page load
}

Router();
