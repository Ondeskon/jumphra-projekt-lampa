window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor() {
            this.keys = [];
            // Nastavuje posluchače událostí pro stisknutí a uvolnění kláves
            window.addEventListener('keydown', e => {
// Odebírá uvolněnou klávesu
                if ((e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight')

                    &&
                    this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }

            });
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }

            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0; // Rychlost pohybu hráče
            this.vy = 0;  // Vertikální rychlost hráče
            this.weight = 1; // Hmotnost pro gravitaci


        }
        draw(context) {
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = 'blue';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {
        // Detekce kolizí s nepřáteli
            enemies.forEach(enemy => {
                
            const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
            const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if(distance < enemy.width/2 + this.width/2){
                gameOver = true;
            }
            });
// Animace hráče
            if(this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // controls
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 32;
            } else {
                this.speed = 0;
            }
            //horizontal movement
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
            //vertical movement
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }

    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 4;
        }
        draw(context) {
              // Vykresluje dvě kopie pozadí vedle sebe pro simulaci nekonečného pohybu
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
                // Aktualizuje pozici pozadí a cykluje ho do nekonečna
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 6;
            this.markedForDeletion = false;
        }
        draw(context) {
            // Vykresluje obrázek, obdélník a kruh pro vizualizaci hitboxu nepřítele
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.strokeStyle = 'blue';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
             // Aktualizuje animaci a pohyb nepřítele
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;

            } else {
                this.frameTimer += deltaTime;
            }

             // Pohyb nepřítele doleva
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }


    }

    function handleEnemies(deltaTime) {
        // Generuje nové nepřátele v intervalu
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            console.log(enemies);
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        // Vykresluje a aktualizuje všechny nepřátele na plátno
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        // Filtruje nepřátele označené k odstranění
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context) {
        // Zobrazuje skóre a text "GAME OVER" v případě konce hry
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score:' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score:' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again!', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width / 2 + 2, 202);
        }
    }
    const input = new InputHandler(); // Vytváří novou instanci InputHandler pro zpracování vstupů od hráče
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500;


    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx); // Vykresluje hráče na plátno
        player.update(input, deltaTime, enemies); // Aktualizuje stav hráče s ohledem na vstup a nepřátele
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) requestAnimationFrame(animate); // Pokračuje ve vykreslování dalšího snímku, pokud hra neskončila

    }
    animate(0); // Spouští animační smyčku s počátečním časovým razítkem 0
});