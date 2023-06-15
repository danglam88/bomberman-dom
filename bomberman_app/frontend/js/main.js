import MiniFramework from "../../../mini_framework/mini-framework.js";

const regex = /^[a-zA-Z0-9]+$/;

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
};

export const Start = () => {
  const validateInput = (event) => {
    if (!regex.test(event.key) && event.key !== "Enter") {
      event.preventDefault();
    } else if (!regex.test(event.key)) {
      console.log("not validated?")
    } else if (event.key == "Enter"){
      localStorage.setItem("playerName", event.target.value)
      openChat()
    }
  };

  MiniFramework.defineFunc(validateInput);

  return `
    <MF>
    <div class="core-part">
      <div id="game" class="game">
        ${Header()}
        <div class="naming" style="background: url(&quot;img/story.png&quot;); height: 540px; width: 1125px;">
          <div class="textfield" style="align-self: center;">Type in your nickname, then press ENTER</div>
          <input class="playername" id="nameplayer" maxlength="15" placeholder="add nickname here?" onkeypress="validateInput">
          <div class="invalidnotice" style="align-self: center;">Only letters and numbers allowed</div>
        </div>
      </div>
    </div>
    </MF>
    `;
};

const container = document.getElementById("root");
container.innerHTML = "";
MiniFramework.render(Start, container);

// Set focus on the input textfield when the page is loaded
window.onload = () => {
  const input = document.getElementById("nameplayer");
  if (input !== null) {
    input.focus();
  }
};

function openChat() {
  const chatDiv = document.createElement("div");
  chatDiv.id = "chat2";
  document.getElementById("chat").appendChild(chatDiv);

  const playerName = localStorage.getItem("playerName")

  var socket = new WebSocket("ws://localhost:8080/ws");

  socket.onopen = function () {
    console.log("Connected!");

    var payload = JSON.stringify({
      type: "playerName",
      playerName: playerName
    })

    socket.send(payload)
  };

  socket.onerror = function (error) {
    console.log("WebSocket error: " + error);
  };

  socket.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    var node = document.createElement("div");
    var textnode = document.createTextNode(msg.username + ": " + msg.message);
    node.appendChild(textnode);
    document.getElementById("chat").appendChild(node);
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
  });
}
