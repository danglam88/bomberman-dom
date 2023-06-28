
export const GLOBAL_SPEED = 10
export const flashDuration = 500

const playerSize = 45;
const brickSize = 45;
const wallSize = 45;
const bombSize = 45;
const giftSize = 45;
const mapWidth = 900;
const mapHeight = 900;
const livesInfoGapTop = 70;
const livesInfoGapLeft = 20;
// hard-coded code for game over
// let movements = 5;
export let isGameOver = false

export const GameLogic = (players) => {
    let previousTimeStamp = 0
  
    const gameLoop = (timestamp, players) => {
        if (players.length <= 1) {
            isGameOver = true
        }
  
        // Check if game over
        if (isGameOver) {
            // game over wip
            const winner = players.length === 1 ? players[0] : null
            gameOver(winner)
            if (winner && winner.isMe()) {
                removePlayerFromBackend(winner.getName())
            }
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
      player.addDiv();
      createLivesInfo(player);
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

        createLivesInfo(player);
    }
}

const createLivesInfo = (player) => {
    let livesTop = player.getY() - livesInfoGapTop;
    let livesLeft = player.getX() + livesInfoGapLeft;

    let livesInfo = document.getElementById("livesInfo-" + player.getColor());
    if (livesInfo !== null && player.getLives() <= 0) {
        livesInfo.remove();
    } else if (livesInfo !== null) {
        livesInfo.innerHTML = "<h5>" + player.getLives() + "</h5>";
        livesInfo.style.transform = "translate(" + livesLeft + "px, " + livesTop + "px)";
    } else if (player.getLives() > 0) {
        let livesElement = document.createElement("div");
        livesElement.id = "livesInfo-" + player.getColor();
        livesElement.classList.add("moving");
        livesElement.innerHTML = "<h5>" + player.getLives() + "</h5>";
        livesElement.style.transform = "translate(" + livesLeft + "px, " + livesTop + "px)";
        livesElement.style.zIndex = 1;
        if (player.isMe()) {
            console.log("I am", player.getColor());
            livesElement.style.color = "red";
        } else {
            livesElement.style.color = "blue";
        }
        let map = document.getElementsByClassName("map")[0];
        map.appendChild(livesElement);
    }
}

// function that checks if players can move in the direction they want
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


export function animateBomb(bomb){
    console.log("animateBomb")
    bomb.setId(bomb.getX() + "-" + bomb.getY())
   
    let bombNode = document.createElement("div")
    bombNode.id = bomb.getId()
    bombNode.classList.add("bomb")
    bombNode.classList.add("bomb-animation")
    //bombNode.style.backgroundImage = "url('img/bomb.png')"
    bombNode.style.top = bomb.getY() + "px"
    bombNode.style.left = bomb.getX() + "px"
    //bombNode.style.backgroundPosition = `0px 0px`

    let map = document.getElementsByClassName("map")[0]
    map.appendChild(bombNode)

    bomb.setDiv(bombNode)

    return bomb
}

export const noBombPlaced = (currentLeft, currentTop) => {
    let bombs = document.querySelectorAll(".bomb");

    for (let i = 0; i < bombs.length; i++) {
        let bombTop = bombs[i].style.top;
        bombTop = bombTop.replace("px", "");
        bombTop = parseInt(bombTop);

        let bombLeft = bombs[i].style.left;
        bombLeft = bombLeft.replace("px", "");
        bombLeft = parseInt(bombLeft);

        if (currentTop <= bombTop + bombSize && currentLeft <= bombLeft + bombSize && currentTop + bombSize >= bombTop && currentLeft + bombSize >= bombLeft) {
            return false;
        }
    }

    return true;
}

const noWallPlaced = (flashLeft, flashTop) => {
    let walls = document.querySelectorAll(".wall");

    for (let i = 0; i < walls.length; i++) {
        let wallTop = walls[i].style.top;
        wallTop = wallTop.replace("px", "");
        wallTop = parseInt(wallTop);

        let wallLeft = walls[i].style.left;
        wallLeft = wallLeft.replace("px", "");
        wallLeft = parseInt(wallLeft);

        if (flashTop < wallTop + wallSize && flashLeft < wallLeft + wallSize && flashTop + bombSize > wallTop && flashLeft + bombSize > wallLeft) {
            return false;
        }
    }

    return true;
}

const noWallBetween = (bombLeft, bombTop, currentLeft, currentTop) => {
    let walls = document.querySelectorAll(".wall");

    for (let i = 0; i < walls.length; i++) {
        let wallTop = walls[i].style.top;
        wallTop = wallTop.replace("px", "");
        wallTop = parseInt(wallTop);

        let wallLeft = walls[i].style.left;
        wallLeft = wallLeft.replace("px", "");
        wallLeft = parseInt(wallLeft);

        if ((bombLeft < wallLeft + wallSize && wallLeft < bombLeft + bombSize && ((bombTop < wallTop && wallTop < currentTop) || (currentTop < wallTop && wallTop < bombTop))) || (bombTop < wallTop + wallSize && wallTop < bombTop + bombSize && ((bombLeft < wallLeft && wallLeft < currentLeft) || (currentLeft < wallLeft && wallLeft < bombLeft)))) {
            return false;
        }
    }

    return true;
}

// function to check what to remove while bomb is exploding
export const destroyObjects = (bombID, bomb, players) => {
    let bombElement = document.getElementById(bombID);

    if (bombElement !== null) {
        bombElement.style.backgroundImage = "url('./img/explode.png')";

        let bombTop = bomb.getY();

        let minBombTop = bombTop - bomb.getRange() * bombSize;
        let maxBombTop = bombTop + bombSize + bomb.getRange() * bombSize;

        let bombLeft = bomb.getX();

        let minBombLeft = bombLeft - bomb.getRange() * bombSize;
        let maxBombLeft = bombLeft + bombSize + bomb.getRange() * bombSize;

        let gifts = document.querySelectorAll(".gift");

        for (let i = 0; i < gifts.length; i++) {
            if (!gifts[i].classList.contains("brick")) {
                let giftTop = gifts[i].style.top;
                giftTop = giftTop.replace("px", "");
                giftTop = parseInt(giftTop);

                let giftLeft = gifts[i].style.left;
                giftLeft = giftLeft.replace("px", "");
                giftLeft = parseInt(giftLeft);

                if (noWallBetween(bombLeft, bombTop, giftLeft, giftTop) && ((giftLeft < bombLeft + bombSize && giftLeft + giftSize > bombLeft && giftTop < maxBombTop && giftTop + giftSize > minBombTop) || (giftTop < bombTop + bombSize && giftTop + giftSize > bombTop && giftLeft < maxBombLeft && giftLeft + giftSize > minBombLeft))) {
                    gifts[i].remove();
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

            if (noWallBetween(bombLeft, bombTop, brickLeft, brickTop) && ((brickLeft < bombLeft + bombSize && brickLeft + brickSize > bombLeft && brickTop < maxBombTop && brickTop + brickSize > minBombTop) || (brickTop < bombTop + bombSize && brickTop + brickSize > bombTop && brickLeft < maxBombLeft && brickLeft + brickSize > minBombLeft))) {
                if (!bricks[i].classList.contains("gift")) {
                    bricks[i].remove();
                } else {
                    bricks[i].classList.remove("brick");
                    bricks[i].style.background = "";
           
                    if (bricks[i].classList.contains("speed-gift")) {
                        bricks[i].classList.add("speed-gift-animation")
                    } else if (bricks[i].classList.contains("multiple-bombs-gift")) {
                        bricks[i].classList.add("multiple-bombs-gift-animation")   
                    }  else if (bricks[i].classList.contains("bomb-range-gift")) {
                        bricks[i].classList.add("bomb-range-gift-animation")
                    } else if (bricks[i].classList.contains("life-gift")) {
                        bricks[i].classList.add("life-gift-animation")
                    }
                }
            }
        }

        let playerElements = document.querySelectorAll(".player");

        for (let i = 0; i < playerElements.length; i++) {
            const player = players.find(player => playerElements[i].classList.contains(player.color));

            if (player !== undefined) {
                let playerTop = player.getY();
                let playerLeft = player.getX();

                if (noWallBetween(bombLeft, bombTop, playerLeft, playerTop) && ((playerLeft < bombLeft + bombSize && playerLeft + playerSize > bombLeft && playerTop < maxBombTop && playerTop + playerSize > minBombTop) || (playerTop < bombTop + bombSize && playerTop + playerSize > bombTop && playerLeft < maxBombLeft && playerLeft + playerSize > minBombLeft))) {
                    if (player.getLives() > 0) {
                        player.removeLife();
                    }
                    createLivesInfo(player);
                    if (player.getLives() <= 0) {
                        if (player.isMe() && players.length > 1) {
                            removePlayerFromBackend(player.name);
                        }
                        players.splice(players.indexOf(player), 1);
                        playerElements[i].remove();
                    }
                    if (players.length <= 1) {
                        isGameOver = true;
                    }
                }
            }
        }
    }
}

// function to create flash pieces while bomb is exploding
export const createFlashPieces = (bombID, bomb) => {
    let mapElement = document.querySelector(".map");
    let bombElement = document.getElementById(bombID);

    if (mapElement !== null && bombElement !== null) {
        let bombTop = bomb.getY();

        let minBombTop = bombTop - bomb.getRange() * bombSize;
        let maxBombTop = bombTop + bombSize + bomb.getRange() * bombSize;

        let bombLeft = bomb.getX();

        let minBombLeft = bombLeft - bomb.getRange() * bombSize;
        let maxBombLeft = bombLeft + bombSize + bomb.getRange() * bombSize;

        let flashTop = minBombTop;
        let flashLeft = bombLeft;

        while (flashTop < maxBombTop) {
            if (noWallPlaced(flashLeft, flashTop) && noWallBetween(bombLeft, bombTop, flashLeft, flashTop) && flashTop >= 0 && flashTop + bombSize <= mapHeight && flashLeft >= 0 && flashLeft + bombSize <= mapWidth) {
                let flashElement = document.createElement("div");
                flashElement.classList.add("flash" + bombID);
                flashElement.style.top = flashTop + "px";
                flashElement.style.left = flashLeft + "px";
                flashElement.style.width = bombSize + "px";
                flashElement.style.height = bombSize + "px";
                flashElement.style.backgroundImage = "url('./img/explode.png')";
                flashElement.style.position = "absolute";
                mapElement.appendChild(flashElement);
            }
            flashTop += bombSize;
        }

        flashTop = bombTop;
        flashLeft = minBombLeft;

        while (flashLeft < maxBombLeft) {
            if (noWallPlaced(flashLeft, flashTop) && noWallBetween(bombLeft, bombTop, flashLeft, flashTop) && flashTop >= 0 && flashTop + bombSize <= mapHeight && flashLeft >= 0 && flashLeft + bombSize <= mapWidth) {
                let flashElement = document.createElement("div");
                flashElement.classList.add("flash" + bombID);
                flashElement.style.top = flashTop + "px";
                flashElement.style.left = flashLeft + "px";
                flashElement.style.width = bombSize + "px";
                flashElement.style.height = bombSize + "px";
                flashElement.style.backgroundImage = "url('./img/explode.png')";
                flashElement.style.position = "absolute";
                mapElement.appendChild(flashElement);
            }
            flashLeft += bombSize;
        }
    }
}

export const removeFlashPieces = (bombID) => {
    let flashPieces = document.querySelectorAll(".flash" + bombID);

    if (flashPieces !== null) {
        for (let i = 0; i < flashPieces.length; i++) {
            flashPieces[i].remove();
        }
    }
}

const gameOver = (winner) => {
    document.getElementById('chat').remove()
    localStorage.setItem('winner', JSON.stringify(winner))
    window.location.hash = "#/gameover"
}

function removePlayerFromBackend(playerName) {
    console.log("remove player from backend", playerName)
    let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( playerName ),
      };
    fetch('/players', options)
    .then((response) => {
        if (response.status === 200) {
            console.log("player removed from backend")
        }
    })
    .catch(error => console.log(error))
}
