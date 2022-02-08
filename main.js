//global variables
var arrow = {
    65: "left",
    68: "right",
    87: "up",
    83: "down",
    09: "space",
    32: 'enter',
    49: 'skill1',
    50: 'skill2'
}
var keys = new trackKeys(arrow);
var scale = 100;
var ligth = document.getElementById('ligth');
var mist = document.getElementById('mist');
var maxStep = 0.05;
var plan = [
    ['xcxcx',
        'x @ c',
        'x Z x',
        'cxxxx',
    ],
    ['xcxcx',
        'x @ c',
        'xZcZx',
        'c Z x',
        'xccxx'
    ],
    ['xcxxcx',
        'x@x Bc',
        'xSx  x',
        'cZc  x',
        'cS  Zx',
        'xccxxx'
    ],
    ['xcxcxcx',
        'xZZZZZc',
        'xSSSSSx',
        'c cxc x',
        'c xZx x',
        'c@   Bx',
        'xccxcxx'
    ],
    ['xcxcxxcx',
        'xG S   c',
        'xSxccx x',
        'c xSGx x',
        'c x Sc x',
        'c@cS   x',
        'cxxxzxxx',
    ],
    ['xcxcxxxcx',
        'xS  S  Sc',
        'x  ZZZ  x',
        'cI Z@Z Ix',
        'c  ZZZ  x',
        'c   S   x',
        'cccccxxxx',
    ],
    ['xcxcxxxcx',
        'xSZZSZZSc',
        'x  xZx  x',
        'cxSc@cxSx',
        'c  xxx  x',
        'cG  S  Ix',
        'cccccxxxx',
    ],
    ['xcxcxccxxcx',
        'x@        c',
        'x         x',
        'c    L    x',
        'c         x',
        'c         x',
        'ccxccxxxxxx',
    ],
]
var img = document.createElement('img');
img.src = "./images/walls.png";
//player
var Grim = new Player();

var projectalesImg = document.createElement('img');
projectalesImg.src = './images/projectile.png';

var skillEffects = document.createElement('img');
skillEffects.src = './images/skillEffects.png'

var lifeSprite = document.createElement('img');
lifeSprite.src = './images/lifeSorite.png';

var actors = {
    "Z": Zombie,
    "B": BigZombie,
    "S": Spike,
    "I": Imp,
    "G": Ghost,
    "L": Lich
}
//constructors declarated
function Level(level, n) {
    this.level = n;
    this.pastTime = 0;
    this.enemyCount = 3 + n * 2;
    this.width = level[0].length;
    this.height = level.length;
    this.monsterCreatedDelay = 20;
    this.spots = [];
    this.grid = [];
    this.actors = [];
    for (let x = 0; x < this.height; x++) {
        var gridLine = []
        for (let y = 0; y < this.width; y++) {
            var ch = level[x][y];
            var Actor = actors[ch];
            if (Actor) {
                this.actors.push(new Actor(new Vector(y, x), false, 0, this.level))
            }
            fieldType = null
            if (ch == '@') {
                Grim.pos = new Vector(y, x)
            }
            if (ch == 'x') {
                fieldType = 'wall'
            }
            if (ch == 'c') {
                fieldType = 'wall2'
            }
            if (ch == ' ') {
                this.spots.push({
                    x: y,
                    y: x
                })
            }
            gridLine.push(fieldType)
        }
        this.grid.push(gridLine)
    }
    this.status = this.finishDelay = null;
    this.player = Grim;
    this.actors.push(this.player);
    drawHud(this.player.hp, this.player.mana)
}

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

function Player() {
    this.findedHeart = false;
    this.gold = 0;
    this.dom = document.createElement('img');
    this.dom.src = './images/grimknigtht.png';
    this.castRecently = false;
    this.mana = 0;
    this.armor = 0;
    this.castSpeed = 1.25;
    this.magickPower = 0;
    this.skills = [];
    this.usedSkill = false;
    this.animCount = 0;
    this.animationTime = 0;
    this.pos;
    this.type = 'player';
    this.size = new Vector(0.45, 0.25);
    this.speed = new Vector(0, 0);
    this.playerSpeed = 0.5;
    this.fliped = false;
    this.radius = 2;
    this.ligthRadius = 0.8;
    this.attacked = false;
    this.attackSpeed = 1.35;
    this.killedRecently = false;
    this.died = false;
    this.damaged = false;
    this.blockChance = 0.65;
    this.defended = false;
    this.minDamage = 1.2;
    this.maxDamage = 4.2;
    this.hp = 20;
    this.maxHp = 20;
    this.casted = false;

}

function Spike(pos) {
    this.pos = pos;
    this.animationTime = 0;
    this.spiked = false;
    this.size = new Vector(1, 1);
    this.deal = false;
    this.type = 'spike';
    this.dom = document.createElement('img');
    this.dom.src = './images/spikes.png'
}

function Imp(pos, created, time, power) {
    this.dom = document.createElement('img');
    this.dom.src = './images/imp.png';
    this.frozen = false;
    this.speed = new Vector(0, 0);
    this.type = "imp";
    this.size = new Vector(0.55, 0.35);
    this.moveSpeed = 0.25 * (1 + power / 12);
    this.animCount = 0;
    this.animationTime = 0;
    this.fliped = false;
    this.pos = pos;
    this.direction = new Vector(0, 0);
    this.moveDelay = Math.floor(Math.random() * (8));
    this.damaged = false;
    this.died = false;
    this.attacked = false;
    this.casted = false;
    this.castSpeed = 2.6;
    this.attackTime = 1.8 * (1 - power / 12);
    this.blockedHit = false;
    this.minDamage = 2 * (1 + power / 12);
    this.maxDamage = 10 * (1 + power / 12);
    this.hp = 30 * (1 + power / 12);
    this.created = created;
    this.createdTime = time;
    this.bounty = (Math.random() * (55 - 20) + 20)
}

function Lich(pos, created, time, power) {
    this.dom = document.createElement('img');
    this.dom.src = './images/THE LICH.png';
    this.frozen = false;
    this.speed = new Vector(0, 0);
    this.type = "LICH";
    this.size = new Vector(0.55, 0.35);
    this.moveSpeed = 1;
    this.animCount = 0;
    this.animationTime = 0;
    this.fliped = false;
    this.pos = pos;
    this.direction = new Vector(0, 0);
    this.moveDelay = Math.floor(Math.random() * (8));
    this.damaged = false;
    this.died = false;
    this.diedWithoutHeart = false;
    this.attacked = false;
    this.casted = false;
    this.castSpeed = 2.6;
    this.attackTime = 2;
    this.blockedHit = false;
    this.castRecentlyDN = false;
    this.castRecentlySummon = false;
    this.minDamage = 3
    this.maxDamage = 7
    this.hp = 100
}

function Ghost(pos, created, time, power) {
    this.dom = document.createElement('img');
    this.dom.src = './images/ghost.png';
    this.castRecently = false;
    this.frozen = false;
    this.speed = new Vector(0, 0);
    this.type = "imp";
    this.size = new Vector(0.35, 0.30);
    this.moveSpeed = 0.7 * (1 + power / 12);
    this.animCount = 0;
    this.animationTime = 0;
    this.fliped = false;
    this.pos = pos;
    this.direction = new Vector(0, 0);
    this.moveDelay = Math.floor(Math.random() * (8));
    this.damaged = false;
    this.died = false;
    this.attacked = false;
    this.casted = false;
    this.castSpeed = 3.0;
    this.attackTime = 1.2;
    this.blockedHit = false;
    this.minDamage = 2
    this.maxDamage = 4
    this.hp = 10
    this.created = created;
    this.createdTime = time;
    this.bounty = (Math.random() * (35 - 15) + 15)
}

function Projectale(pos, name, speed, fliped) {
    this.type = 'projectale'
    this.pos = pos;
    this.name = name;
    this.speed = speed;
    this.fliped = fliped;
    this.animCount = 0;
    this.animationTime = 0;
    this.size = new Vector(0.2, 0.2)
    this.lifeTime = 4;
}

function Zombie(pos, created, time, power) {
    this.dom = document.createElement('img');
    this.dom.src = './images/zombie.png'
    this.frozen = false;
    this.speed = new Vector(0, 0);
    this.type = "zombie";
    this.size = new Vector(0.45, 0.25);
    this.moveSpeed = 0.25 * (1 + power / 15);
    this.animCount = 0;
    this.animationTime = 0;
    this.fliped = false;
    this.pos = pos;
    this.direction = new Vector(0, 0);
    this.moveDelay = Math.floor(Math.random() * (4));
    this.damaged = false;
    this.died = false;
    this.attacked = false;
    this.attackTime = 1.8 * (1 - power / 15);
    this.blockedHit = false;
    this.minDamage = 0.4 * (1 + power / 12);
    this.maxDamage = 1.2 * (1 + power / 12);
    this.hp = 10 + power;
    this.created = created;
    this.createdTime = time;
    this.bounty = (Math.random() * (15 - 5) + 5) + power;
    this.soundPlayed = false;
    this.audio = document.createElement('audio');
    this.audio.src = './music/zombie.mp3'
}

