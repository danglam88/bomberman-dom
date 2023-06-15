import MiniFramework from "../../mini_framework/mini-framework.js";
import createMap from "./game_map.js";

let playername = "";
let playernames = [];
let nickNameAdded = false;
let gameStarted = false;

const Start = () => {
    return `
    <MF>
    <h1>BOMBERMAN • DOM</h1>
    <div class="core-part">
      <div id="game" class="game">
        <div class="howtoplay" style="text-align: center;">Use arrows to move, shift to place bombs</div>
        <div class="stats" style="height: 45px; width: 900px; top: 130px;">
          <div class="lives">Lives: 3</div>
          <div class="timer">Time: 3:00</div>
          <div class="score">Score: 0</div>
        </div>
      </div>
      <div class="player-chat">
        <h2>CHAT</h2>
        <p>Wait for other players...</p>
      </div>
    </div>
    </MF>
    `;
}

const EnterName = () => {
    return `
    <MF>
        <div class="naming" style="background: url(&quot;bomberman_app/img/story.png&quot;); height: 900px width: 900px;">
          <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
          <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here...">
          <div class="invalidnotice" style="align-self: center;">Only letters and numbers allowed</div>
        </div>
    </MF>
    `;
}

const WaitingView = () => {
    return `
    <MF>
    <div class="await-players">Waiting for other Players</div>
    </MF>
    `;
}


let container = document.getElementById("root");
container.innerHTML = "";
MiniFramework.render(Start, container);

createMap();


// Set focus on the input textfield when the page is loaded
window.onload = () => {
	const input = document.getElementById("nameplayer");
	if (input !== null) {
		input.focus();
	}
}
