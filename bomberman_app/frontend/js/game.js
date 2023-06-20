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
const bombSize = 33;
const doorSize = 33;
const giftSize = 33;
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


export const GameLogic = (players) => {
    let isGameOver = false
    let isGamePaused = false
    let previousTimeStamp = 0
  
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
    
    
    players.forEach((player) => {
      player.addDiv()
    });
  
    gameLoop(0, players)
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