function BigZombie(pos, created, time, power) {
    this.dom = document.createElement('img');
    this.dom.src = './images/bigZombie.png'
    this.frozen = false;
    this.speed = new Vector(0, 0);
    this.type = "bigzombie";
    this.size = new Vector(0.55, 0.35);
    this.moveSpeed = 0.10 * (1 + power / 12);
    this.animCount = 0;
    this.animationTime = 0;
    this.fliped = false;
    this.pos = pos;
    this.direction = new Vector(0, 0);
    this.moveDelay = Math.floor(Math.random() * (8));
    this.damaged = false;
    this.died = false;
    this.attacked = false;
    this.attackTime = 2 - (power / 10);
    this.blockedHit = false;
    this.minDamage = 3.4 * (1 + power / 12);
    this.maxDamage = 6.6 * (1 + power / 12);
    this.hp = 22 * (1 + power / 12);
    this.created = created;
    this.createdTime = time;
    this.bounty = (Math.random() * (30 - 25) + 25) + (power * 1.5)
}

function Display(level) {
    this.level = level;
    this.cnv = document.querySelector('canvas');
    this.cnv.width = level.width * scale
    this.cnv.height = level.height * scale
    this.cx = document.querySelector('canvas').getContext('2d');
}

function trackKeys(keys) {
    var pressed = Object.create(null);

    function handler(event) {
        if (keys.hasOwnProperty(event.keyCode)) {
            var down = event.type == "keydown";
            pressed[keys[event.keyCode]] = down;
            event.preventDefault()
        }
    }

    function handlerMouse(event) {
        var down = event.type == 'mousedown';
        pressed['space'] = down;
    }
    addEventListener('keydown', handler)
    addEventListener('keyup', handler)
    addEventListener('mousedown', handlerMouse)
    addEventListener('mouseup', handlerMouse)
    return pressed;
}

