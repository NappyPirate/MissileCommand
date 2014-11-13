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

    /*var context = gameArea.getContext('2d');
    
    context.moveTo(X, Y);
    context.lineTo(endX, endY);
    context.stroke();*/

    var temp = new Missile({x: X, y: Y}, {x: endX, y: endY}, 1);
    
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

var Turret = function() {
    this.x = gameArea.offsetWidth / 2;
    this.y = gameArea.offsetHeight;
    
    this.radius = 15;
    this.length = 25;
    this.aimX = gameArea.offsetWidth / 2;
    this.aimY = gameArea.offsetHeight - 10;
    
    alert(this.x + ',' + this.y + '\n' + this.aimX + ',' + this.aimY);
};

Turret.prototype.draw = function(ctx) {
    ctx.beginPath();
    
    this.x = gameArea.offsetWidth / 2;
    this.y = gameArea.offsetHeight;
    
    this.angle = Math.atan((this.aimX - this.x)/(this.aimY - this.y )) + Math.PI;
    
    var baseX = (this.radius * Math.sin(this.angle)) + this.x;
    var baseY = (this.radius * Math.cos(this.angle)) + this.y;
    
    var tipX = (this.length * Math.sin(this.angle)) + this.x;
    var tipY = (this.length * Math.cos(this.angle)) + this.y;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true); 
    
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
};

var gameEngine = (function() {
    var refreshRate = 25,
        timeBetweenMissiles = 3000,
        timeBetweenCount = 3000,
        enemies = [],
        turret;
    
    function moveTurret(){
        turret = new Turret();
    };
    
    function aimTurret(pos){
        turret.aimX = pos.x;
        turret.aimY = pos.y;
    };
    
    function main() {
        var context = gameArea.getContext('2d');
        context.clearRect(0, 0, gameArea.width, gameArea.height);
        
        timeBetweenCount -= refreshRate;
        
        if (turret == undefined) {
            turret = new Turret();
        };
        
        if (enemies.length < 5 && timeBetweenCount < 0) {
            enemies.push(generateEnemy());
            timeBetweenCount += timeBetweenMissiles;
        }
        
        for(var i = 0; i < enemies.length; i++) {
            var entry = enemies[i];
            entry.move();
            entry.draw(context);
            if(entry.hasHit()){
                var index = enemies.indexOf(entry);
                enemies.splice(index, 1);
            }
        }
        turret.draw(context);
    };
        
    function start() {
        setInterval(main, refreshRate);
    };
    
    return {
            'start': start,
            'main': main,
            'moveTurret': moveTurret,
            'aimTurret': aimTurret
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
    //var context = gameArea.getContext('2d');
    
    //context.clearRect(0, 0, gameArea.width, gameArea.height);
    
    /*var x = gameArea.offsetWidth / 2;
    var y = gameArea.offsetHeight / 2;
    
    context.beginPath();
    context.arc(x, y, 50, 0, 2 * Math.PI, true);
    
    context.moveTo(x, y);
    context.lineTo(x + 50, y);
    
    context.stroke();*/
    
    //gameEngine.fireRocket(mousePos);
}, true);

gameArea.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(gameArea, evt);
    document.getElementById('x-coordinate').innerHTML = mousePos.x;
    document.getElementById('y-coordinate').innerHTML = mousePos.y;

    gameEngine.aimTurret(mousePos);
}, true);

gameEngine.start();



