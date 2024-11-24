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
        this.initTelegram();
    }

    // ... (rest of the game code from previous message)
}

// Start game when page loads
window.onload = () => {
    new Game();
};