function Skill(pos, start, end, name, r) {
    this.pos = pos;
    this.start = start;
    this.end = end;
    this.animationTime = 0;
    this.type = 'skill';
    this.name = name;
    this.size = new Vector(0, 0)
    if (r) {
        this.r = r;
    }
}
//spike functions
Spike.prototype.act = function (step, keys, level) {
    if (this.animationTime > 3) {
        this.spiked = this.spiked ? false : true
        this.animationTime = 0;
        this.deal = false
    }
    if (level.collisionPlayer(this) && this.spiked && !this.deal) {
        level.player.takeDamage(1, new Vector(0, 0), "spike", 1, step)
        this.deal = true
    }
    this.animationTime += step;
}
Spike.prototype.draw = function (display, step, level) {
    if (this.spiked) {
        display.cx.drawImage(this.dom, 0, 0, 60, 60, this.pos.x * scale, this.pos.y * scale, 100, 100)
    } else {
        display.cx.drawImage(this.dom, 60, 0, 60, 60, this.pos.x * scale, this.pos.y * scale, 100, 100)
    }
}
//lich functions
Lich.prototype.draw = function (display, step, level) {
    display.cx.save();
    if (this.diedWithoutHeart) {
        this.animCount = 30;
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        }
    } else if (this.died) {
        if (this.animCount < 21) {
            this.animCount = 21;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        }
        this.animationTime += step;
        if (this.animationTime > 1 / 4) {
            this.animCount++;
            if (this.animCount > 36) {
                this.animCount = 32
            }
            this.animationTime = 0;
        }
    } else if (this.attacked) {
        if (this.animCount < 7 || this.animCount > 12) {
            this.animCount = 7
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        }
        if (this.animationTime > this.attackTime / 3) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else if (this.casted) {
        if (this.animCount < 13 || this.animCount > 19) {
            this.animCount = 13
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        }
        if (this.animationTime > 1) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else {

        if (this.animCount > 6) {
            this.animCount = 0
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 45, this.pos.y * scale - 120, 160, 160);
        }
        if (this.animationTime > 1 / (this.moveSpeed * 10)) {
            this.animCount++;
            this.animationTime = 0;
        }
    }
    //display.cx.fillStyle = 'black';
    // display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    this.animationTime += step;
    display.cx.restore()

}
Lich.prototype.summon = function (level) {
    for (let i = 0; i < 2; i++) {
        var randomSpot = Math.floor(Math.random() * (level.spots.length - 0));
        var enemy = new Zombie(new Vector(level.spots[randomSpot].x, level.spots[randomSpot].y), true, 2, level.level)
        level.actors.push(enemy)
    }
}
Lich.prototype.act = function (step, keys, level) {
    var playerForAttack = level.findPlayer(this, 1.5);
    var playerForCast = level.findPlayer(this, 1);
    var playerForDeathNova = level.findPlayer(this, 0.5);
    if (this.died || this.casted) {

    } else if (playerForDeathNova && !this.castRecentlyDN) {
        console.log("nova")
        this.casted = true;
        this.castRecentlyDN = true;
        setTimeout(() => {
            level.actors.push(new Skill(this.pos, 14, 19, 'deathnova'))
            setTimeout(() => {
                if (level.findPlayer(this, 1)) {
                    if (!this.died) {
                        console.log(level.findDelta(this, level.player))
                        level.player.takeDamage(0.4, level.findDelta(this, level.player).scale(3), 'zombie', (Math.random() * (10 - 2) + 2), step)
                    }
                }
            }, 350)
            this.casted = false;
        }, this.castSpeed * 1000)
        setTimeout(() => {
            this.castRecentlyDN = false;
        }, 10000)
    } else if (playerForCast && !this.castRecentlySummon) {
        console.log("cast")
        this.casted = true;
        this.castRecentlySummon = true;
        setTimeout(() => {
            this.summon(level);
            this.casted = false
        }, this.castSpeed * 1000)
        setTimeout(() => {
            this.castRecentlySummon = false;
        }, 20000)
    } else if (playerForAttack && !this.attacked) {
        console.log("attack")
        this.attacked = true;
        setTimeout(() => {
            level.actors.push(new Skill(level.player.pos, 7, 13, 'frostblades'))
            setTimeout(() => {
                if (level.player.defended) {
                    if (Math.random() > level.player.blockChance) {
                        level.player.takeDamage(0.4, new Vector(0, 0), 'zombie', (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage), step)
                    } else {

                    }
                } else {
                    level.player.takeDamage(0.4, new Vector(0, 0), 'zombie', (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage), step)
                }
            }, 300)
            this.attacked = false;
            this.blockedHit = false
        }, this.attackTime * 1000)
    } else {
        this.moveDelay -= step;
        if (this.moveDelay < 1) {
            this.speed = new Vector(0, 0)
        }
        if (this.moveDelay <= 0) {
            this.moveDelay = 4;
            var randomX = Math.random();
            var randomY = Math.random();
            this.speed.x = randomX > 0.3 ? randomX < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.speed.y = randomY > 0.3 ? randomY < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.fliped = this.speed.x > 0 ? false : true;
        }
        var motion = new Vector(this.speed.x * step, this.speed.y * step);
        var grid = level.collisionGrid(this.pos.plus(motion), this.size)
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    }
}
//ghost functions
Ghost.prototype.act = function (step, keys, level) {
    var player = level.collisionPlayer(this)
    if (this.created) {
        setTimeout(() => {
            this.created = false;
        }, this.createdTime * 1000)
    } else if (this.died || this.frozen || this.casted) {

    } else if (this.damaged) {
        this.moveDelay = 0;
        var motion = this.speed.scale(step)
        var grid = level.collisionGrid(this.pos.plus(motion), this.size);
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    } else if (player && !this.attacked) {
        this.attacked = true;
        setTimeout(() => {
            this.attacked = false;
            this.blockedHit = false
        }, this.attackTime * 1000)
    } else if (this.attacked) {
        this.moveDelay = 0;
        var p = level.collisionPlayer(this)
        if (this.animCount >= 10 && p && this.animCount <= 11) {
            if (!p.damaged) {
                var damage = (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage).toFixed(1);
                if (p.defended) {
                    var r = Math.random();
                    if (r > p.blockChance && !this.blockedHit) {
                        p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                    }
                    this.blockedHit = true;
                } else {
                    p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                }
            }
        }
    } else if (level.findPlayer(this, 1.5) && !this.casted && !this.castRecently) {
        this.moveDelay = 0;
        this.casted = true;
        this.castRecently = true;
        this.fliped = level.findDelta(this, level.player).x < 0 ? true : false
        setTimeout(() => {
            if (this.casted) {
                var x = this.pos.x - level.player.pos.x
                var y = this.pos.y - level.player.pos.y
                var fliped = x < 0 ? true : false
                level.actors.push(new Projectale(this.pos, 'skull', new Vector(0, 0), fliped));
            }
            this.casted = false
            console.log(level.actors)
        }, this.castSpeed * 1000);
        setTimeout(() => {
            this.castRecently = false
        }, 10000)
    } else {
        this.moveDelay -= step;
        if (this.moveDelay < 1) {
            this.speed = new Vector(0, 0)
        }
        if (this.moveDelay <= 0) {
            this.moveDelay = 4;
            var randomX = Math.random();
            var randomY = Math.random();
            this.speed.x = randomX > 0.3 ? randomX < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.speed.y = randomY > 0.3 ? randomY < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.fliped = this.speed.x > 0 ? false : true;
        }
        var motion = new Vector(this.speed.x * step, this.speed.y * step);
        var grid = level.collisionGrid(this.pos.plus(motion), this.size)
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    }
}
Ghost.prototype.draw = function (display, step, ) {
    display.cx.save();
    if (this.created) {
        if (this.animCount < 26) {
            this.animCount = 26;
        }
        display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        if (this.animationTime > this.createdTime / 3.5) {
            this.animCount++;
            this.animationTime = 0;
            if (this.animCount > 32) {
                this.animCount = 26
            }
        }
        this.animationTime += step;
    } else if (this.died) {
        if (this.animCount < 19 || this.animCount > 25) {
            this.animCount = 18;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        }
        this.animationTime += step;
        if (this.animationTime > 1 / 4) {
            this.animCount++;
            if (this.animCount === 26) {
                this.animCount = 25
            }
            this.animationTime = 0;
        }
    } else if (this.frozen) {
        this.animCount = 33;
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        }
    } else if (this.damaged) {
        this.animCount = (this.animCount < 19 || this.animCount > 33) ? 19 : 34
        console.log(this.animCount)
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        }
        if (this.animationTime > 0) {

        }
        this.animationTime += step;
    } else if (this.casted) {
        if (this.animCount < 12 || this.animCount > 18) {
            this.animCount = 12
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        }
        if (this.animationTime > this.castSpeed / 3.2) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else if (this.attacked) {
        if (this.animCount < 6 || this.animCount > 11) {
            this.animCount = 6
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
        }
        if (this.animationTime > this.attackTime / 2.5) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else {
        if (this.speed.x == 0 && this.speed.y == 0) {
            this.animCount = 0
            this.animationTime = 0;
            this.animCount = 0;
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
            } else {
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
            }
        } else {
            if (this.animCount > 5) {
                this.animCount = 1
            }
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
            } else {
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 25, this.pos.y * scale - 70, 90, 90);
            }
            if (this.animationTime > 1 / (this.moveSpeed * 20)) {
                this.animCount++;
                this.animationTime = 0;
            }
        }

    }
    //display.cx.fillStyle = 'black';
    //display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    this.animationTime += step;
    display.cx.restore()

}
//imp functions
Imp.prototype.act = function (step, keys, level) {
    var player = level.collisionPlayer(this)
    if (this.created) {
        setTimeout(() => {
            this.created = false;
        }, this.createdTime * 1000)
    } else if (this.died || this.frozen || this.casted) {

    } else if (this.damaged) {
        this.moveDelay = 0;
        var motion = this.speed.scale(step)
        var grid = level.collisionGrid(this.pos.plus(motion), this.size);
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    } else if (player && !this.attacked) {
        this.attacked = true;
        setTimeout(() => {
            this.attacked = false;
            this.blockedHit = false
        }, this.attackTime * 1000)
    } else if (this.attacked) {
        this.moveDelay = 0;
        var p = level.collisionPlayer(this)
        if (this.animCount >= 10 && p && this.animCount <= 11) {
            if (!p.damaged) {
                var damage = (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage).toFixed(1);
                if (p.defended) {
                    var r = Math.random();
                    if (r > p.blockChance && !this.blockedHit) {
                        p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                    }
                    this.blockedHit = true;
                } else {
                    p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                }
            }
        }
    } else if (level.findPlayer(this, 1.5) && !this.casted) {
        this.casted = true;
        this.fliped = level.findDelta(this, level.player).x < 0 ? true : false
        setTimeout(() => {
            if (this.casted) {
                var x = this.pos.x - level.player.pos.x
                var y = this.pos.y - level.player.pos.y
                var stepX = x < 0 ? new Vector(-x, 0) : new Vector(-x, 0)
                var stepY = y < 0 ? new Vector(0, -y) : new Vector(0, -y)
                stepX = Math.abs(x) < 0.05 ? new Vector(0, 0) : stepX
                stepY = Math.abs(y) < 0.05 ? new Vector(0, 0) : stepY
                var m = stepX.plus(stepY);
                var fliped = x < 0 ? true : false
                level.actors.push(new Projectale(this.pos, 'fire', m.scale(0.5), fliped));
            }
            this.casted = false
        }, this.castSpeed * 1000);
    } else {
        this.moveDelay -= step;
        if (this.moveDelay < 1) {
            this.speed = new Vector(0, 0)
        }
        if (this.moveDelay <= 0) {
            this.moveDelay = 4;
            var randomX = Math.random();
            var randomY = Math.random();
            this.speed.x = randomX > 0.3 ? randomX < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.speed.y = randomY > 0.3 ? randomY < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.fliped = this.speed.x > 0 ? false : true;
        }
        var motion = new Vector(this.speed.x * step, this.speed.y * step);
        var grid = level.collisionGrid(this.pos.plus(motion), this.size)
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    }
}
Imp.prototype.draw = function (display, step, ) {
    display.cx.save();
    if (this.created) {
        if (this.animCount < 27) {
            this.animCount = 27;
        }
        display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        if (this.animationTime > this.createdTime / 3.5) {
            this.animCount++;
            this.animationTime = 0;
            if (this.animCount > 32) {
                this.animCount = 27
            }
        }
        this.animationTime += step;
    } else if (this.died) {
        if (this.animCount < 18 || this.animCount > 26) {
            this.animCount = 18;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        }
        this.animationTime += step;
        if (this.animationTime > 1 / 4) {
            this.animCount++;
            if (this.animCount === 27) {
                this.animCount = 26
            }
            this.animationTime = 0;
        }
    } else if (this.frozen) {
        this.animCount = 33;
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        }
    } else if (this.damaged) {
        this.animCount = (this.animCount < 1 || this.animCount > 34) ? 18 : 35
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        }
        if (this.animationTime > 0) {

        }
        this.animationTime += step;
    } else if (this.casted) {
        if (this.animCount < 12 || this.animCount > 17) {
            this.animCount = 12
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        }
        if (this.animationTime > this.castSpeed / 3.2) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else if (this.attacked) {
        if (this.animCount < 6 || this.animCount > 11) {
            this.animCount = 6
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
        }
        if (this.animationTime > this.attackTime / 2.5) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else {
        if (this.speed.x == 0 && this.speed.y == 0) {
            this.animCount = 0
            this.animationTime = 0;
            this.animCount = 0;
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
            } else {
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
            }
        } else {
            if (this.animCount > 5) {
                this.animCount = 1
            }
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
            } else {
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 90, 128, 128);
            }
            if (this.animationTime > 1 / (this.moveSpeed * 20)) {
                this.animCount++;
                this.animationTime = 0;
            }
        }

    }
    //display.cx.fillStyle = 'black';
    //display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    this.animationTime += step;
    display.cx.restore()

}
//projectiles functions
Projectale.prototype.act = function (step, keys, level) {
    switch (this.name) {
        case "fire":
            var motion = this.pos.plus(this.speed.scale(step))
            var grid = level.collisionGrid(motion, this.size);
            var p = level.collisionPlayer(this);
            if (grid) {
                level.deleteActor(this)
            } else if (p) {
                if (p.defended) {
                    if (Math.random() > p.blockChance) {
                        level.takeDamage(level.player, 4, step, this.speed)
                    } else {

                    }
                } else {
                    level.takeDamage(level.player, 4, step, this.speed)
                }
                level.deleteActor(this)
            } else {
                this.pos = motion;
            }
            break;
        case 'skull':
            this.lifeTime -= step;
            if (this.lifeTime < 0) {
                level.deleteActor(this)
            }
            var p = level.collisionPlayer(this)
            var playerPos = level.player.pos;
            var deltaX = playerPos.x - this.pos.x;
            var deltaY = playerPos.y - this.pos.y;
            var stepX = deltaX < 0 ? new Vector(-0.5 * step, 0) : new Vector(0.5 * step, 0);
            var stepY = deltaY < 0 ? new Vector(0, -0.5 * step) : new Vector(0, 0.5 * step);
            stepY = Math.abs(deltaY) < 0.1 ? new Vector(0, 0) : stepY;
            stepX = Math.abs(deltaX) < 0.1 ? new Vector(0, 0) : stepX;
            this.fliped = deltaX > 0 ? true : false
            var motion = stepX.plus(stepY);
            var newPos = this.pos.plus(motion);
            if (level.collisionGrid(newPos, this.size)) {

            } else if (p) {
                if (p.defended) {
                    if (Math.random() > p.blockChance) {
                        level.takeDamage(level.player, 4, step, this.speed)
                    } else {

                    }
                } else {
                    level.takeDamage(level.player, 4, step, this.speed)
                }
                level.deleteActor(this)
            } else {
                this.pos = newPos;
            }
            break;

    }
}
Projectale.prototype.draw = function (display, step, level) {
    display.cx.save();
    switch (this.name) {
        case "fire":
            if (this.animCount > 2) {
                this.animCount = 0
            }
            if (!this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale)
                display.cx.drawImage(projectalesImg, this.animCount * 36, 0, 36, 36, this.pos.x * scale, this.pos.y * scale, 20, 20);
            } else {
                display.cx.drawImage(projectalesImg, this.animCount * 36, 0, 36, 36, this.pos.x * scale, this.pos.y * scale, 20, 20);
            }
            if (this.animationTime > 0.1) {
                this.animationTime = 0;
                this.animCount++;
            }
            this.animationTime += step;
            break;
        case "skull":
            if (this.animCount > 6 || this.animCount < 3) {
                this.animCount = 3
            }
            if (!this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale)
                display.cx.drawImage(projectalesImg, this.animCount * 36, 0, 36, 36, this.pos.x * scale, this.pos.y * scale, 20, 20);
            } else {
                display.cx.drawImage(projectalesImg, this.animCount * 36, 0, 36, 36, this.pos.x * scale, this.pos.y * scale, 20, 20);
            }
            if (this.animationTime > 0.1) {
                this.animationTime = 0;
                this.animCount++;
            }
            this.animationTime += step;
            break;
    }
    // display.cx.fillStyle = 'black';
    //display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    display.cx.restore()
}
//skill functins
Skill.prototype.draw = function (display, step, level) {
    display.cx.save();
    switch (this.name) {
        case 'ddead':
            display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale - 10, this.pos.y * scale - 43, 80, 80);
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
        case 'deathnova':
            display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale - 95, this.pos.y * scale - 120, 200, 200);
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
        case 'frostblades':
            display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale - 95, this.pos.y * scale - 120, 200, 200);
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
        case 'frost nova':
            display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale - 95, this.pos.y * scale - 120, 200, 200);
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
        case 'gods beam':

            if (level.player.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale + 45, this.pos.y * scale - 20, 400, 40);

            } else {
                display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale + 45, this.pos.y * scale - 20, 400, 40);
            }
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
        case 'heal':
            display.cx.drawImage(skillEffects, this.start * 60, 0, 60, 60, this.pos.x * scale - 20, this.pos.y * scale - 60, 100, 100);
            if (this.animationTime > 0.2) {
                this.start++;
                if (this.start > this.end) {
                    level.deleteActor(this)
                }
            }
            this.animationTime += step;
            break;
    }
    display.cx.restore()
}
//Vector functions
Vector.prototype.plus = function (other) {
    return new Vector(this.x + other.x, this.y + other.y)
}
Vector.prototype.scale = function (times) {
    return new Vector(this.x * times, this.y * times)
}
//player functions
Player.prototype.moveX = function (step, keys, level) {
    this.speed.x = 0
    if (keys.right) {
        this.speed.x += this.playerSpeed;
    }
    if (keys.left) {
        this.speed.x -= this.playerSpeed;
    }
    var motion = new Vector(this.speed.x * step, 0)
    var newPos = this.pos.plus(motion)
    var grid = level.collisionGrid(newPos, this.size)
    if (grid) {

    } else {
        this.pos = this.pos.plus(motion)
    }
}
Player.prototype.moveY = function (step, keys, level) {
    this.speed.y = 0
    if (keys.up) {
        this.speed.y -= this.playerSpeed;
    }
    if (keys.down) {
        this.speed.y += this.playerSpeed;
    }
    var motion = new Vector(0, this.speed.y * step)
    var newPos = this.pos.plus(motion)
    var grid = level.collisionGrid(newPos, this.size)
    if (grid) {

    } else {
        this.pos = this.pos.plus(motion)
    }

}
Player.prototype.isUseSkill = function (keys) {
    if (keys.skill1) {
        return 1;
    }
    if (keys.skill2) {
        return 2;
    } else {
        return null;
    }
}
Player.prototype.useSkill = function (step, level, skill) {
    if (this.skills[skill - 1]) {
        var s = this.skills[skill - 1];
        switch (this.skills[skill - 1].name) {
            case "Detonate dead":
                var corpse = level.collisionCircle(this.pos.x, this.pos.y, 2);
                if (corpse) {
                    corpse = corpse.filter((elem) => {
                        return elem.died
                    })[0]
                }
                if (corpse) {
                    var nearenemy = level.collisionCircle(corpse.pos.x, corpse.pos.y, 2).filter((elem) => {
                        return !elem.died && !elem.created && elem.type != 'spike' && elem.type != 'projectale'
                    });
                    nearenemy.forEach((elem) => {
                        var damage = ((Math.random() * (s.maxDamage - s.minDamage) + s.minDamage) + this.magickPower).toFixed(1)
                        level.takeDamage(elem, damage, step, level.findDelta(corpse, elem))
                    })
                    level.actors.push(new Skill(corpse.pos, 0, 6, 'ddead'))
                    level.deleteActor(corpse)
                }
                break;
            case "Frost nova":
                var nearenemy = level.collisionCircle(this.pos.x, this.pos.y, s.radius);
                if (nearenemy) {
                    nearenemy = nearenemy.filter((elem) => {
                        return !elem.died && !elem.created && elem.type != 'spike' && elem.type != 'projectale'
                    });
                    nearenemy.forEach((elem) => {
                        var damage = ((Math.random() * (s.maxDamage - s.minDamage) + s.minDamage) + this.magickPower).toFixed(1)
                        level.takeDamage(elem, damage, step, new Vector(0, 0), elem);
                        elem.frozen = true;
                        setTimeout(() => {
                            if (elem) {
                                elem.frozen = false;
                            }
                        }, 3000)
                    })
                }
                level.actors.push(new Skill(this.pos, 20, 26, 'frost nova', s.radius))
                break
            case "Gods beam":
                if (this, this.fliped) {
                    var skillBox = {
                        size: this.size.plus(new Vector(4, 0)),
                        pos: this.pos.plus(new Vector(-4, 0))
                    }
                } else {
                    var skillBox = {
                        size: this.size.plus(new Vector(4, 0)),
                        pos: this.pos
                    }
                }
                var nearenemy = level.collisionActors(skillBox)
                console.log(nearenemy)
                if (nearenemy) {
                    nearenemy = nearenemy.filter((elem) => {
                        return !elem.died && !elem.created && elem.type != 'projectale'
                    });
                    nearenemy.forEach((elem) => {
                        var damage = ((Math.random() * (s.maxDamage - s.minDamage) + s.minDamage) + this.magickPower).toFixed(1)
                        level.takeDamage(elem, damage, step, new Vector(0, 0), elem);
                    })
                }
                level.actors.push(new Skill(this.pos, 27, 33, 'gods beam', s.radius))
                break
            case "Heal":
                console.log(this.hp)
                var damage = Number(((Math.random() * (s.maxDamage - s.minDamage) + s.minDamage) + this.magickPower).toFixed(1))
                console.log(typeof (damage));
                this.hp += damage;
                if (this.hp > this.maxHp) {
                    this.hp = this.maxHp;
                }
                drawHud(this.hp, this.mana)
                level.actors.push(new Skill(this.pos, 34, 42, 'heal', s.radius))
                createInfo(`you healed by ${damage}`, this.pos.x, this.pos.y, step, 'yellow')
                break
        }
    }
}
Player.prototype.act = function (step, keys, level) {
    var enemy = level.collisionActors(this);
    var skill = this.isUseSkill(keys);
    if (skill && !this.casted && !this.castRecently) {
        if (!this.skills[skill - 1]) {
            createInfo("You have no skill", this.pos.x, this.pos.y, step, 'blue')
            this.castRecently = true;
            setTimeout(() => {
                this.castRecently = false;
            }, this.castSpeed * 1000)
        } else if (this.mana < this.skills[skill - 1].manacost) {
            createInfo("Not enough mana", this.pos.x, this.pos.y, step, 'blue')
            this.castRecently = true;
            setTimeout(() => {
                this.castRecently = false;
            }, this.castSpeed * 1000)
        } else {
            this.mana -= this.skills[skill - 1].manacost
            drawHud(this.hp, this.mana)
            this.casted = true;
            setTimeout(() => {
                if (!this.damaged && this.casted) {
                    this.useSkill(step, level, skill);
                    this.casted = false;
                    this.castRecently = false;
                }
            }, this.castSpeed * 1000)
        }
    }
    if (keys.space && !this.attacked) {
        this.attacked = true;
        setTimeout(() => {
            this.attacked = false;
        }, this.attackSpeed * 1000)
    }
    this.defended = keys.enter && !this.attacked && !this.cannotDefend ? true : false

    if (this.died || this.defended || this.casted || this.findedHeart) {

    } else if (this.damaged) {
        this.casted = false;
        this.attacked = false;
        var motion = this.speed.scale(step)
        var grid = level.collisionGrid(this.pos.plus(motion), this.size);
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }

    } else if (this.attacked) {
        if (enemy) {
            if (!this.killedRecently && (this.animCount === 12 || this.animCount === 13)) {
                var damage = (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage).toFixed(1);
                var hitSound = document.createElement('audio')
                document.body.appendChild(hitSound)
                hitSound.src = './music/hit.mp3'
                hitSound.currentTime = 0.4;
                hitSound.volume = 0.3
                hitSound.play()
                setTimeout(() => {
                    hitSound.parentNode.removeChild(hitSound)
                }, 1000)
                level.takeDamage(enemy[0], damage, step, level.findDelta(this, enemy[0]));
                this.killedRecently = true;
                setTimeout(() => {
                    this.killedRecently = false;
                }, this.attackSpeed / 5 * 2 * 1200)
            }
        }
    } else {
        this.moveX(step, keys, level)
        this.moveY(step, keys, level)
    }
}
Player.prototype.takeDamage = function (time, Vector, from, damage, step) {
    var totalDamage = damage - this.armor;
    totalDamage = totalDamage < 0 ? 0 : totalDamage
    createInfo(totalDamage.toFixed(1), this.pos.x, this.pos.y, step, 'red')
    this.hp -= totalDamage;
    if (this.hp <= 0) {
        this.died = true;
    }
    this.attacked = false;
    this.cannotDefend = true;
    this.damaged = true;
    this.casted = false;
    this.speed = Vector;
    setTimeout(() => {
        this.damaged = false;
        this.cannotDefend = false
    }, time * 1000)
    drawHud(this.hp, this.mana)
}
//Level functions
Level.prototype.collisionGrid = function (pos, size) {

    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);
    var mass = [];
    for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
            var other = this.grid[y][x];
            if (other) {
                mass.push(other)
            }
        }
    }
    if (mass.length != 0) {
        return mass
    }
}
Level.prototype.collisionActors = function (actor) {
    var mass = [];
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y &&
            other.died == false && !other.created && other.type != 'skill' && other.type != 'spike' && other.type != 'player')
            mass.push(other)
    }
    if (mass.length != 0) {
        return mass;
    }
};
Level.prototype.collisionCircle = function (x, y, r) {
    let mass = []
    for (let i = 0; i < this.actors.length; i++) {
        if (this.actors[i].type != 'player') {
            let circle = {
                x: x,
                y: y,
                r: r
            }
            let rect = {
                w: this.actors[i].size.x,
                h: this.actors[i].size.y,
                y: this.actors[i].pos.y,
                x: this.actors[i].pos.x,
            }
            let distX = Math.abs(circle.x - rect.x - rect.w / 2);
            let distY = Math.abs(circle.y - rect.y - rect.h / 2);
            let dx = distX - rect.w / 2;
            let dy = distY - rect.h / 2;
            if (dx * dx + dy * dy <= (circle.r * circle.r)) {
                mass.push(this.actors[i])
            }
        };
    }
    if (mass.length != 0) {
        return mass;
    }
}
Level.prototype.findDelta = function (target, other) {
    var x = target.pos.x - other.pos.x;
    var y = target.pos.y - other.pos.y;
    var stepX = x < 0 ? new Vector(0.5, 0) : new Vector(-0.5, 0)
    var stepY = y < 0 ? new Vector(0, 0.5) : new Vector(0, -0.5)
    stepX = Math.abs(x) < 0.05 ? new Vector(0, 0) : stepX
    stepY = Math.abs(y) < 0.05 ? new Vector(0, 0) : stepY
    return stepX.plus(stepY);
}
Level.prototype.collisionPlayer = function (actor) {
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y &&
            other.died == false && other.type == 'player')
            return other
    }
}
Level.prototype.deleteActor = function (obj) {
    this.actors = this.actors.filter((elem) => {
        return elem != obj
    })
}
Level.prototype.animate = function (step, keys, level, time) {
    if (this.finishDelay) {
        this.finishDelay -= step;
    }
    this.pastTime = Math.floor(time.toFixed() / 1000)
    this.monsterCreatedDelay -= step;
    if (this.monsterCreatedDelay < 0) {
        this.createEnemy();
        this.monsterCreatedDelay = 10;
    }
    while (step > 0) {
        var thisStep = Math.min(step, maxStep);
        this.actors.forEach(function (actor) {
            if (actor.act) {
                actor.act(thisStep, keys, level);
            }
        }, this);
        step -= thisStep;
    }
}
Level.prototype.checkEnemyCount = function () {
    return this.actors.filter((elem) => {
        return !elem.died && elem.type != 'player' && elem.type != 'spike'
    }).length

}
Level.prototype.setStatus = function (status) {
    this.status = status;
}
Level.prototype.isFinished = function () {
    if (this.checkEnemyCount() == 0 && this.enemyCount <= 0 && this.status == null && this.level != plan.length - 1) {
        this.status = 'win';
        this.player.gold += 50;
        this.finishDelay = 4;
    }
    if (this.level == plan.length - 1 && this.checkEnemyCount() == 0 && this.enemyCount <= 0 && this.status == null) {
        var lich = this.actors.filter((elem) => {
            return elem.type == 'LICH'
        })[0];
        if (this.findPlayer(lich, 0.4)) {
            this.player.findedHeart = true;
            lich.diedWithoutHeart = true;
            endScreen("win");
        }
    }
    if (this.player.died && this.status == null) {
        endScreen('lose')
    }
    return this.status != null && this.finishDelay < 0
}
Level.prototype.createEnemy = function () {
    if (this.level != plan.length - 1) {
        if (this.enemyCount > 0) {
            var rng = (Math.random() * (100));
            if (rng < 0 + this.level) {
                var randomSpot = Math.floor(Math.random() * (this.spots.length - 0));
                var enemy = new Imp(new Vector(this.spots[randomSpot].x, this.spots[randomSpot].y), true, 2, this.level)
                this.actors.push(enemy)
                this.enemyCount -= 4;
            } else if (rng < 10 + this.level) {
                var randomSpot = Math.floor(Math.random() * (this.spots.length - 0));
                var enemy = new Ghost(new Vector(this.spots[randomSpot].x, this.spots[randomSpot].y), true, 2, this.level)
                this.actors.push(enemy)
                this.enemyCount -= 3;
            } else if (rng < 20 + this.level) {
                var randomSpot = Math.floor(Math.random() * (this.spots.length - 0));
                var enemy = new BigZombie(new Vector(this.spots[randomSpot].x, this.spots[randomSpot].y), true, 2, this.level)
                this.actors.push(enemy)
                this.enemyCount -= 2;
            } else {
                var randomSpot = Math.floor(Math.random() * (this.spots.length - 0));
                var enemy = new Zombie(new Vector(this.spots[randomSpot].x, this.spots[randomSpot].y), true, 2, this.level)
                this.actors.push(enemy)
                this.enemyCount--;
            }
        }
    }
}
Level.prototype.findPlayer = function (enemy, r) {
    var playerPos = this.player.pos;
    var deltaX = playerPos.x - enemy.pos.x;
    var deltaY = playerPos.y - enemy.pos.y;
    if (Math.abs(deltaX) < r && Math.abs(deltaY) < r && !this.player.died) {
        return true
    }
}
Level.prototype.takeDamage = function (enemy, damage, step, vector) {
    var totalDamage = damage;
    if (enemy.frozen) {
        totalDamage = totalDamage / 2
    }
    createInfo(totalDamage, enemy.pos.x, enemy.pos.y, step, 'white')
    enemy.hp -= totalDamage;
    if (enemy.type != 'LICH') {
        enemy.casted = false;
    }
    if (enemy.hp <= 0) {
        this.player.gold += Math.round(enemy.bounty)
        console.log(typeof (this.player.gold))
        enemy.died = true;
        if (enemy.type == "LICH") {
            this.actors.map((elem) => {
                if (elem.type == 'zombie') {
                    elem.died = true;
                }
            })
        }
    }
    enemy.attacked = false;
    enemy.damaged = true;
    enemy.speed = vector;
    setTimeout(() => {
        if (enemy) {
            enemy.damaged = false
        }
    }, 400)
    drawHud(this.player.hp, this.player.mana)
}
//Zombie functions
Zombie.prototype.draw = function (display, step) {
    display.cx.save();
    if (this.created) {
        if (this.animCount < 14) {
            this.animCount = 14;
        }
        display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        if (this.animationTime > this.createdTime / 5) {
            this.animCount++;
            this.animationTime = 0;
            if (this.animCount > 20) {
                this.animCount = 20
            }
        }
        this.animationTime += step;
    } else if (this.died) {
        if (this.animCount < 5 || this.animCount > 8) {
            this.animCount = 5;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        }
        this.animationTime += step;
        if (this.animationTime > 1 / 4) {
            this.animCount++;
            if (this.animCount === 9) {
                this.animCount = 8
            }
            this.animationTime = 0;
        }
    } else if (this.frozen) {
        this.animCount = 21;
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        }
    } else if (this.damaged) {
        this.animCount = (this.animCount < 10 || this.animCount > 22) ? 10 : 30
        console.log(this.animCount)
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        }
        if (this.animationTime > 0) {

        }
        this.animationTime += step;
    } else if (this.attacked) {
        if (this.animCount < 9 || this.animCount > 13) {
            this.animCount = 9
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80);
        }
        if (this.animationTime > this.attackTime / 2.5) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else {
        if (this.speed.x == 0 && this.speed.y == 0) {
            this.animCount = 0
            this.animationTime = 0;
            this.animCount = 0;
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, 0, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
            } else {
                display.cx.drawImage(this.dom, 0, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
            }
        } else {
            if (this.animCount > 4) {
                this.animCount = 0
            }
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
            } else {
                display.cx.drawImage(this.dom, this.animCount * 48, 0, 46, 48, this.pos.x * scale - 20, this.pos.y * scale - 50, 80, 80)
            }
            if (this.animationTime > 1 / (this.moveSpeed * 20)) {
                this.animCount++;
                this.animationTime = 0;
            }
        }

    }
    //display.cx.fillStyle = 'black';
    //display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    this.animationTime += step;
    display.cx.restore()

}
Zombie.prototype.act = function (step, keys, level) {
    var player = level.collisionPlayer(this)
    if (this.created) {
        setTimeout(() => {
            this.created = false;
        }, this.createdTime * 1000)
    } else if (this.died || this.frozen) {
        this.audio -= null;
    } else if (this.damaged) {
        this.moveDelay = 0;
        var motion = this.speed.scale(step)
        var grid = level.collisionGrid(this.pos.plus(motion), this.size);
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    } else if (player && !this.attacked) {
        this.attacked = true;
        setTimeout(() => {
            this.attacked = false;
            this.blockedHit = false
        }, this.attackTime * 1000)
    } else if (this.attacked) {
        this.moveDelay = 0;
        var p = level.collisionPlayer(this)
        if (this.animCount >= 12 && p) {
            if (!p.damaged) {
                var damage = (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage).toFixed(1);
                if (p.defended) {
                    var r = Math.random();
                    if (r > p.blockChance && !this.blockedHit) {
                        p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                    }
                    this.blockedHit = true;
                } else {
                    p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                }
            }
        }
    } else if (level.findPlayer(this, 1)) {
        if (!this.soundPlayed) {
            this.soundPlayed = true;
            this.audio.volume = 0.2;
            this.audio.play();
            setTimeout(() => {
                this.soundPlayed = false
            }, 7000)
        }
        this.moveDelay = 0;
        var playerPos = level.player.pos;
        var deltaX = playerPos.x - this.pos.x;
        var deltaY = playerPos.y - this.pos.y;
        var stepX = deltaX < 0 ? new Vector(-this.moveSpeed * step, 0) : new Vector(this.moveSpeed * step, 0);
        var stepY = deltaY < 0 ? new Vector(0, -this.moveSpeed * step) : new Vector(0, this.moveSpeed * step);
        stepY = Math.abs(deltaY) < 0.1 ? new Vector(0, 0) : stepY;
        stepX = Math.abs(deltaX) < 0.1 ? new Vector(0, 0) : stepX;
        this.fliped = deltaX < 0 ? true : false
        this.speed.x = 1;
        var motion = stepX.plus(stepY);
        var newPos = this.pos.plus(motion);
        if (level.collisionGrid(newPos, this.size)) {

        } else {
            this.pos = newPos;
        }
    } else {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.soundPlayed = false;
        this.moveDelay -= step;
        if (this.moveDelay < 1) {
            this.speed = new Vector(0, 0)
        }
        if (this.moveDelay <= 0) {
            this.moveDelay = 4;
            var randomX = Math.random();
            var randomY = Math.random();
            this.speed.x = randomX > 0.3 ? randomX < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.speed.y = randomY > 0.3 ? randomY < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.fliped = this.speed.x > 0 ? false : true;
        }
        var motion = new Vector(this.speed.x * step, this.speed.y * step);
        var grid = level.collisionGrid(this.pos.plus(motion), this.size)
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    }
}
BigZombie.prototype.act = function (step, keys, level) {
    var player = level.collisionPlayer(this)
    if (this.created) {
        setTimeout(() => {
            this.created = false;
        }, this.createdTime * 1000)
    } else if (this.died || this.frozen) {

    } else if (this.damaged) {
        this.moveDelay = 0;
        var motion = this.speed.scale(step)
        var grid = level.collisionGrid(this.pos.plus(motion), this.size);
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    } else if (player && !this.attacked) {
        this.attacked = true;
        setTimeout(() => {
            this.attacked = false;
            this.blockedHit = false
        }, this.attackTime * 1000)
    } else if (this.attacked) {
        this.moveDelay = 0;
        var p = level.collisionPlayer(this)
        if (this.animCount == 12 && p) {
            if (!p.damaged) {
                var damage = (Math.random() * (this.maxDamage - this.minDamage) + this.minDamage).toFixed(1);
                if (p.defended) {
                    var r = Math.random();
                    if (r > p.blockChance && !this.blockedHit) {
                        p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                    }
                    this.blockedHit = true;
                } else {
                    p.takeDamage(0.4, level.findDelta(this, p), 'zombie', damage, step)
                }
            }
        }
    } else if (level.findPlayer(this, 2)) {
        this.moveDelay = 0;
        var playerPos = level.player.pos;
        var deltaX = playerPos.x - this.pos.x;
        var deltaY = playerPos.y - this.pos.y;
        var stepX = deltaX < 0 ? new Vector(-this.moveSpeed * step, 0) : new Vector(this.moveSpeed * step, 0);
        var stepY = deltaY < 0 ? new Vector(0, -this.moveSpeed * step) : new Vector(0, this.moveSpeed * step);
        stepY = Math.abs(deltaY) < 0.1 ? new Vector(0, 0) : stepY;
        stepX = Math.abs(deltaX) < 0.1 ? new Vector(0, 0) : stepX;
        this.fliped = deltaX < 0 ? true : false
        this.speed.x = 1;
        var motion = stepX.plus(stepY);
        motion = motion.scale(3)
        var newPos = this.pos.plus(motion);

        if (level.collisionGrid(newPos, this.size)) {

        } else {
            this.pos = newPos;
        }
    } else {
        this.moveDelay -= step;
        if (this.moveDelay < 1) {
            this.speed = new Vector(0, 0)
        }
        if (this.moveDelay <= 0) {
            this.moveDelay = 4;
            var randomX = Math.random();
            var randomY = Math.random();
            this.speed.x = randomX > 0.3 ? randomX < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.speed.y = randomY > 0.3 ? randomY < 0.6 ? -this.moveSpeed : this.moveSpeed : 0;
            this.fliped = this.speed.x > 0 ? false : true;
        }
        var motion = new Vector(this.speed.x * step, this.speed.y * step);
        var grid = level.collisionGrid(this.pos.plus(motion), this.size)
        if (grid) {

        } else {
            this.pos = this.pos.plus(motion)
        }
    }
}
BigZombie.prototype.draw = function (display, step) {
    display.cx.save();
    if (this.created) {
        if (this.animCount < 14) {
            this.animCount = 14;
        }
        display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        if (this.animationTime > this.createdTime / 5) {
            this.animCount++;
            this.animationTime = 0;
            if (this.animCount > 20) {
                this.animCount = 20
            }
        }
        this.animationTime += step;
    } else if (this.died) {
        if (this.animCount < 5 || this.animCount > 8) {
            this.animCount = 5;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        }
        this.animationTime += step;
        if (this.animationTime > 1 / 2) {
            this.animCount++;
            if (this.animCount === 9) {
                this.animCount = 8
            }
            this.animationTime = 0;
        }
    } else if (this.frozen) {
        this.animCount = 21;
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        }
    } else if (this.damaged) {
        this.animCount = (this.animCount < 10 || this.animCount > 22) ? 10 : 30
        console.log(this.animCount)
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        }
        if (this.animationTime > 0) {

        }
        this.animationTime += step;
    } else if (this.attacked) {
        if (this.animCount < 9 || this.animCount > 13) {
            this.animCount = 9
            this.animationTime = 0;
        }
        if (this.fliped) {
            flipHorizontally(display.cx, this.pos.x * scale + 22)
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
        } else {
            display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120);
        }
        if (this.animationTime > this.attackTime / 2.5) {
            this.animCount++;
            this.animationTime = 0;
        }
        this.animationTime += step;
    } else {
        if (this.speed.x == 0 && this.speed.y == 0) {
            this.animCount = 0
            this.animationTime = 0;
            this.animCount = 0;
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
            } else {
                display.cx.drawImage(this.dom, 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
            }
        } else {
            if (this.animCount > 4) {
                this.animCount = 0
            }
            if (this.fliped) {
                flipHorizontally(display.cx, this.pos.x * scale + 22)
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
            } else {
                display.cx.drawImage(this.dom, this.animCount * 128, 0, 128, 128, this.pos.x * scale - 40, this.pos.y * scale - 75, 120, 120)
            }
            if (this.animationTime > 1 / (this.moveSpeed * 20)) {
                this.animCount++;
                this.animationTime = 0;
            }
        }

    }
    //display.cx.fillStyle = 'black';
    //display.cx.strokeRect(this.pos.x * scale,this.pos.y *scale,this.size.x * scale,this.size.y *scale) 
    this.animationTime += step;
    display.cx.restore()

}
//Display functions
Display.prototype.drawMist = function () {
    var x = this.cnv.getBoundingClientRect().x;
    var y = this.cnv.getBoundingClientRect().y;
    mist.style.width = this.level.width * scale + 'px';
    mist.style.height = this.level.height * scale + 'px';
    mist.style.left = x + 'px';
    mist.style.top = y + 'px';
    ligth.style.left = this.level.player.pos.x * scale - (45 * this.level.player.ligthRadius) * 1.2 + "px";
    ligth.style.top = this.level.player.pos.y * scale - (75 * this.level.player.ligthRadius) * 1.1 + 'px';
    ligth.style.width = 150 * this.level.player.ligthRadius + "px";
    ligth.style.height = 150 * this.level.player.ligthRadius + "px";
}
Display.prototype.drawBg = function () {
    for (let x = 0; x < this.level.width; x++) {
        for (let y = 0; y < this.level.height; y++) {
            if (this.level.grid[y][x]) {
                var num = this.level.grid[y][x] === 'wall' ? 0 : 1
                this.cx.drawImage(img, num * 64, 0, 64, 64, x * scale, y * scale, scale, scale)
            }
        }
    }

}
Display.prototype.clear = function () {
    this.cx.clearRect(0, 0, this.level.width * scale, this.level.height * scale)
}
Display.prototype.drawFrame = function (step, level) {
    this.clear();
    this.drawBg();
    this.drawActors(step, level);
    this.drawMist();
}
Display.prototype.drawActors = function (step, level) {
    this.level.actors.sort(function (a, b) {
        return a.pos.y - b.pos.y
    })
    var spikes = this.level.actors.filter(function (elem) {
        return elem.type == 'spike'
    })
    spikes.forEach((elem) => {
        elem.draw(this, step, level)
    })
    this.level.actors.forEach((elem) => {
        if (elem.type === 'player') {
            this.drawPlayer(step)
        } else if (elem.type != 'spike') {
            elem.draw(this, step, level);
        }
    })
}
Display.prototype.drawPlayer = function (step) {
    this.cx.save();
    var player = this.level.player;
    if (player.findedHeart) {
        if (player.animCount < 30) {
            player.animCount = 30;
        }
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        if (player.animationTime > 0.2) {
            player.animCount++;
            player.animationTime = 0;
            if (player.animCount > 32) {
                player.animCount = 32;
            }
        }
        player.animationTime += step;
    } else if (player.died) {
        if (player.animCount < 17) {
            player.animCount = 17;
        }
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        if (player.animationTime > 0.2) {
            player.animCount++;
            player.animationTime = 0;
            if (player.animCount > 24) {
                player.animCount = 24;
            }
        }
        player.animationTime += step;
    } else if (player.damaged) {
        if (player.animCount < 14 || player.animCount > 15) {
            player.animCount = 14;
        }
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        if (player.animationTime > 0.0) {
            player.animCount++;
            player.animationTime = 0;
        }
        player.animationTime += step;
    } else if (player.attacked) {
        if (player.animCount < 9 || player.animCount > 13) {
            player.animCount = 9;
        }
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        if (player.animationTime > player.attackSpeed / 5) {
            player.animCount++;
            player.animationTime = 0;
        }
        player.animationTime += step;
    } else if (player.casted) {
        if (player.animCount < 25 || player.animCount > 29) {
            player.animCount = 25;
        }
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        if (player.animationTime > player.castSpeed / 5) {
            player.animCount++;
            player.animationTime = 0;
        }
        player.animationTime += step;
    } else if (player.defended) {
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, 16 * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, 16 * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        player.animationTime = 0;
        player.animCount = 0;
    } else if (player.speed.x == 0 && player.speed.y == 0) {
        if (player.fliped) {
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, 8 * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else {
            this.cx.drawImage(player.dom, 8 * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        }
        player.animationTime = 0;
        player.animCount = 0;
    } else {
        if (player.animCount > 8) {

            player.animCount = 0;
        }
        if (player.speed.x > 0) {
            player.fliped = false;
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
        } else if (player.speed.x < 0) {
            player.fliped = true;
            flipHorizontally(this.cx, player.pos.x * scale + 22)
            this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)

        } else if (player.speed.y != 0) {
            if (player.fliped) {
                flipHorizontally(this.cx, player.pos.x * scale + 22)
                this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
            } else {
                this.cx.drawImage(player.dom, player.animCount * 120, 0, 120, 96, player.pos.x * scale - 35, player.pos.y * scale - 40, 110, 65)
            }
        }
        player.animationTime += step;
        if (player.animationTime > 1 / (player.playerSpeed * 10)) {
            player.animCount++;
            player.animationTime = 0
        }
    }
    //this.cx.fillStyle = 'black';
    //this.cx.strokeRect(player.pos.x * scale,player.pos.y *scale,player.size.x * scale,player.size.y *scale)\
    this.cx.restore()
}
//Game functions
function runAnimation(frameFunc) {
    var lastTime = null;

    function frame(time) {
        var stop = false;
        if (lastTime != null) {
            var timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep, time) === false;
        }
        lastTime = time;
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen) {
    var display = new Display(level);
    runAnimation(function (step, time) {
        level.animate(step, keys, level, time);
        display.drawFrame(step, level);
        if (level.isFinished()) {
            display.clear();
            if (andThen) {
                andThen(level.status)
            }
            return false;
        }
    });
}

function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0)
}

