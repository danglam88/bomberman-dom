import MiniFramework from "../mini_framework/mini-framework.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let nickname = "";

export const PlayerName = () => {
  return `
  <MF>
    ${nickname}
  </MF>
  `;
}

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
            nickname = event.target.value;
            window.location.hash = "#/counter";
          } else if (response.status === 409) {
            validateError = "Nickname already taken, please choose another one";
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
      <div class="invalidnotice" style="align-self: center;">Only letters and numbers allowed</div>
      ${validateError !== "" ? `<div class="invalidnotice" style="align-self: center;">${validateError}</div>` : ""}
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

function Router() {
	function routeChange() {
		const container = document.getElementById("root");
		container.innerHTML = "";
    if (window.location.hash !== "#/counter" && window.location.hash !== "#/game" && window.location.hash !== "#/gameover") {
		  MiniFramework.render(Start, container);
    } else {
      console.log("Game started");
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
