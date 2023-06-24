export const GLOBAL_SPEED = 10

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
const bombSize = 45;
const giftSize = 33;
const mapWidth = 900;
const mapHeight = 900;
const totalTime = 181000;
const hintStart = 121000;
const lifePoints = 200;
const intervalDuration = 100;
const highScoresNo = 5;
const probability = 0.9;
const allDirections = ["Up", "Down", "Left", "Right"];
const livesInfoGapTop = 70;
const livesInfoGapLeft = 20;
const popupDuration = 4000;
const scoreGoal = 1000;

export const GameLogic = (players) => {
    let isGameOver = false
    let previousTimeStamp = 0
  
    const gameLoop = (timestamp, players) => {
  
        // Check if game over
        if (isGameOver) {
            return;
        }
      
          // Check that all characters moving with global speed
        if (timestamp < previousTimeStamp + GLOBAL_SPEED) {
            window.requestAnimationFrame(function(timestamp) {
                gameLoop(timestamp, players);
            });
      
            return;
        }
      
        previousTimeStamp = timestamp;
      
        window.requestAnimationFrame(function(timestamp) {
            gameLoop(timestamp, players);
        });
    }
    
    
    players.forEach((player) => {
      player.addDiv()
    });
  
    gameLoop(0, players)
}

export const movePlayer = (player) => {

    if (player.div !== null) {

        let currentTop = player.getY();
        let currentLeft = player.getX();

        let topBarrier;
        let leftBarrier;

        switch (player.getDirection()) {
            case "ArrowUp":
                if (currentTop > player.getSpeed()) {
                    currentTop -= player.getSpeed();
                } else {
                    currentTop = 0;
                }

                topBarrier = barrierCheck(currentTop, currentLeft, "Up", "Player");

                if (topBarrier !== undefined) {
                    currentTop = topBarrier;
                }

                player.setY(currentTop);

                player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                if (player.getImg() === 'url("./img/' + player.color + '-back1.png")') {
                    player.setImg('url("./img/' + player.color + '-back2.png")');
                } else {
                    player.setImg('url("./img/' + player.color + '-back1.png")');
                }

                break;
            case "ArrowDown":
                if (currentTop < mapHeight - playerSize - player.getSpeed()) {
                    currentTop += player.getSpeed();
                } else {
                    currentTop = mapHeight - playerSize;
                }

                topBarrier = barrierCheck(currentTop, currentLeft, "Down", "Player");

                if (topBarrier !== undefined) {
                    currentTop = topBarrier;
                }

                player.setY(currentTop);

                player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                if (player.getImg() === 'url("./img/' + player.color + '-front1.png")') {
                    player.setImg('url("./img/' + player.color + '-front2.png")');
                } else {
                    player.setImg('url("./img/' + player.color + '-front1.png")');
                }

                break;
            case "ArrowLeft":
                if (currentLeft > player.getSpeed()) {
                    currentLeft -= player.getSpeed();
                } else {
                    currentLeft = 0;
                }

                leftBarrier = barrierCheck(currentTop, currentLeft, "Left", "Player");

                if (leftBarrier !== undefined) {
                    currentLeft = leftBarrier;
                }

                player.setX(currentLeft);

                player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                if (player.getImg() === 'url("./img/' + player.color + '-left1.png")') {
                    player.setImg('url("./img/' + player.color + '-left2.png")');
                } else {
                    player.setImg('url("./img/' + player.color + '-left1.png")');
                }

                break;
            case "ArrowRight":
                if (currentLeft < mapWidth - playerSize - player.getSpeed()) {
                    currentLeft += player.getSpeed();
                } else {
                    currentLeft = mapWidth - playerSize;
                }

                leftBarrier = barrierCheck(currentTop, currentLeft, "Right", "Player");

                if (leftBarrier !== undefined) {
                    currentLeft = leftBarrier;
                }

                player.setX(currentLeft);

                player.div.style.transform = "translate(" + currentLeft + "px, " + currentTop + "px)";

                if (player.getImg() === 'url("./img/' + player.color + '-right1.png")') {
                    player.setImg('url("./img/' + player.color + '-right2.png")');
                } else {
                    player.setImg('url("./img/' + player.color + '-right1.png")');
                }

                break;
            case null:
                switch (true) {
                    case player.getImg() === 'url("./img/' + player.color + '-back1.png")' || player.getImg() === 'url("./img/' + player.color + '-back2.png")':
                        player.setImg('url("./img/' + player.color + '-back0.png")');
                        break;
                    case player.getImg() === 'url("./img/' + player.color + '-front1.png")' || player.getImg() === 'url("./img/' + player.color + '-front2.png")':
                        player.setImg('url("./img/' + player.color + '-front0.png")');
                        break;
                    case player.getImg() === 'url("./img/' + player.color + '-left1.png")' || player.getImg() === 'url("./img/' + player.color + '-left2.png")':
                        player.setImg('url("./img/' + player.color + '-left0.png")');
                        break;
                    case player.getImg() === 'url("./img/' + player.color + '-right1.png")' || player.getImg() === 'url("./img/' + player.color + '-right2.png")':
                        player.setImg('url("./img/' + player.color + '-right0.png")');
                        break;
                }

                break;
        }

        let giftElements = document.querySelectorAll(".gift");
        giftElements.forEach((gift) => {
            giftCheck(player, gift)
        })
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

const giftCheck = (player, giftElement) => {

    if (player !== null && giftElement !== null && !giftElement.classList.contains("brick")) {
        //todo add animation earlier (after destroying a brick)
        //giftElement.style.animation = "animation: speedblink 1s infinite"

        let giftTop = giftElement.style.top;
        giftTop = giftTop.replace("px", "");
        giftTop = parseInt(giftTop);

        let giftLeft = giftElement.style.left;
        giftLeft = giftLeft.replace("px", "");
        giftLeft = parseInt(giftLeft);

        if (player.getY() + playerSize > giftTop && player.getY() < giftTop + giftSize && player.getX() + playerSize > giftLeft && player.getX() < giftLeft + giftSize) {
            
            giftElement.remove();

            if (giftElement.classList.contains("speed-gift")) {
                player.addPowerUp("speed")
            } else if (giftElement.classList.contains("multiple-bombs-gift")) {
                player.addPowerUp("bomb")
            }  else if (giftElement.classList.contains("bomb-range-gift")) {
                player.addPowerUp("range")
            } else if (giftElement.classList.contains("life-gift")) {
                player.addPowerUp("life")
            }
        }
    }
}

export function animateBomb(player){
    let map = document.getElementsByClassName("map")[0]
    let bombNode = document.createElement("div")
    bombNode.classList.add("bomb")
    bombNode.style.backgroundImage = "url('img/bomb.png')"
    bombNode.style.top = player.y+6 + "px"
    bombNode.style.left = player.x+6 + "px"
    bombNode.style.backgroundPosition = "0px 0px";
      
    map.appendChild(bombNode)
}