function runGame(plan, Display) {
    var buttons = document.getElementsByTagName('button')
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            switch (buttons[i].id) {
                case "attackUpgrade":
                    if (Grim.maxDamage <= 15 && Grim.gold >= 40) {
                        Grim.maxDamage += 0.7;
                        Grim.minDamage += 0.3;
                        Grim.gold -= 40;
                    }
                    break
                case "armorUpgrade":
                    if (Grim.armor <= 2.5 && Grim.gold >= 40) {
                        Grim.armor += 0.1;
                        Grim.blockChance += 0.01;
                        Grim.gold -= 40;
                    }
                    break
                case "lifeUpgrade":
                    if (Grim.maxHp <= 30 && Grim.gold >= 60) {
                        Grim.maxHp += 1;
                        Grim.hp += 1;
                        Grim.gold -= 60;
                    }
                    break
                case 'torchUpgrade':
                    if (Grim.ligthRadius <= 2 && Grim.gold >= 20) {
                        Grim.ligthRadius += 0.1;
                        Grim.gold -= 20;
                    }
                    playerInfo.innerText = getPlayerInfo()
                    break
                case "manaUpgrade":
                    if (Grim.mana <= 20 && Grim.gold >= 35) {
                        Grim.mana += 1;
                        Grim.magickPower += 0.3;
                        Grim.gold -= 35;
                    }
                    break
                case "speedUpgrade":
                    if (Grim.playerSpeed <= 1 && Grim.gold >= 25) {
                        Grim.attackSpeed -= 0.02;
                        Grim.castSpeed -= 0.02;
                        Grim.playerSpeed += 0.02;
                        Grim.gold -= 25
                    }
                    break
                case "LearnDetonateBody":
                    if (Grim.gold >= 50) {
                        if (Grim.skills.filter((elem) => {
                                return elem.name == 'Detonate dead'
                            }).length != 0) {
                            Grim.skills.forEach((elem) => {
                                if (elem.name == "Detonate dead") {
                                    elem.minDamage += 1;
                                    elem.maxDamage += 4.5;
                                    elem.level++;
                                    elem.manacost += 0.1
                                }
                            })
                            Grim.gold -= 50;
                            Grim.mana += 1.2;
                        } else if (Grim.skills.length < 2) {
                            Grim.skills.push({
                                name: "Detonate dead",
                                minDamage: 4,
                                maxDamage: 8,
                                level: 1,
                                manacost: 1.2
                            })
                            Grim.mana += 1.2;
                            Grim.gold -= 50;
                        }

                    }
                    break;
                case "LearnFrostNova":
                    if (Grim.gold >= 50) {
                        if (Grim.skills.filter((elem) => {
                                return elem.name == 'Frost nova'
                            }).length != 0) {
                            Grim.skills.forEach((elem) => {
                                if (elem.name == "Frost nova") {
                                    elem.minDamage += 0.4;
                                    elem.maxDamage += 0.8;
                                    elem.level++;
                                    elem.radius += 0.1;
                                    elem.manacost += 0.07
                                }
                            })
                            Grim.gold -= 50;
                            Grim.mana += 1;
                        } else if (Grim.skills.length < 2) {
                            Grim.skills.push({
                                name: "Frost nova",
                                minDamage: 1,
                                maxDamage: 4,
                                level: 1,
                                manacost: 0.8,
                                radius: 0.65
                            })
                            Grim.gold -= 50;
                            Grim.mana += 1;
                        }
                    }
                    break
                case "LearnGodsBeam":
                    if (Grim.gold >= 50) {
                        if (Grim.skills.filter((elem) => {
                                return elem.name == 'Gods beam'
                            }).length != 0) {
                            Grim.skills.forEach((elem) => {
                                if (elem.name == "Gods beam") {
                                    elem.minDamage += 2;
                                    elem.maxDamage += 2;
                                    elem.level++;
                                    elem.radius += 0.2;
                                    elem.manacost += 0.5
                                }
                            })
                            Grim.gold -= 50;
                            Grim.mana += 2;
                        } else if (Grim.skills.length < 2) {
                            Grim.skills.push({
                                name: "Gods beam",
                                minDamage: 8,
                                maxDamage: 12,
                                level: 1,
                                manacost: 2,
                                radius: 0.5
                            })
                            Grim.gold -= 50;
                            Grim.mana += 2;
                        }
                    }
                    break
                case "LearnHeal":
                    if (Grim.gold >= 50) {
                        if (Grim.skills.filter((elem) => {
                                return elem.name == 'Heal'
                            }).length != 0) {
                            Grim.skills.forEach((elem) => {
                                if (elem.name == "Heal") {
                                    elem.minDamage += 0.5;
                                    elem.maxDamage += 1;
                                    elem.level++;
                                    elem.radius += 0.2;
                                    elem.manacost + 0.1
                                }
                            })
                            Grim.gold -= 50;
                            Grim.mana += 2.8;
                        } else if (Grim.skills.length < 2) {
                            Grim.skills.push({
                                name: "Heal",
                                minDamage: 1,
                                maxDamage: 2,
                                level: 1,
                                manacost: 1.4,
                                radius: 0.5
                            })
                            Grim.gold -= 50;
                            Grim.mana += 2.8;
                        }
                    }
                    break
            }
            playerInfo.innerText = getPlayerInfo()
        })
    }

    function startLevel(n) {
        runLevel(new Level(plan[n], n), Display, function (status) {
            if (status == "win") {
                shop(startLevel, n + 1)
            }
        });
    }
    startLevel(0);
}

