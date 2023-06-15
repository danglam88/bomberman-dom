import MiniFramework from "../mini_framework/mini-framework.js";

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";

export const Header = () => {
    return `
    <MF>
    <header>
      <h1>BOMBERMAN • DOM</h1>
      <div class="howtoplay" style="text-align: center;">Use arrows to move, shift to place bombs</div>
      <div class="stats" style="height: 45px; width: 1125px; top: 130px;">
        <div class="lives">Lives: 3</div>
        <div class="timer">Time: 3:00</div>
        <div class="score">Score: 0</div>
      </div>
    </header>
    </MF>
    `;
}

export const Start = () => {
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
    <div class="core-part">
      <div id="game" class="game">
        ${Header()}
        <div class="naming" style="background: url(&quot;img/story.png&quot;); height: 540px; width: 1125px;">
          <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
          <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here..." onkeypress="validateInput">
          <div class="invalidnotice" style="align-self: center;">Only letters and numbers allowed</div>
          ${validateError !== "" ? `<div class="invalidnotice" style="align-self: center;">${validateError}</div>` : ""}
        </div>
      </div>
    </div>
    </MF>
    `;
}

const container = document.getElementById("root");
container.innerHTML = "";
MiniFramework.render(Start, container);

// Set focus on the input textfield when the page is loaded
window.onload = () => {
	const input = document.getElementById("nameplayer");
	if (input !== null) {
		input.focus();
	}
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
