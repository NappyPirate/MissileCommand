var gameArea = document.getElementById('game_area');
gameArea.width = window.innerWidth - 17;
gameArea.height = window.innerHeight - 92;

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

function generateEnemy() {
    var width = gameArea.offsetWidth;
    var height = gameArea.offsetHeight;
    
    var X = Math.floor((Math.random() * width));
    var Y = 0;
    
    var endX = Math.floor((Math.random() * width));
    var endY = height;

    var temp = new Missile({x: X, y: Y}, {x: endX, y: endY}, 1);
    
    return temp;
};

function generateAlly() {
    var width = gameArea.offsetWidth;
    var height = gameArea.offsetHeight;
    
    var X = Math.floor((Math.random() * width));
    var Y = 0;
    
    var endX = Math.floor((Math.random() * width));
    var endY = height;

    var temp = new Rocket({x: X, y: Y}, {x: endX, y: endY}, 1);
    
    return temp;
};

var Missile = function(orig, target, speed) {
    this.start = {x: orig.x, y: orig.y};
    this.cur = {x: orig.x, y: orig.y};
    this.target = {x: target.x, y: target.y};
    this.magnitude = 0;
    this.speed = speed;

    this.angle = Math.atan((target.x - this.start.x)/(target.y - this.start.y));
};

Missile.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(Math.floor(this.cur.x), Math.floor(this.cur.y));
    ctx.stroke();
};

Missile.prototype.drawAll = function(ctx) {
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.stroke();
};

Missile.prototype.move = function() {
    this.magnitude += this.speed;   
    this.cur.x = (this.magnitude * Math.sin(this.angle)) + this.start.x;
    this.cur.y = (this.magnitude * Math.cos(this.angle)) + this.start.y;
};

Missile.prototype.hasHit = function() {
    if (this.cur.y >= this.target.y) {
        return true; 
    }
    else {
        return false;
    };
};

var Rocket = function(orig, target, speed) {
    this.start = {x: orig.x, y: orig.y};
    this.cur = {x: orig.x, y: orig.y};
    this.target = {x: target.x, y: target.y};
    this.magnitude = 0;
    this.speed = speed;
    this.explosionRadius = gameArea.width / 40;

    this.angle = Math.atan((target.x - this.start.x)/(target.y - this.start.y)) + Math.PI;
};

Rocket.prototype.draw = function(ctx) {
    
};

Rocket.prototype.drawAll = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.stroke();
    
    ctx.beginPath()
    ctx.arc(this.target.x, this.target.y, this.explosionRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    
};

Rocket.prototype.move = function() {
    this.magnitude += this.speed;   
    this.cur.x = (this.magnitude * Math.sin(this.angle)) + this.start.x;
    this.cur.y = (this.magnitude * Math.cos(this.angle)) + this.start.y;
    
};

Rocket.prototype.hasHit = function() {
    
};

var Turret = function() {
    this.center = {x: gameArea.offsetWidth / 2, y: gameArea.offsetHeight};
    
    this.radius = 15;
    this.length = 25;
    this.aim = {x: gameArea.offsetWidth / 2, y: gameArea.offsetHeight - 10};
    
    this.angle = Math.atan((this.aim.x - this.center.x)/(this.aim.y - this.center.y )) + Math.PI;
    
    this.base= {x: (this.radius * Math.sin(this.angle)) + this.center.x, y: (this.radius * Math.cos(this.angle)) + this.center.y};
    
    this.tip = {x: (this.length * Math.sin(this.angle)) + this.center.x, y: (this.length * Math.cos(this.angle)) + this.center.y};
    
};

Turret.prototype.draw = function(ctx) {
    ctx.beginPath();
    
    this.center.x = gameArea.offsetWidth / 2;
    this.center.y = gameArea.offsetHeight;
    
    this.angle = Math.atan((this.aim.x - this.center.x)/(this.aim.y - this.center.y )) + Math.PI;
    
    this.base.x = (this.radius * Math.sin(this.angle)) + this.center.x;
    this.base.y = (this.radius * Math.cos(this.angle)) + this.center.y;
    
    this.tip.x = (this.length * Math.sin(this.angle)) + this.center.x;
    this.tip.y = (this.length * Math.cos(this.angle)) + this.center.y;
    
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI, true); 
    
    ctx.moveTo(this.base.x, this.base.y);
    ctx.lineTo(this.tip.x, this.tip.y);
    ctx.stroke();
};

var gameEngine = (function() {
    var refreshRate = 25,
        timeBetweenMissiles = 3000,
        timeBetweenCount = 3000,
        enemies = [],
        rockets = [],
        enemyCount = 0,
        intervalVar,
        turret;
    
    function moveTurret(){
        turret = new Turret();
    };
    
    function aimTurret(pos){
        turret.aim.x = pos.x;
        turret.aim.y = pos.y;
    };
    
    function fireRocket(pos){
        rockets.push(new Rocket(turret.tip, pos, 1));
    };
    
    function main() {
        var context = gameArea.getContext('2d');
        context.clearRect(0, 0, gameArea.width, gameArea.height);
        
        timeBetweenCount -= refreshRate;
        
        if (turret == undefined) {
            turret = new Turret();
        };
        
        if (enemyCount > 0 && timeBetweenCount < 0) {
            enemies.push(generateEnemy());
            timeBetweenCount += timeBetweenMissiles;
            enemyCount--;
        }
        
        for(var i = 0; i < enemies.length; i++) {
            var entry = enemies[i];
            entry.move();
            entry.draw(context);
            if(entry.hasHit()){
                var index = enemies.indexOf(entry);
                delete enemies[index];
                enemies.splice(index, 1);
            }
        }
        
        for(var j = 0; j < rockets.length; j++) {
            var entry = rockets[j];
            entry.drawAll(context);
        }
        
        turret.draw(context);
        
        if (enemyCount == 0 && enemies.length == 0) {
            //context.clearRect(0, 0, gameArea.width, gameArea.height);
            //stop();
        }
    };
        
    function start() {
        intervalVar = setInterval(main, refreshRate);
    };
    
    function stop() {
        clearInterval(intervalVar);
    };
    
    return {
            'start': start,
            'main': main,
            'moveTurret': moveTurret,
            'aimTurret': aimTurret,
            'fireRocket': fireRocket
        };
}());

window.onresize = function() {
    gameArea.width = window.innerWidth - 17;
    gameArea.height = window.innerHeight - 92;
    
    gameEngine.moveTurret();
    //gameEngine.resetWave();
}

gameArea.addEventListener('click', function(evt) {
    var mousePos = getMousePos(gameArea, evt);

    var test = generateAlly();
    
    //test.move();
    //test.draw();
    gameEngine.fireRocket(mousePos);
}, true);

gameArea.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(gameArea, evt);
    document.getElementById('x-coordinate').innerHTML = mousePos.x;
    document.getElementById('y-coordinate').innerHTML = mousePos.y;

    gameEngine.aimTurret(mousePos);
}, true);

gameEngine.start();