function shop(level, n) {
    var playerInfo = document.getElementById('playerInfo')
    playerInfo.innerText = getPlayerInfo();

    function listener() {
        level(n)
        shop.style.visibility = 'hidden'
        b.removeEventListener('click', listener)
    }
    var shop = document.getElementById('shop')
    b = document.getElementById('go')
    shop.style.visibility = 'visible'
    b.addEventListener('click', listener)
}

function createInfo(text, x, y, step, color) {
    var x1 = document.getElementsByTagName('canvas')[0].getBoundingClientRect().x;
    var y1 = document.getElementsByTagName('canvas')[0].getBoundingClientRect().y;
    var elem = document.createElement('div');
    var opacity = 1;
    elem.className = 'info';
    elem.style.color = color;
    elem.style.top = y * scale + y1 - 20 + 'px';
    elem.style.left = x * scale + x1 + 'px';
    elem.innerText = text;
    var timer = setInterval(() => {
        elem.style.top = parseInt(elem.style.top) - step / 2 + 'px'
        elem.style.opacity = opacity;
        opacity -= step;
    }, 100)
    document.body.appendChild(elem)
    setTimeout(() => {
        clearInterval(timer)
        elem.parentNode.removeChild(elem)
    }, 3000)
}

function drawHud(hpcount, mana) {
    var skillWrap = document.getElementById('skills');
    var hpWrap = document.getElementById('hp');
    var manaWrap = document.getElementById('mana');
    hpWrap.innerHTML = '';
    skillWrap.innerHTML = '';
    manaWrap.innerHTML = '';
    var h = Math.floor(hpcount);
    var m = Math.floor(mana);

    function drawElement(h, m, type) {
        switch (type) {
            case 'life':
                if (h > 0) {
                    var rect = document.createElement('div');
                    rect.style.overflow = 'hidden'
                    var img = document.createElement('img');
                    img.src = './images/lifeSorite.png';
                    rect.appendChild(img);
                    var hp = h >= 4 ? 4 : h
                    rect.style.width = 15 * hp + 'px';
                    rect.style.height = 60 + 'px';
                    hpWrap.appendChild(rect)
                    drawElement(h - 4, m, type)
                } else {

                }
                break
            case 'skills':
                var rect = document.createElement('div');
                var img = document.createElement('img');
                Grim.skills.forEach((elem) => {
                    var img = document.createElement('img');
                    if (elem.name == "Detonate dead") {
                        img.src = './icons/detonate dead.png';
                        img.style.width = 64 + 'px'
                        img.style.height = 64 + 'px'
                    } else if (elem.name == "Frost nova") {
                        img.src = './icons/frost nova.png';
                        img.style.width = 64 + 'px'
                        img.style.height = 64 + 'px'
                    } else if (elem.name == "Gods beam") {
                        img.src = './icons/gods beam.png';
                        img.style.width = 64 + 'px'
                        img.style.height = 64 + 'px'
                    } else if (elem.name == "Heal") {
                        img.src = './icons/heal.png';
                        img.style.width = 64 + 'px'
                        img.style.height = 64 + 'px'
                    }
                    rect.appendChild(img)
                    skillWrap.appendChild(rect)
                })
                break
            case 'mana':
                if (m > 0) {
                    var rect = document.createElement('div');
                    rect.style.overflow = 'hidden'
                    var img = document.createElement('img');
                    img.style.width = 64 + 'px'
                    img.style.height = 64 + 'px'
                    img.src = './icons/mana.png';
                    rect.appendChild(img);
                    var mp = m >= 2 ? 2 : m
                    rect.style.width = 30 * mp + 'px';
                    rect.style.height = 60 + 'px';
                    manaWrap.appendChild(rect)
                    drawElement(h, m - 2, type)
                } else {

                }

                break

        }
    }
    drawElement(h, m, 'life')
    drawElement(h, m, 'skills')
    drawElement(h, m, 'mana')
}

