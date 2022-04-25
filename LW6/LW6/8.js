"use strict"

const sin = Math.sin;
const cos = Math.cos;
const sign = Math.sign;
const abs = Math.abs;
const max = Math.max;
const min = Math.min;
const PI = Math.PI;
const hPI = 0.5 * PI;

const BALL_SPEED = 2;
const BALL_DIRECTION_ANGLE = 0.25 * PI;
const BRICK_STRENGHT = 30;
const BALL_DAMAGE = 10;
const BRICK_DAMAGE_STYLE_OPACITY = 0.5;
const BRICK_DAMAGE_OPACITY_TIME = 100;
const DEFAULT_TICKRATE = 10;
const BRICKS_AMOUNT = 20;


class Element {
    constructor({ elemId = null, parent = null } = null) {
        this.elem = elemId ? document.getElementById(elemId) : document.createElement('div');
        this.parent = parent ? parent : this.elem.offsetParent;

        this.style = this.elem.style;

        this.updateBoundaries();

        window.addEventListener('resize', _ => this.updateBoundaries());
    }

    static Shape = function(elem) {
        this.clHeight = this.height = elem.offsetHeight;
        this.clWidth = this.width = elem.offsetWidth;

        this.clTop = this.top = elem.offsetTop;
        this.clLeft = this.left = elem.offsetLeft;
        this.clRight = this.right = this.left + this.width;
        this.clBottom = this.bottom = this.top + this.height;

        this.x = this.left + 0.5 * this.width;
        this.y = this.top + 0.5 * this.height;

        this.border = elem.clientTop;

        if (this.border) {
            this.clHeight -= 2 * this.border;
            this.clWidth -= 2 * this.border;

            this.clTop += this.border;
            this.clLeft += this.border;
            this.clRight -= this.border;
            this.clBottom -= this.border;
        }
    };

    updateBoundaries() {
        this.shape = new Element.Shape(this.elem);

    }

    setPosition(x, y) {
        this.style.top = y - 0.5 * this.shape.height + 'px';
        this.style.left = x - 0.5 * this.shape.width + 'px';

        this.updateBoundaries();
    }

    setPositionLT(left, top) {
        this.style.top = top + 'px';
        this.style.left = left + 'px';

        this.updateBoundaries();
    }
}

class Field extends Element {
    constructor(elemId) {
        super(elemId);
        this.ball = null;
    }

    set bindBall(ball) {
        this.ball = ball;
        this.elem.addEventListener('click', _ => !this.ball.isLaunched && this.ball.launch());
    }

    CreateBricks = () => {
        let nextBrickLeft = 0;
        let nextBrickTop = 0;

        const bricks = Array(BRICKS_AMOUNT).fill(null).map(_ => {
            const newBrick = new Brick({ parent: this.elem });

            newBrick.elem.className = 'brick';

            this.elem.appendChild(newBrick.elem);
            newBrick.updateBoundaries();

            if (!nextBrickTop) {
                nextBrickTop = newBrick.shape.top;
            }

            newBrick.setPositionLT(nextBrickLeft, nextBrickTop);

            const nextBrickRight = nextBrickLeft + newBrick.shape.width;
            nextBrickLeft = (nextBrickRight > this.shape.clWidth ? 0 : nextBrickRight);

            if (!nextBrickLeft) {
                nextBrickTop += newBrick.shape.height;
            }

            return newBrick;
        }, 1);

        this.style.display = 'block';

        return bricks;
    }
}

class Brick extends Element {
    constructor(elemId) {
        super(elemId);
        this.durability = BRICK_STRENGHT;
    }

    damage = () => {
        this.durability -= BALL_DAMAGE;

        const initOpacity = this.style.opacity;
        this.style.opacity = BRICK_DAMAGE_STYLE_OPACITY;

        setTimeout(() => {
            this.style.opacity = initOpacity;
        }, BRICK_DAMAGE_OPACITY_TIME);

        this.durability <= 0 && this.elem.remove();

        return this.durability;
    }
}

class Board extends Element {
    constructor(elemId) {
        super(elemId);

        this.field = null;
        this.ball = null;
    }

    set bindField(field) {
        this.field = field;
    }
    set bindBall(ball) {
        this.ball = ball;
    }

