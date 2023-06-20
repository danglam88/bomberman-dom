import MiniFramework from "../mini_framework/mini-framework.js";
import { Title, Info } from "./main.js";
import { GameLogic } from "./game.js";

const mapWidth = 900;
const mapHeight = 900;

let givenMap;

function createMap(players) {
    fetch("/new_game")
    .then(response => response.json())
    .then(data => {
      console.log(data)
        givenMap = data;
        let container = document.getElementById("root")
        MiniFramework.render(PaintMap, container)

        players.forEach((player) => {
          player.addDiv()
        })
  
        console.log(players)
  
        GameLogic(players);
    })
    .catch(error => {
      console.error(error)
    })
}

const PaintMap = () => {
    return `
    <MF>
    ${Title()}
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

//export default createMap;
export { createMap };
