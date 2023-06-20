import MiniFramework from "../mini_framework/mini-framework.js";
import { Title, Info, Chat} from "./main.js";

const mapWidth = 900;
const mapHeight = 900;
const tileSize = 45;

const player1StartTop = 10;
const player1StartLeft = 5;
const player2StartTop = mapHeight - 55;
const player2StartLeft = mapWidth - 50;
const player3StartTop = 10;
const player3StartLeft = mapWidth - 50;
const player4StartTop = mapHeight - 55;
const player4StartLeft = 5;

const multipleBombsGift = 2;
const bombRangeGift = 2;
const speedGift = 2;
const lifeGift = 2;
const bricksNo = 100;

let givenMap;

// 0 = empty/ghost, 1 = wall, 2 = brick, 3 = player1, 4 = safe-zone, 5 = player2, 6 = player3, 7 = player4
const level = [
    [3, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 6],
    [4, 4, 2, 4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4, 2, 4, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4],
    [4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [4, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4],
    [4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4],
    [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [4, 4, 2, 4, 4, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 4, 4, 2, 4, 4],
    [7, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2, 4, 5],
];

let finalHTMLstring = [];

//create the game map
/*async function 
createMap() {
    let Game = await testGet().then((data) => {
        return data;
    });

    return Game

    console.log(Game);
 
    let mapElement = document.createElement("div");
    mapElement.classList.add("map");
    mapElement.style.background = "url('img/grass.png')";
    mapElement.style.height = mapHeight + "px";
    mapElement.style.width = mapWidth + "px";
    game.appendChild(mapElement);
    
    //finalHTMLstring.push("<div class='map' style='background: url('img/grass.png'); height: " + mapHeight + "px; width: " + mapWidth + "px;'>");
    //console.log(finalHTMLstring);
    fillMap();
    //finalHTMLstring.push("</div>");
    //console.log(finalHTMLstring);
}*/

/*function fillMap() {
    let remainingBricks = bricksNo;
    const case2Positions = [];
    let colNo = level[0].length;
    let rowNo = level.length;
    let mapPieces = [];

    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            switch (level[y][x]) {
                case 1:
                    createTile("wall.png", y, x);
                    //mapPieces[y+(x*colNo)].push("<div class='wall' style='top: " + y * 50 + "px; left: " + x * 50 + "px;'></div>");
                    break;
                case 2:
                    case2Positions.push({ y, x });
                    break;
                case 3:
                    createTile("blue-front0.png", player1StartTop, player1StartLeft, "moving");
                    break;
                case 5:
                    createTile("purple-front0.png", player2StartTop, player2StartLeft, "moving");
                    break;
                case 6:
                    createTile("dark-front0.png", player3StartTop, player3StartLeft, "moving");
                    break;
                case 7:
                    createTile("red-front0.png", player4StartTop, player4StartLeft, "moving");
                default:
                    break;
            }
        }
    }

    const totalCase2Positions = case2Positions.length;
    const bricksToPlace = Math.min(remainingBricks, totalCase2Positions);

    for (let i = 0; i < bricksToPlace; i++) {
      const randomIndex = Math.floor(Math.random() * case2Positions.length);
      const { y, x } = case2Positions[randomIndex];
      createTile("brick.png", y, x);
      case2Positions.splice(randomIndex, 1);
      remainingBricks--;
    }

    let bricks = document.querySelectorAll(".brick");
    let gifts = [];

    for (let i = 0; i < multipleBombsGift; i++) {
      gifts.push("multiple-bombs-gift");
    }

    for (let i = 0; i < bombRangeGift; i++) {
      gifts.push("bomb-range-gift");
    }

    for (let i = 0; i < speedGift; i++) {
      gifts.push("speed-gift");
    }

    for (let i = 0; i < lifeGift; i++) {
      gifts.push("life-gift");
    }

    for (let i = gifts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gifts[i], gifts[j]] = [gifts[j], gifts[i]];
    }

    bricks.forEach((brick, index) => {
        if (index < gifts.length) {
          brick.classList.add(gifts[index]);
        }
    });
}

function createTile(fileName, y, x, promotedLayer = "") {
    let mapElement = document.querySelector(".map");

    if (mapElement !== null) {
        const cordY = y * tileSize;
        const cordX = x * tileSize;

        let tileElement = document.createElement("div");

        if (!fileName.split(".")[0].endsWith("front0")) {
            tileElement.classList.add(fileName.split(".")[0]);
        } else {
            tileElement.classList.add("player");
            tileElement.style.transform = "translate(" + x + "px, " + y + "px)";
        }
        if (promotedLayer !== "") {
            tileElement.classList.add(promotedLayer);
            tileElement.style.zIndex = 2;
        } else {
            tileElement.style.top = cordY + "px";
            tileElement.style.left = cordX + "px";
            tileElement.style.zIndex = 1;
        }

        tileElement.style.backgroundImage = "url('img/" + fileName;
        mapElement.appendChild(tileElement);
    }
}*/

async function testGet() {
    fetch("/new_game")
    .then(response => response.json())
    .then(data => {
        console.log(data);
        givenMap = data;
        let container = document.getElementById("root")
        console.log(container)
        console.log(givenMap)
        MiniFramework.render(PaintMap, container)
    })
    .catch(error => {
      console.error(error)
    })
}
//<div class="player moving" style="transform: translate(5px, 10px); z-index: 2; background-image: url(&quot;img/blue-front0.png&quot;);"></div>
const PaintMap = () => {

    console.log(givenMap[0].Class)

    return `
    <MF>
    ${Title()}
    <div class="core-part">
      <div id="game" class="game">
        <div id="info">${Info()}</div>
        <div id="map">
            <div class="map" style="background: url('img/grass.png'); height: 900px; width: 900px;">
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
export { testGet };
