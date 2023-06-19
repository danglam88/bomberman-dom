import MiniFramework from "../mini_framework/mini-framework.js";
import { Player } from "./class.js";

const GLOBAL_SPEED = 10

const regex = /^[a-zA-Z0-9]+$/;
let validateError = "";
let players = [];

let playersFetched = false;
let waitTime = undefined;
let timer = undefined;


//todo 
const playerStartTop = 10;
const playerStartLeft = 5;
const playerSize = 45;
const playerNameMaxLength = 15;
const tileSize = 45;
const brickSize = 45;
const superBrickSize = 45;
const wallSize = 45;
const tileDuration = 500;
const stopDuration = 500;
const flashDuration = 500;
const appearDuration = 500;
const screamDuration = 500;
const bombDuration = 3000;
const invincibleDuration = 5000;
const bombSize = 33;
const doorSize = 33;
const giftSize = 33;
const startGhostsNo = 4;
const superGhostWidth = 50;
const superGhostHeight = 65;
const ghostWidth = 62;
const ghostHeight = 65;
const ghostMaxStepsNo = 10;
const ghostPoints = 100;
const superGhostPoints = 200;
const mapWidth = 900;
const mapHeight = 900;
const mapMarginTop = 15;
const mapMarginBottom = 60;
const mapMarginLeft = 5;
const mapMarginRight = 55;
const totalTime = 181000;
const hintStart = 121000;
const lifePoints = 200;
const intervalDuration = 100;
const oneStepSize = 10;
const highScoresNo = 5;
const probability = 0.9;
const allDirections = ["Up", "Down", "Left", "Right"];
const livesInfoGapTop = 70;
const livesInfoGapLeft = 20;
const popupDuration = 4000;
const scoreGoal = 1000;

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
            setTimeout(openChat, 100);
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
          localStorage.getItem("nickname").trim().length > 0 &&
          Array.isArray(players) &&
          players.length === 1
            ? `You (${localStorage.getItem(
                "nickname"
              )}) are the only one who joined the game. Let's wait for other players...`
            : localStorage.getItem("nickname").trim().length > 0 &&
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
            : localStorage.getItem("nickname").trim().length > 0 &&
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
            : "Please type in your nickname first"
        }
      </div>
    </div>
  </MF>
  `;
};

export const GameMap = () => {

  //todo add player1 - player4 classes to map generation
  return `
    <MF>
    <div class="map" style="background: url(&quot;img/grass.png&quot;); height: 900px; width: 900px;">
      <div class="player moving player1" style="transform: translate(5px, 10px); z-index: 2; background-image: url(&quot;img/blue-front0.png&quot;);"></div>
      <div class="player moving player2" style="transform: translate(850px, 10px); z-index: 2; background-image: url(&quot;img/dark-front0.png&quot;);">
      </div><div class="ghost moving" style="z-index: 2; transform: translate(450px, 45px); background-image: url(&quot;img/ghost.gif&quot;);"></div>
      <div class="wall" style="top: 90px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 90px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 90px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 90px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 90px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 90px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 225px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="ghost moving" style="z-index: 2; transform: translate(810px, 270px); background-image: url(&quot;img/ghost.gif&quot;);"></div>
      <div class="wall" style="top: 360px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 360px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 360px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 360px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 360px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 360px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="ghost moving" style="z-index: 2; transform: translate(540px, 405px); background-image: url(&quot;img/ghost.gif&quot;);"></div>
      <div class="ghost moving" style="z-index: 2; transform: translate(810px, 405px); background-image: url(&quot;img/ghost.gif&quot;);"></div>
      <div class="wall" style="top: 495px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 495px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 495px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 495px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 495px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 495px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 630px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 90px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 225px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 360px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 495px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 630px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="wall" style="top: 765px; left: 765px; z-index: 1; background-image: url(&quot;img/wall.png&quot;);"></div>
      <div class="player moving player3" style="transform: translate(5px, 845px); z-index: 2; background-image: url(&quot;img/red-front0.png&quot;);"></div>
      <div class="player moving player4" style="transform: translate(850px, 845px); z-index: 2; background-image: url(&quot;img/purple-front0.png&quot;);"></div>
      <div class="brick multiple-bombs-gift" style="top: 225px; left: 720px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick bomb-range-gift" style="top: 135px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick life-gift" style="top: 225px; left: 270px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick multiple-bombs-gift" style="top: 540px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick bomb-range-gift" style="top: 315px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick speed-gift" style="top: 855px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick speed-gift" style="top: 585px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick life-gift" style="top: 495px; left: 405px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 0px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 135px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 540px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 45px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 180px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 315px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 180px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 135px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 675px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 0px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 675px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 585px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 675px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 855px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 270px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 405px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 135px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 585px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 540px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 720px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 0px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 450px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 270px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 180px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 810px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 450px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 585px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 855px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 720px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 135px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 540px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 405px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 45px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 0px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 585px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 540px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 675px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 540px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 450px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 675px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 450px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 270px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 270px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 855px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 450px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 675px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 675px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 45px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 315px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 720px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 675px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 855px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 720px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 810px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 450px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 45px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 405px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 585px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 180px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 855px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 585px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 405px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 180px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 540px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 270px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 450px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 180px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 405px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 630px; left: 810px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 405px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 585px; left: 495px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 810px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 270px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 135px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 315px; left: 360px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 0px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 405px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 315px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 720px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 450px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 225px; left: 135px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 720px; left: 90px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 810px; left: 630px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 720px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 0px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 45px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 765px; left: 675px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 90px; left: 450px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 360px; left: 585px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 270px; left: 765px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 495px; left: 450px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
      <div class="brick" style="top: 540px; left: 225px; z-index: 1; background-image: url(&quot;img/brick.png&quot;);"></div>
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
        ${Info()}
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
        ${Info()}
        ${Counter()}
      </div>
    </div>
  </MF>
  `;
};

const GameLogic = () => {
  let isGameOver = false
  let isGamePaused = false
  let previousTimeStamp = 0

  
  players.forEach((player) => {
    player.addDiv()
  });

  const gameLoop = (timestamp, players) => {

  // Check if game over
  if (isGameOver) {
      return;
  }

    // Check that all characters moving with global speed and not moving while pause
  if ((timestamp < previousTimeStamp + GLOBAL_SPEED) || isGamePaused) {
      window.requestAnimationFrame(function(timestamp) {
          gameLoop(timestamp, players);
  });

    return;
  }

  previousTimeStamp = timestamp;

  // Move Player
  players.forEach((player) => {
      movePlayer(player);
  });

  window.requestAnimationFrame(function(timestamp) {
      gameLoop(timestamp, players);
  });
}

  const movePlayer = (player) => {

        if (player.div !== null) {
            let transValue = player.div.style.transform;

            let currentTop = transValue.substring(transValue.indexOf(" ") + 1, transValue.indexOf(")"));
            currentTop = currentTop.replace("px", "");
            currentTop = parseInt(currentTop);

            let currentLeft = transValue.substring(transValue.indexOf("(") + 1, transValue.indexOf(","));
            currentLeft = currentLeft.replace("px", "");
            currentLeft = parseInt(currentLeft);

            let background = player.div.style.background;

            let topBarrier;
            let leftBarrier;

            switch (player.direction) {
                case "ArrowUp":
                    if (currentTop > mapMarginTop) {
                        currentTop -= oneStepSize;
                    }

                    topBarrier = barrierCheck(currentTop, currentLeft, "Up", "Player");

                    if (topBarrier !== undefined) {
                        currentTop = topBarrier;
                    }

                    player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                    if (background === 'url("./img/' + player.color + '-back1.png")') {
                        player.div.style.background = 'url("./img/' + player.color + '-back2.png")';
                    } else {
                        player.div.style.background = 'url("./img/' + player.color + '-back1.png")';
                    }

                    break;
                case "ArrowDown":
                    if (currentTop < mapHeight - mapMarginBottom) {
                        currentTop += oneStepSize;
                    }

                    topBarrier = barrierCheck(currentTop, currentLeft, "Down", "Player");

                    if (topBarrier !== undefined) {
                        currentTop = topBarrier;
                    }

                    player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                    if (background === 'url("./img/' + player.color + '-front1.png")') {
                        player.div.style.background = 'url("./img/' + player.color + '-front2.png")';
                    } else {
                        player.div.style.background = 'url("./img/' + player.color + '-front1.png")';
                    }

                    break;
                case "ArrowLeft":
                    if (currentLeft > mapMarginLeft) {
                        currentLeft -= oneStepSize;
                    }

                    leftBarrier = barrierCheck(currentTop, currentLeft, "Left", "Player");

                    if (leftBarrier !== undefined) {
                        currentLeft = leftBarrier;
                    }

                    player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                    if (background === 'url("./img/' + player.color + '-left1.png")') {
                        player.div.style.background = 'url("./img/' + player.color + '-left2.png")';
                    } else {
                        player.div.style.background = 'url("./img/' + player.color + '-left1.png")';
                    }

                    break;
                case "ArrowRight":
                    if (currentLeft < mapWidth - mapMarginRight) {
                        currentLeft += oneStepSize;
                    }

                    leftBarrier = barrierCheck(currentTop, currentLeft, "Right", "Player");

                    if (leftBarrier !== undefined) {
                        currentLeft = leftBarrier;
                    }

                    player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                    if (background === 'url("./img/' + player.color + '-right1.png")') {
                        player.div.style.background = 'url("./img/' + player.color + '-right2.png")';
                    } else {
                        player.div.style.background = 'url("./img/' + player.color + '-right1.png")';
                    }

                    break;
            }

            if (player.direction === null) {
                let background = player.div.style.background;

                switch (true) {
                    case background === 'url("./img/' + player.color + '-back0.png")' || background === 'url("./img/' + player.color + '-back1.png")' || background === 'url("./img/' + player.color + '-back2.png")':
                        player.div.style.background = 'url("./img/' + player.color + '-back0.png")';
                        break;
                    case background === 'url("./img/' + player.color + '-front0.png")' || background === 'url("./img/' + player.color + '-front1.png")' || background === 'url("./img/' + player.color + '-front2.png")':
                        player.div.style.background = 'url("./img/' + player.color + '-front0.png")';
                        break;
                    case background === 'url("./img/' + player.color + '-left0.png")' || background === 'url("./img/' + player.color + '-left1.png")' || background === 'url("./img/' + player.color + '-left2.png")':
                        player.div.style.background = 'url("./img/' + player.color + '-left0.png")';
                        break;
                    case background === 'url("./img/' + player.color + '-right0.png")' || background === 'url("./img/' + player.color + '-right1.png")' || background === 'url("./img/' + player.color + '-right2.png")':
                        player.div.style.background = 'url("./img/' + player.color + '-right0.png")';
                        break;
                }
            }

            //todo temp
            player.direction = null
        }
  }

    // function that checks if players and ghosts can move in the direction they want to,
// and if they can, it moves them. Checks also if the player is killed by a ghost
const barrierCheck = (currentTop, currentLeft, direction) => {
 
  let walls = document.querySelectorAll(".wall");

  for (let i = 0; i < walls.length; i++) {
      let wallTop = walls[i].style.top;
      wallTop = wallTop.replace("px", "");
      wallTop = parseInt(wallTop);

      let wallLeft = walls[i].style.left;
      wallLeft = wallLeft.replace("px", "");
      wallLeft = parseInt(wallLeft);

      if (currentTop + playerSize > wallTop && currentTop < wallTop + wallSize && currentLeft + playerSize > wallLeft && currentLeft < wallLeft + wallSize) {
          switch (direction) {
              case "Up":
                  return wallTop + wallSize;
              case "Down":
                  return wallTop - wallSize;
              case "Left":
                  return wallLeft + wallSize;
              case "Right":
                  return wallLeft - wallSize;
          }
      }
  }

  let bricks = document.querySelectorAll(".brick");

  for (let i = 0; i < bricks.length; i++) {
      let brickTop = bricks[i].style.top;
      brickTop = brickTop.replace("px", "");
      brickTop = parseInt(brickTop);

      let brickLeft = bricks[i].style.left;
      brickLeft = brickLeft.replace("px", "");
      brickLeft = parseInt(brickLeft);

      if (currentTop + playerSize > brickTop && currentTop < brickTop + brickSize && currentLeft + playerSize > brickLeft && currentLeft < brickLeft + brickSize) {
          switch (direction) {
              case "Up":
                  return brickTop + brickSize;
              case "Down":
                  return brickTop - brickSize;
              case "Left":
                  return brickLeft + brickSize;
              case "Right":
                  return brickLeft - brickSize;
          }
      }
  }

  return undefined;
}


  gameLoop(0, players)
}

export const GameStart = () => {

  return `
  <MF>
    ${Title()}
    <div id="core-part" class="core-part">
      <div id="game" class="game">
        ${Info()}
        ${GameMap()}
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
      MiniFramework.render(Waiting, container);
    } else if (window.location.hash === "#/gamestart") {
      MiniFramework.render(GameStart, container);
      GameLogic()
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
      players.push(new Player(player.name, player.x, player.y, player.color, i+1))
    })

    if (data.length > 1 && data.length <= 4) {
      timer = 1;
    }

    if (data.length > 1 && data.length < 4) {
      waitTime = 2;
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
      fetchPlayersRenderWaitingTimer();


      
    }

    // if message type is leave and the timer is running, stop the timer
    if (msg.type === "leave")
      if (timer != undefined) {
      clearInterval(timer);
      timer = undefined;
    }

    if (msg.type = "game-update") {
      const player = players.find(player => player.name == msg.player)
      player.setDirection(msg.key)
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