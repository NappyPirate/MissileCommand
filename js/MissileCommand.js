var MissileCommand = (function() {
    var gameArea = document.getElementById('game_area');
    var bezelWidth = 18;
    var bezelHeight = 23;
    gameArea.width = window.innerWidth - bezelWidth;
    gameArea.height = window.innerHeight - bezelHeight;

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
        this.base = {x: orig.x, y: orig.y};
        this.target = {x: target.x, y: target.y};
        this.magnitude = 0;
        this.speed = speed;
        this.explosionSpeed = 1;
        this.explosionRadius = gameArea.width / 40;
        this.radius = 0;
        this.angle = Math.atan((target.x - this.start.x)/(target.y - this.start.y)) + Math.PI;
    };

    Rocket.prototype.draw = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.base.x, this.base.y);
        ctx.lineTo(this.cur.x, this.cur.y);   
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(this.target.x, this.target.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
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
        if (this.cur.y > this.target.y){
            this.magnitude += this.speed;   
            this.cur.x = (this.magnitude * Math.sin(this.angle)) + this.start.x;
            this.cur.y = (this.magnitude * Math.cos(this.angle)) + this.start.y;
            this.base.x = ((this.magnitude - 3) * Math.sin(this.angle)) + this.start.x;
            this.base.y = ((this.magnitude - 3) * Math.cos(this.angle)) + this.start.y;
        }
        if (this.cur.y < this.target.y){
            this.cur.x = this.target.x;
            this.cur.y = this.target.y;
        }
        if ((this.cur.x == this.target.x && this.cur.y == this.target.y) && this.radius < this.explosionRadius){
            this.radius += this.explosionSpeed;
            if (this.radius > this.explosionRadius)
            {
                this.radius = this.explosionRadius;
            }
        }
    };

    Rocket.prototype.hasExploded = function() {
        if(this.radius == this.explosionRadius){
            return true;
        }
        else {
            return false;
        }
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

    var GameEngine = (function() {
        var refreshRate = 25,
            enemyCount = 0,
            enemySpeed = 0,
            waveScore = 0,
            score = 0,
            wave = 0,
            missiles = [],
            rockets = [],
            timeBetweenMissiles,
            timeCount,
            intervalVar,
            playerHealth,
            maxAmmunition,
            ammunition,
            turret;
        
        function main() {
            var context = gameArea.getContext('2d');
            context.clearRect(0, 0, gameArea.width, gameArea.height);
            
            timeCount -= refreshRate;
            
            if (turret == undefined) {
                turret = new Turret();
            };
            
            if (enemyCount > 0 && timeCount < 0) {
                missiles.push(generateEnemy());
                timeCount += timeBetweenMissiles;
                enemyCount--;
            }
            
            var i = missiles.length;
            while(i--) {
                var entry = missiles[i];
                entry.move();
                entry.draw(context);
                if(entry.hasHit()){
                    missiles.splice(i, 1);
                    playerHealth--;
                }
            }
            
            var j = rockets.length;
            while(j--) {
                var entry = rockets[j];
                entry.move();
                entry.draw(context);
                if(entry.hasExploded()){
                    rockets.splice(j, 1);
                }
            }
            
            detectCollisions();
            
            turret.draw(context);
            drawScore(context);
            drawHealth(context);
            drawAmmunition(context);
            
            if (playerHealth <= 0)
            {
                stop();
                setTimeout(function(){gameover(context);}, 3000);
            }
            
            if (enemyCount == 0 && missiles.length == 0) {
                newWave();
            }
        };

        function detectCollisions()
        {
            var r = rockets.length;
            while(r--) {
                if(rockets[r].cur.x == rockets[r].target.x && rockets[r].cur.y == rockets[r].target.y){
                    var m = missiles.length;
                    while(m--) {
                        var rocket = rockets[r];
                        var missile = missiles[m];

                        var deltaX = rocket.cur.x - missile.cur.x;
                        var deltaY = rocket.cur.y - missile.cur.y;
                        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                        if (distance < rocket.radius){
                            waveScore += 100;
                            missiles.splice(m, 1);
                        }
                    }
                }
            }
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
            
        function start() {
            intervalVar = setInterval(main, refreshRate);
        };
        
        function stop() {
            clearInterval(intervalVar);
        };
        
        function newWave() {
            stop();
            score += waveScore;
            waveScore = 0;
            wave++;
            enemyCount = wave * 5 < 50 ? wave * 5 : 50;
            enemySpeed = Math.floor(wave / 2) ? Math.floor(wave / 2) : 1;
            timeBetweenMissiles = 4000 - (wave * 100);
            timeCount = 4000 - (wave * 100);
            missiles = [];
            rockets = [];
            playerHealth = 3;
            maxAmmunition = enemyCount * 4;
            ammunition = maxAmmunition;

            var context = gameArea.getContext('2d');
            context.clearRect(0, 0, gameArea.width, gameArea.height);
            context.beginPath();
            context.rect(gameArea.width / 2 - 50, gameArea.height / 2 - 15, 100, 30);
            context.font="20px Arial";
            context.fillText("Wave " + wave, gameArea.width / 2 - 33, gameArea.height / 2 + 8);
            context.stroke();
            drawScore(context);

            setTimeout(start, 3000);
        };
        
        function resetWave(num) {
            waveScore = 0;
            wave--;
            newWave();
        };
        
        function gameover(ctx)
        {
            ctx.beginPath();
            ctx.fillRect(0, 0, gameArea.width, gameArea.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle="#FFFFFF";
            ctx.font="20px Arial";
            ctx.fillText("Game Over", gameArea.width / 2 - 38, gameArea.height / 2 + 8);
            ctx.stroke();

            setTimeout(function() {displayScore(ctx)}, 2000);
        }

        function displayScore(ctx)
        {
            ctx.beginPath();
            ctx.fillStyle="#000000"
            ctx.fillRect(0, 0, gameArea.width, gameArea.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle="#FFFFFF"
            ctx.font="20px Arial";
            ctx.fillText("Score: " + score, gameArea.width / 2 - 38, gameArea.height / 2 + 8);
            ctx.stroke();
        }
        
        function drawScore(ctx){
            ctx.beginPath();
            ctx.font="12px Arial";
            ctx.fillText("Score: " + (score + waveScore), 5, 12);
            ctx.stroke();
        };

        function drawHealth(ctx){
            var info = "Health:";
            for(var i = 0; i < playerHealth; i++)
            {
                info += " \u25A0";
            }
            
            ctx.beginPath();
            ctx.font="12px Arial";
            ctx.fillText(info, gameArea.width - 75, 12);
            ctx.stroke();
        };

        function drawAmmunition(ctx){
            var ammo = (ammunition / maxAmmunition) * 28; 

            ctx.beginPath();
            ctx.font="12x Arial"
            ctx.fillText("Ammo:", gameArea.width - 75, 26);
            ctx.fillRect(gameArea.width - 33, 20, ammo, 4);
            ctx.stroke();
        };
        
        function moveTurret(){
            turret = new Turret();
        };
        
        function aimTurret(pos){
            turret.aim.x = pos.x;
            turret.aim.y = pos.y;
        };
        
        function fireRocket(pos){
            if(ammunition > 0)
            {
                rockets.push(new Rocket(turret.tip, pos, 4));
                ammunition--;
            }
        };
        
        return {
                'start': start,
                'moveTurret': moveTurret,
                'aimTurret': aimTurret,
                'fireRocket': fireRocket,
                'resetWave': resetWave
            };
    }());
   
    
    function init(){
        var rtime = new Date(1, 1, 2000, 12,00,00);
        var timeout = false;
        var delta = 200; 
    
        window.onresize = function() {
            gameArea.width = window.innerWidth - bezelWidth;
            gameArea.height = window.innerHeight - bezelHeight;
            
            GameEngine.moveTurret();

            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeend, delta);
            }
        }

        function resizeend() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeend, delta);
            } else {
                timeout = false;
                GameEngine.resetWave();
            }               
        }

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        gameArea.addEventListener('click', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var mousePos = getMousePos(gameArea, evt);
            GameEngine.fireRocket(mousePos);
        }, false);

        gameArea.addEventListener('mousemove', function(evt) {
            var mousePos = getMousePos(gameArea, evt);
            GameEngine.aimTurret(mousePos);
        }, true);
        
        GameEngine.start();
    };
    
    return {
        'init': init
    };
}());

MissileCommand.init();



