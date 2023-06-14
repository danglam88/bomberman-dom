import MiniFramework from "../../mini_framework/mini-framework.js";

const Start = () => {
    return `
    <MF>
    <h1>BOMBERMAN • DOM</h1>
    <div id="game" class="game">
      <div class="howtoplay" style="text-align: center;">Use arrows to move, shift to place bombs</div>
      <div class="stats" style="height: 45px; width: 1125px; top: 130px;">
        <div class="lives">Lives: 3</div>
        <div class="timer">Time: 3:00</div>
        <div class="score">Score: 0</div>
      </div>
      <div class="naming" style="background: url(&quot;bomberman_app/img/story.png&quot;); height: 540px; width: 1125px;">
        <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
        <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here...">
        <div class="invalidnotice" style="align-self: center;">Only letters and numbers allowed</div>
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