    handleMouseMove(event) {
        const dx = event.clientX - this.field.shape.left;

        const min = 0.5 * this.shape.width;
        const max = this.field.shape.clWidth - 0.5 * this.shape.width;

        const newX =
            dx <= min ? min :
            dx >= max ? max :
            dx

        this.setPosition(newX, this.shape.y);
        !this.ball.isLaunched && this.ball.setPosition(newX, this.ball.shape.y);
    }
}

class Ball extends Element {
    constructor(elemId) {
        super(elemId);

        this.board = null;
        this.field = null;
        this.bricks = [];

        this.radius = 0.5 * this.shape.height;
        this.direction = BALL_DIRECTION_ANGLE;
        this.speed = BALL_SPEED;
        this.isLaunched = false;
    }

    set bindBoard(board) {
        this.board = board;
    }
    set bindField(field) {
        this.field = field;
    }
    set bindBricks(bricks) {
        this.bricks.push(...bricks);
    }

    launch() {
        if (!this.isLaunched) {
            this.isLaunched = true;
        }

        const move = () => {
            const nextPosition = () => {
                this.setPosition(
                    this.shape.x + 2 * cos(this.direction),
                    this.shape.y + 2 * -sin(this.direction)
                );
            }

            const checkCRIntersection = (rect) => {
                const deltaX = this.shape.x - max(rect.shape.left, min(this.shape.x, rect.shape.left + rect.shape.width));
                const deltaY = this.shape.y - max(rect.shape.top, min(this.shape.y, rect.shape.top + rect.shape.height));

                const istIntersecting = deltaX ** 2 + deltaY ** 2 < this.radius ** 2;

                return istIntersecting;
            }

            const stop = (string) => {
                clearInterval(interval);
                alert(string);

                if (confirm('PLAY AGAIN?')) {
                    location.reload();
                }
            }

            nextPosition();

            const isTouchTopBorder = this.shape.top <= 0;
            const isTouchBorder =
                this.shape.left <= 0 ||
                this.shape.right >= this.field.shape.clWidth ||
                isTouchTopBorder;

            const isTouchBoard = checkCRIntersection(this.board);
            const touchedBrickIndex = this.bricks.findIndex(brick => checkCRIntersection(brick));
            const isLose = this.shape.bottom >= this.field.shape.clHeight;

            const xSign = sign(cos(this.direction));
            const ySign = sign(sin(this.direction));

            const boolSign = (equation, eqTrue = 1, eqFalse = -1) => equation ? eqTrue : eqFalse;

            if (isTouchBorder) {
                this.direction += boolSign(!isTouchTopBorder) * hPI * xSign * ySign;
                nextPosition();
            } else if (isTouchBoard) {
                this.direction +=
                    boolSign(abs(this.shape.x - this.board.shape.x) <= 0.5 * this.board.shape.width) *
                    hPI * xSign;
                nextPosition();
            } else if (touchedBrickIndex !== -1) {
                const intersectedBrict = this.bricks[touchedBrickIndex];

                if (intersectedBrict.damage() <= 0) {
                    this.bricks = [
                        ...this.bricks.slice(0, touchedBrickIndex),
                        ...this.bricks.slice(1 + touchedBrickIndex)
                    ];
                }

                if (!this.bricks.length) {
                    stop('YOU\'RE WIN!')
                }

                this.direction -=
                    boolSign(
                        abs(this.shape.x - intersectedBrict.shape.x) <= 0.5 * intersectedBrict.shape.width,
                        boolSign(this.shape.y >= intersectedBrict.shape.y), -ySign
                    ) * hPI * xSign;
                nextPosition();
            } else if (isLose) {
                stop('YOU\'RE LOSE!')
            }
        }

        const interval = setInterval(() => move(), DEFAULT_TICKRATE / this.speed);
    }
}

function init() {
    const field = new Field({ elemId: 'field' });
    const board = new Board({ elemId: 'board' });
    const ball = new Ball({ elemId: 'ball' });

    board.bindField = field;
    board.bindBall = ball;
    ball.bindField = field;
    ball.bindBoard = board;
    ball.bindBricks = field.CreateBricks();
    field.bindBall = ball;

    window.addEventListener('mousemove', event => board.handleMouseMove(event));
}

window.addEventListener('load', () => init());