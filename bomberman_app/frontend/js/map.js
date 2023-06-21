import MiniFramework from "../mini_framework/mini-framework.js";
import { Info } from "./main.js";
import { GameLogic } from "./game.js";

const mapWidth = 900;
const mapHeight = 900;

let givenMap;

function createMap(players) {
  console.log("createMap")
    fetch("/new_game")
    .then(response => response.json())
    .then(data => {
        givenMap = data;
        removeExtraPlayers(players);
        let container = document.getElementById("root")
        MiniFramework.render(PaintMap, container)
  
        GameLogic(players);
    })
    .catch(error => {
      console.error(error)
    })
}

const PaintMap = () => {
    return `
    <MF>
    <div class="core-part">
      <div id="game" class="game">
        <div id="info">${Info()}</div>
        <div id="map">
            <div class="map" style="background: url('img/grass.png'); height: ${mapHeight}px; width: ${mapWidth}px;">
              ${givenMap.map((object) => (
                  `<div class="${object.class}" style="${object.class.includes("player") ? "transform: translate(" + object.left + "px, " + object.top + "px);" : "top: " + object.top + "px; left: " + object.left+"px"}; background-image: ${object.image}; z-index: ${object.z}; "></div>`
              ))}
            </div>
        </div>
      </div>
    </div>
  </MF>
  `;
}

function removeExtraPlayers(players) {
  let addPlayers = players.length;
  for (let i = 0; i < givenMap.length; i++) {
    if (givenMap[i].class.includes("player")) {
      if (addPlayers <= 0) {
        givenMap.splice(i, 1);
      }
      addPlayers--;
    }
  }
}

//export default createMap;
export { createMap };