function getPlayerInfo() {
    var info = `
    Gold - ${Grim.gold}
    Hp : ${Grim.hp.toFixed(1)}
    Damage : ${Grim.minDamage.toFixed(1)} - ${Grim.maxDamage.toFixed(1)}
    Armor/BlockChance : ${Grim.armor.toFixed(1)}/${(Grim.blockChance * 100).toFixed(1)}%
    Ligth radius : ${Grim.ligthRadius.toFixed(2)}
    Attack speed/Cast speed/Move speed : ${Grim.attackSpeed.toFixed(2)}/${Grim.castSpeed.toFixed(2)}/${Grim.playerSpeed.toFixed(2)}
    `
    return info
}

function endScreen(status) {
    var text = status == 'win' ? 'You win!' : "You lose!";
    var color = status == 'win' ? "yellow" : "red";
    var endScreen = document.createElement('div');
    endScreen.style.color = color
    endScreen.className = `end`
    var endP = document.createElement('p');
    endP.innerText = text;
    endScreen.appendChild(endP)
    document.body.appendChild(endScreen)
}

function startGame() {
    var startBottom = document.createElement('button')
    startBottom.innerText = `go!`
    startBottom.addEventListener('click', function () {
        startScreen.parentNode.removeChild(startScreen)
        var a = document.getElementById('mainsound')
        a.volume = 0.2
        a.play()
        runGame(plan, Display)
    })
    var startText = document.createElement('p');
    startText.innerText = `
        
    After all your exploits, you have been immortalized.
    Your heart was laid next to you, as a reminder of the exploits of your people,
    but once it is gone, you must find it, this will be your last duty ...

    W A S D, space : block, 1/2 : skiils (if you have)
    `
    var startScreen = document.createElement('div');
    startScreen.appendChild(startText)
    startScreen.appendChild(startBottom)
    startScreen.className = 'start';
    document.body.appendChild(startScreen)
}
startGame();