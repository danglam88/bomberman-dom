export class Player {
    constructor(name, x, y, color) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = 10;
        this.lives = 3;
        this.bomb = 1;
        this.range = 1;
        this.direction = null
    }

    moveUp() {
        this.y -= this.speed;
    }

    moveDown() {
        this.y += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    moveRight() {
        this.x += this.speed;
    }

    dropBomb() {
        this.bomb--;
        return new Bomb(this.x, this.y, this.range, this);
    }

    addBomb() {
        this.bomb++;
    }

    addSpeed() {
        this.speed += 5;
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

    getPosition() {
        return [this.x, this.y];
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

    reset() {
        this.bomb = 1;
        this.speed = 10;
        this.range = 1;
    }

    isDead() {
        return this.lives == 0;
    }
}

export class Bomb {
    constructor(x, y, range, owner) {
        this.x = x;
        this.y = y;
        this.range = range;
        this.time = 3000;
        this.owner = owner;
    }

    getRange() {
        return this.range;
    }

    getTime() {
        return this.time;
    }

    getPosition() {
        return [this.x, this.y];
    }

    getOwner() {
        return this.owner;
    }

    explode() {
        this.owner.addBomb();
        //todo what is this for
        //this = null;
    }
}
