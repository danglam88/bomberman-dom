const mapWidth = 900;
const mapHeight = 900;
const tileSize = 45;
const startGhostsNo = 4;

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
const bricksNo = 100;
const probability = 0.9;
const allDirections = ["Up", "Down", "Left", "Right"];
const ghostMaxStepsNo = 10;
let ghostDirections = [];
let ghostsNo = startGhostsNo;
let ghostSteps = [];
let gift = true;

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

//create the game map
const createMap = () => {
    let mapElement = document.createElement("div");
    mapElement.classList.add("map");
    mapElement.style.background = "url('bomberman_app/img/grass.png')";
    mapElement.style.height = mapHeight + "px";
    mapElement.style.width = mapWidth + "px";
    game.appendChild(mapElement);
    fillMap();
}

function fillMap() {
    let remainingGhosts = ghostsNo;
    let remainingBricks = bricksNo;
    const case2Positions = [];

    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            switch (level[y][x]) {
                case 0:
                    if (remainingGhosts > 0 && Math.random() > probability) {
                        createTile("ghost.gif", y, x, "moving");
                        remainingGhosts--;
                    }
                    break;
                case 1:
                    createTile("wall.png", y, x);
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

    let multipleBombsGiftNo = multipleBombsGift; //2
    let bombRangeGiftNo = bombRangeGift; //2
    let speedGiftNo = speedGift; //2
    let bricks = document.querySelectorAll(".brick");
    let gifts = [];

    for (let i = 0; i < multipleBombsGiftNo; i++) {
      gifts.push("multiple-bombs-gift");
    }

    for (let i = 0; i < bombRangeGiftNo; i++) {
      gifts.push("bomb-range-gift");
    }

    for (let i = 0; i < speedGiftNo; i++) {
      gifts.push("speed-gift");
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
            if (tileElement.classList.contains("ghost")) {
                tileElement.style.transform = "translate(" + cordX + "px, " + cordY + "px)";
                ghostDirections.push(allDirections[Math.floor(Math.random() * allDirections.length)]);
                ghostSteps.push(Math.floor(Math.random() * ghostMaxStepsNo) + 1);
            }
        } else {
            tileElement.style.top = cordY + "px";
            tileElement.style.left = cordX + "px";
            tileElement.style.zIndex = 1;
        }

        tileElement.style.backgroundImage = "url('bomberman_app/img/" + fileName;
        mapElement.appendChild(tileElement);
    }
}

export default createMap;
