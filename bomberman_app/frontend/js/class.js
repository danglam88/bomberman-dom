export class Player {
    constructor(name, x, y, color, speed, index, me) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.lives = 3;
        this.bomb = 1;
        this.range = 1;
        this.direction = null
        this.index = index
        this.me = me
    }

    addDiv() {
        this.div = document.querySelector("." + this.color)
    }

    setImg(img) {
        this.div.style.background = img
    }

    getImg() {
        return this.div.style.background
    }

    dropBomb() {
        this.bomb--;
    }

    addBomb() {
        this.bomb++;
    }

    addSpeed() {
        this.speed += 2;
    }

    addRange() {
        this.range++;
    }

    addLife() {
        this.lives++;
    }

    removeLife() {
        this.lives--;
    }

    addPowerUp(powerUp) {
        switch (powerUp) {
            case "bomb":
                this.addBomb();
                break;
            case "speed":
                this.addSpeed();
                break;
            case "range":
                this.addRange();
                break;
            case "life":
                this.addLife();
                break;
        }
    }

    getBomb() {
        return this.bomb;
    }

    getSpeed() {
        return this.speed;
    }

    getRange() {
        return this.range;
    }

    getName() {
        return this.name;
    }

    getColor() {
        return this.color;
    }

    getLives() {
        return this.lives;
    }

    getIndex() {
        return this.index;
    }

    reset() {
        this.bomb = 1;
        this.speed = 10;
        this.range = 1;
    }

    setDirection(dir) {
        switch (dir) {
            case 37 : 
            {
                this.direction = "ArrowLeft"
                break
            }
            case 38 : 
            {
                this.direction = "ArrowUp"
                break
            }
            case 39 : 
            {
                this.direction =  "ArrowRight"
                break
            }
            case 40 : 
            {
                this.direction = "ArrowDown"
                break
            }
            case null :
            {
                this.direction = null
                break
            }
        }
    }

    getDirection() {
        return this.direction;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    isMe() {
        return this.me;
    }
}

export class Bomb {
    constructor(x, y, range, owner) {
        this.x = x;
        this.y = y;
        this.range = range;
        this.owner = owner;
    }

    setId(id) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getRange() {
        return this.range;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getOwner() {
        return this.owner;
    }

    explode() {
        this.owner.addBomb();
    }

    setDiv(div) {
        this.div = div;
    }

    getDiv() {
        return this.div;
    }
}

export class Group {
    constructor() {
        this.id = this.generateId();
        this.players = [];
        this.status = "waiting";
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36);
    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }

    getPlayers() {
        return this.players;
    }

    getPlayer(index) {
        return this.players[index];
    }

    getLength() {
        return this.players.length;
    }

    reset() {
        this.players.forEach(player => {
            player.reset();
        });
    }
}
