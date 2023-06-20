import MiniFramework from "../mini_framework/mini-framework.js";
import { Title, Info, Chat} from "./main.js";

const mapWidth = 900;
const mapHeight = 900;

let givenMap;

async function createMap() {
    fetch("/new_game")
    .then(response => response.json())
    .then(data => {
        givenMap = data;
        let container = document.getElementById("root")
        MiniFramework.render(PaintMap, container)
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
                  `<div class="${object.Class}" style="${object.Class.includes("player") ? "transform: translate(" + object.Left + "px, " + object.Top + "px);" : "top: " + object.Top + "px; left: " + object.Left+"px"}; background-image: ${object.Image}; z-index: ${object.Z}; "></div>`   
              ))}
            </div>
        </div>
        </div>
      ${Chat()}
    </div>
  </MF>
  `;
}

//export default createMap;
export { createMap };
