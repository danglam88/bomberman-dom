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
    fetch("/players")
      .then((response) => response.json())
      .then((data) => {
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
      .catch((error) => {
        console.error(error);
      });
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
  return `
  <MF>
    <div class="map" style="background: url(&quot;img/grass.png&quot;); height: 900px; width: 900px;">
      <div class="player moving" style="transform: translate(5px, 10px); z-index: 2; background-image: url(&quot;img/blue-front0.png&quot;);"></div>
      <div class="player moving" style="transform: translate(850px, 10px); z-index: 2; background-image: url(&quot;img/dark-front0.png&quot;);">
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
      <div class="player moving" style="transform: translate(5px, 845px); z-index: 2; background-image: url(&quot;img/red-front0.png&quot;);"></div>
      <div class="player moving" style="transform: translate(850px, 845px); z-index: 2; background-image: url(&quot;img/purple-front0.png&quot;);"></div>
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
    console.log(msg);
    var node = document.createElement("div");
    var textnode = document.createTextNode(msg.nickname + ": " + msg.message);
    node.appendChild(textnode);
    document.getElementById("chat-messages").appendChild(node);
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
}

Router();
