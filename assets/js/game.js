class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Player properties
        this.player = {
            x: this.width / 2,
            y: this.height - 100,
            width: 40,
            height: 40,
            velocityY: 0,
            velocityX: 0,
            jumpForce: -15,
            gravity: 0.6,
            isJumping: false
        };

        // Game state
        this.score = 0;
        this.gameOver = false;
        this.platforms = [];
        this.powerUps = [];

        // Initialize platforms
        this.initPlatforms();
        this.setupControls();
        this.lastTime = 0;
        this.animate(0);
    }

    initPlatforms() {
        // Initial platforms
        for (let i = 0; i < 7; i++) {
            this.platforms.push({
                x: Math.random() * (this.width - 60),
                y: i * (this.height / 7),
                width: 60,
                height: 10,
                type: Math.random() < 0.2 ? 'breakable' : 'normal'
            });
        }
    }

    setupControls() {
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            
            if (x < this.width / 2) {
                this.player.velocityX = -8;
            } else {
                this.player.velocityX = 8;
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.player.velocityX = 0;
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.player.velocityX = -8;
            if (e.key === 'ArrowRight') this.player.velocityX = 8;
            if (e.key === 'ArrowUp' || e.key === ' ') this.jump();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.player.velocityX = 0;
            }
        });
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.velocityY = this.player.jumpForce;
            this.player.isJumping = true;
        }
    }

    update() {
        if (this.gameOver) return;

        // Update player physics
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;
        this.player.x += this.player.velocityX;

        // Wrap around screen
        if (this.player.x > this.width) {
            this.player.x = 0;
        } else if (this.player.x < 0) {
            this.player.x = this.width;
        }

        // Check platform collisions
        for (let platform of this.platforms) {
            if (this.player.velocityY > 0 && 
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y < platform.y + platform.height) {
                
                if (platform.type === 'breakable') {
                    this.platforms = this.platforms.filter(p => p !== platform);
                }

                this.player.velocityY = this.player.jumpForce;
                this.player.isJumping = false;
                this.score += 10;
            }
        }

        // Camera follow
        if (this.player.y < this.height / 2) {
            let diff = this.height / 2 - this.player.y;
            this.player.y += diff;
            
            for (let platform of this.platforms) {
                platform.y += diff;
            }

            // Remove platforms that are off screen and add new ones
            this.platforms = this.platforms.filter(platform => platform.y < this.height);
            while (this.platforms.length < 7) {
                this.platforms.push({
                    x: Math.random() * (this.width - 60),
                    y: 0,
                    width: 60,
                    height: 10,
                    type: Math.random() < 0.2 ? 'breakable' : 'normal'
                });
            }
        }

        // Game over condition
        if (this.player.y > this.height) {
            this.gameOver = true;
            // Share score with Telegram
            if (window.TelegramGameProxy) {
                window.TelegramGameProxy.shareScore(this.score);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw platforms
        for (let platform of this.platforms) {
            this.ctx.fillStyle = platform.type === 'breakable' ? '#ff9999' : '#66cc66';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // Draw player
        this.ctx.fillStyle = '#3366ff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw score
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.fillText('Game Over!', this.width/2 - 70, this.height/2);
            this.ctx.fillText(`Score: ${this.score}`, this.width/2 - 60, this.height/2 + 40);
        }
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update();
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Start game when page loads
window.onload = () => new Game();
