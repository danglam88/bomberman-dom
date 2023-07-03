import MiniFramework from "../mini_framework/mini-framework.js";
import { Player, Bomb } from "./class.js";

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
let canPlayerMove = true;

export let waitTime = undefined;
export let timer = undefined;
export let isGameOver = false
export let socket;
export let players = [];
export let playersFetched = false;
export let waitingError = "";
export let gameStarted = false;
export let validateError = "";
export let playerChecked = false;

export function resetGame() {
    validateError = "";
    playerChecked = false;
    players = [];
    gameStarted = false;
    timer = undefined;
    waitTime = undefined;
    playersFetched = false;
    waitingError = undefined;
    canPlayerMove = true;
  
    const nickname = localStorage.getItem("nickname");
    const msg = { Type: "leave", nickname: nickname };
    socket.send(JSON.stringify(msg));
    removePlayerFromBackend(nickname);
  
    //close websocket for client
    socket.close();
  
    localStorage.removeItem("websocketOpen");
    localStorage.removeItem("nickname");
    localStorage.removeItem("winner");
    localStorage.removeItem("winnerColor");
  }

export const GameLogic = (players) => {
    let previousTimeStamp = 0
  
    const gameLoop = (timestamp, players) => {
        if (players.length <= 1) {
            isGameOver = true
        }
  
        // Check if game over
        if (isGameOver) {
            const chatElement = document.getElementById('chat')
            if (chatElement !== null) {
                chatElement.remove()
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
    if (player.div) {

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
        livesElement.classList.add("livesInfo");
        livesElement.innerHTML = "<h5>" + player.getLives() + "</h5>";
        livesElement.style.transform = "translate(" + livesLeft + "px, " + livesTop + "px)";
        let map = document.getElementsByClassName("map")[0];
        if (map !== undefined) {
            map.appendChild(livesElement);
        }
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
    bomb.setId(bomb.getX() + "-" + bomb.getY())
   
    let bombNode = document.createElement("div")
    bombNode.id = bomb.getId()
    bombNode.classList.add("bomb")
    //bombNode.classList.add("bomb-animation")
    bombNode.style.backgroundImage = "url('img/bomb.png')"
    bombNode.style.top = bomb.getY() + "px"
    bombNode.style.left = bomb.getX() + "px"
    bombNode.style.backgroundPosition = `0px 0px`

    let map = document.getElementsByClassName("map")[0]
    if (map !== undefined) {
        map.appendChild(bombNode)
    }

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
                        if (player.isMe()) {
                            const chatElement = document.getElementById('chat')
                            if (chatElement !== null) {
                                chatElement.remove()
                            }
                        }
                        players.splice(players.indexOf(player), 1);
                        playerElements[i].remove();
                    }
                    if (players.length <= 1) {
                        const nickname = players.length === 1 ? players[0].getName() : "";
                        const color = players.length === 1 ? players[0].getColor() : "";
                        const msg = { type: "gameover", nickname: nickname, color: color };
                        socket.send(JSON.stringify(msg));
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

export function removePlayerFromBackend(playerName) {
    let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( playerName ),
      };
    fetch('/players', options)
    .then(response => {
        if (response.status === 200) {
            console.log('player ' + playerName + ' removed from backend')
        }
    })
    .catch(error => console.log(error))
}

export function checkPlayerAlreadyExists(nickname, initialCheck) {
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, initialCheck }),
    };
  
    fetch("/validate", options)
      .then((response) => {
        playerChecked = true;
  
        if (response.status === 200 && initialCheck === "false") {
          localStorage.setItem("nickname", nickname);
          window.location.hash = "#/waiting";
        } else if (response.status === 423) {
          validateError =
            "Game has already started, please try again later";
          MiniFramework.updateState();
        } else if (response.status === 429) {
          validateError =
            "There are already 4 players in the game, please try again later";
          MiniFramework.updateState();
        } else if (response.status === 409) {
          validateError =
            "Nickname was already taken, please choose another one";
          MiniFramework.updateState();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

export function fetchPlayersRenderWaitingTimer() {
    fetch("/players")
    .then((response) => response.json())
    .then((data) => {
      playersFetched = true;
      players = []
  
      if (data.started) {
        waitingError = "Game is not available at the moment. Please try again later..."
      }
  
      data.players.forEach((player, i) => {
        const isMe = player.name == localStorage.getItem("nickname")
        players.push(new Player(player.name, player.x, player.y, player.color, GLOBAL_SPEED, i+1, isMe))
      })
  
      MiniFramework.updateState();
  
      if (timer === 0) {
        gameStarted = true;
        window.location.hash = "#/gamestart";
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

export const openChat = () => {
    const chat = document.getElementById("chat");
    chat.style.display = "";
    const nickname = localStorage.getItem("nickname");
    const isWebSocketOpen = localStorage.getItem("websocketOpen") === "true";
  
    if (!isWebSocketOpen) {
      socket = initWebSocket(nickname);
  
      const handleKeyInput = (e, player) => {
        if (e.keyCode >= 37 && e.keyCode <= 40) {
          const msg = {
            Type: "game-update",
            Key: e.keyCode,
          };
          socket.send(JSON.stringify(msg));
  
        } else if (e.key == "Shift" && player.isMe() && player.getBomb() > 0 && noBombPlaced(player.getX(), player.getY())) {
              const msg = {
                Type: "game-update-bomb",
                X: player.getX(),
                Y: player.getY(),
                Range: player.getRange(),
                Player : player.getName(),
              };
              socket.send(JSON.stringify(msg));
        }
      };
  
      socket.onopen = () => localStorage.setItem("websocketOpen", "true");
      socket.onclose = () => localStorage.setItem("websocketOpen", "false");
      socket.onerror = (error) => console.log("WebSocket error: " + error);
      socket.onmessage = (event) => handleWebSocketMessage(event, socket);
  
      initEventListeners(socket, handleKeyInput);
    } else {
      chat.style.display = "";
      localStorage.setItem("websocketOpen", "false");
    }
  }
  
  const initWebSocket = (nickname) => {
    return new WebSocket("ws://localhost:8080/ws/" + nickname);
  }
  
  const handleWebSocketMessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "message") {
      const player = players.find(player => player.name === msg.nickname);
      if (player !== undefined) {
        const node = document.createElement("div");
        const picture = document.createElement("img");
        const playerName = document.createElement("p");
        playerName.className = "player-name-" + player.getColor();
        playerName.innerHTML = msg.nickname + ":";
  
        picture.src = "img/" + player.getColor() + "-front0.png";
        const textnode = document.createTextNode(msg.message);
        node.appendChild(picture);
        node.appendChild(playerName);
        node.appendChild(textnode);
        const chatContainer = document.getElementById("chat-messages");
        if (chatContainer !== null) {
          chatContainer.appendChild(node);
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    } 
  
    if (msg.type === "wait-time" || msg.type === "timer") {
      if (msg.type === "wait-time") {
        waitTime = parseInt(msg.message);
      } else if (msg.type === "timer") {
        timer = parseInt(msg.message);
        waitTime = undefined;
      }
      fetchPlayersRenderWaitingTimer();
    }
  
    if (msg.type === "leave") {
      if (players.length === 2) {
        timer = undefined;
        waitTime = undefined;
  
        fetchPlayersRenderWaitingTimer();
      }
      if (!gameStarted) {
        fetchPlayersRenderWaitingTimer();
      }
      if (gameStarted) {
        const player = players.find(player => player.name === msg.nickname);
        if (player !== undefined) {
          player.remove();
          players.splice(players.indexOf(player), 1);
          if (players.length <= 1) {
            const nickname = players.length === 1 ? players[0].getName() : "";
            const color = players.length === 1 ? players[0].getColor() : "";
            const msg = { type: "gameover", nickname: nickname, color: color };
            socket.send(JSON.stringify(msg));
          }
        }
      }
  
      const node = document.createElement("div");
      const textnode = document.createTextNode(msg.nickname + " left the game");
      node.appendChild(textnode);
      let chatMessages = document.getElementById("chat-messages");
      if (chatMessages !== null) {
        chatMessages.appendChild(node);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  
    if (msg.type === "gameover") {
      localStorage.setItem("winner", msg.nickname);
      localStorage.setItem("winnerColor", msg.color);
      isGameOver = true;
      window.location.hash = "#/gameover";
    }
  
    //movements of players
    if (msg.type === "game-update") {
      const player = players.find(player => player.name == msg.player);
      if (player !== undefined) {
        if (msg.key >= 37 && msg.key <= 40) {
            player.setDirection(msg.key);
            movePlayer(player);
        }
      }
  
    //dropping a bomb 
    } else if (msg.type=== "game-update-bomb") {
        const player = players.find(player => player.name == msg.player);
        player.dropBomb()
  
        const bomb = new Bomb(msg.x, msg.y, msg.range, player)
        animateBomb(bomb);
  
    //explosure of the bomb    
    } else if (msg.type  === "game-update-bomb-explode") {
        const player = players.find(player => player.name == msg.player);
        const bomb = new Bomb(msg.x, msg.y, msg.range, player)
        
        bomb.setId(msg.x + "-" +msg.y)
        bomb.setDiv(document.getElementById(bomb.getId()))
  
        createFlashPieces(bomb.getId(), bomb);
        destroyObjects(bomb.getId(), bomb, players);
  
        setTimeout(() => {
            removeFlashPieces(bomb.getId());
  
            const bombDiv = bomb.getDiv()
            if (bombDiv !== null) {
              bombDiv.remove();
            }
            bomb.explode();
  
        }, flashDuration)
    }
  };
  
  const initEventListeners = (socket, handleKeyInput) => {
    document.getElementById("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("input");
      const message = input.value;
      if (message.trim().length > 0) {
        input.value = "";
        const msg = { Type: "message", Message: message };
        socket.send(JSON.stringify(msg));
      }
    });
  
    window.addEventListener('keydown', (e) => {
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
      }
  
      const player = players.find(player => player.me)
  
      if (player !== undefined && player.getLives() > 0 && canPlayerMove) {
        handleKeyInput(e, player);
        canPlayerMove = false
        setTimeout(() => {
          canPlayerMove = true
        }, 50)
      }
    });
  
    window.addEventListener("beforeunload", () => {
      resetGame();
      //redirect to root
      window.location.hash = "#/";
    });
  }
