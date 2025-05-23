// Game state
var gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    difficulty: 'normal',
    invaderSpeed: 50,
    invaderDropDistance: 20,
    invaderShootDelay: 2000
};

// Game objects
var player;
var invaders;
var playerBullets;
var invaderBullets;
var cursors;
var scoreText;
var livesText;
var levelText;
var gameOverText;
var invaderDirection = 1;
var lastInvaderShoot = 0;
var lastShot = 0;
var game;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing game...');
    
    // Set up UI event listeners
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('difficulty').addEventListener('change', function(e) {
        gameState.difficulty = e.target.value;
        updateDifficulty();
    });
    
    initGame();
});

function initGame() {
    // Reset game state
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.gameOver = false;
    updateDifficulty();
    
    // Update UI
    updateScore();
    
    // If game instance exists, destroy it
    if (game) {
        game.destroy(true);
    }
    
    var config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    game = new Phaser.Game(config);
}

function updateDifficulty() {
    switch(gameState.difficulty) {
        case 'easy':
            gameState.invaderSpeed = 30;
            gameState.invaderDropDistance = 15;
            gameState.invaderShootDelay = 3000;
            break;
        case 'normal':
            gameState.invaderSpeed = 50;
            gameState.invaderDropDistance = 20;
            gameState.invaderShootDelay = 2000;
            break;
        case 'hard':
            gameState.invaderSpeed = 70;
            gameState.invaderDropDistance = 25;
            gameState.invaderShootDelay = 1000;
            break;
    }
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lives').textContent = gameState.lives;
}

function restartGame() {
    initGame();
}

function gameOver() {
    gameState.gameOver = true;
    gameOverText = game.scene.scenes[0].add.text(400, 300, 'GAME OVER', 
        { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
    gameOverText.setScrollFactor(0);
}

function preload() {
    // Load assets
    this.load.image('player', 'assets/player.png');
    this.load.image('invader1', 'assets/invader1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('background', 'assets/background.png');
    
    // Load bullet for invaders
    this.load.image('enemyBullet', 'assets/bullet.png');
}

function create() {
    // Reset game state if needed
    if (gameState.gameOver) {
        gameState.gameOver = false;
        if (gameOverText) gameOverText.destroy();
    }
    
    // Background
    this.add.image(400, 300, 'background').setDisplaySize(800, 600);

    // Player
    player = this.physics.add.sprite(400, 550, 'player').setDisplaySize(50, 30);
    player.setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();
    
    // Player bullets
    playerBullets = this.physics.add.group();
    
    // Invader bullets
    invaderBullets = this.physics.add.group();

    // Invaders
    invaders = this.physics.add.group();
    createInvaders.call(this);
    
    // Collision detection
    this.physics.add.collider(playerBullets, invaders, hitInvader, null, this);
    this.physics.add.overlap(player, invaderBullets, hitPlayer, null, this);
    
    // Space bar to shoot
    this.input.keyboard.on('keydown-SPACE', function() {
        if (!gameState.gameOver) {
            fireBullet.call(this);
        }
    }, this);
    
    // Initialize UI
    updateScore();
}

function createInvaders() {
    invaders.clear(true, true);
    invaderDirection = 1; // Reset direction when creating new invaders
    
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 10; x++) {
            var invader = invaders.create(x * 50 + 100, y * 50 + 50, 'invader1');
            if (invader && invader.setDisplaySize) {
                invader.setDisplaySize(40, 30);
            }
        }
    }
}

function update() {
    if (!gameState || gameState.gameOver) return;
    
    // Initialize player movement if not already set
    if (player && player.body) {
        player.setVelocity(0);
        
        // Handle player movement
        if (cursors && cursors.left && cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (cursors && cursors.right && cursors.right.isDown) {
            player.setVelocityX(200);
        }
    }
    
    // Update invaders if the function exists
    if (typeof updateInvaders === 'function') {
        updateInvaders.call(this);
    }
    
    // Clean up player bullets that are off screen
    if (playerBullets && playerBullets.getChildren) {
        playerBullets.getChildren().forEach(function(bullet) {
            if (bullet && bullet.y < 0) {
                bullet.destroy();
            }
        });
    }
    
    // Clean up invader bullets that are off screen
    if (invaderBullets && invaderBullets.getChildren) {
        invaderBullets.getChildren().forEach(function(bullet) {
            if (bullet && bullet.y > 600) {
                bullet.destroy();
            }
        });
    }
}

function updateInvaders() {
    if (gameState.gameOver) return;
    
    var hitEdge = false;
    var invadersAlive = invaders.getChildren().length > 0;
    
    // Check if any invader has hit the edge
    invaders.getChildren().forEach(function(invader) {
        if (!invader.active) return;
        
        // Move invader
        invader.x += gameState.invaderSpeed * 0.05 * invaderDirection;
        
        // Check if invader hit the edge
        if ((invader.x <= 30 && invaderDirection < 0) || 
            (invader.x >= 770 && invaderDirection > 0)) {
            hitEdge = true;
        }
        
        // Check if invaders reached the bottom
        if (invader.y > 500) {
            gameOver();
            return;
        }
    });
    
        // Change direction if hit edge
    if (hitEdge) {
        invaderDirection *= -1;
        var movedDown = false;
        
        invaders.getChildren().forEach(function(invader) {
            if (invader && invader.active) {
                // Move down and slightly in the new direction to prevent getting stuck
                invader.y += gameState.invaderDropDistance;
                invader.x += gameState.invaderSpeed * 0.1 * invaderDirection;
                movedDown = true;
            }
        });
        
        // Add a small delay after moving down to make the pattern clearer
        if (movedDown) {
            this.time.delayedCall(300, function() {}, [], this);
        }
    }
    
    // Random invader shooting
    if (this.time.now > lastInvaderShoot + gameState.invaderShootDelay && invadersAlive) {
        var shooters = invaders.getChildren();
        if (shooters.length > 0) {
            var shooter = shooters[Math.floor(Math.random() * shooters.length)];
            fireEnemyBullet(shooter);
            lastInvaderShoot = this.time.now;
        }
    }
    
    // Check if level is complete
    if (invaders.getChildren().length === 0) {
        nextLevel();
    }
}

function nextLevel() {
    gameState.level++;
    gameState.invaderSpeed += 10;
    updateScore();
    createInvaders.call(this);
}

function fireBullet() {
    if (this.time.now > lastShot + 500) { // Limit firing rate
        var bullet = playerBullets.create(player.x, player.y - 20, 'bullet');
        bullet.setVelocityY(-500);
        lastShot = this.time.now;
    }
}

function fireEnemyBullet(shooter) {
    if (shooter && !shooter.active) return;
    
    var bullet = invaderBullets.create(shooter.x, shooter.y + 20, 'enemyBullet');
    bullet.setTint(0xff0000); // Make enemy bullets red
    bullet.setVelocityY(200);
}

function hitInvader(bullet, invader) {
    if (!bullet.active || !invader.active) return;
    
    bullet.destroy();
    invader.destroy();
    
    // Update score
    gameState.score += 10 * gameState.level;
    updateScore();
}

function hitPlayer(player, bullet) {
    if (!player || !bullet || !player.active || !bullet.active) return;
    
    bullet.destroy();
    
    if (gameState) {
        gameState.lives--;
        updateScore();
        
        if (gameState.lives <= 0) {
            gameOver();
        } else if (player.setTint) {
            // Flash player to indicate hit
            player.setTint(0xff0000);
            setTimeout(function() {
                if (player && player.clearTint) player.clearTint();
            }, 200);
        }
    }
}