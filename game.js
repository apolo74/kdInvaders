// Game configuration
var gameConfig = {
    width: 400,  // Narrower for portrait mode
    height: 600, // Taller for portrait mode
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Game state
var gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    isPaused: false,
    difficulty: 'normal',
    invaderSpeed: 50,
    invaderDropDistance: 20,
    invaderShootDelay: 2000,
    isMuted: false,
    audioStarted: false,
    config: gameConfig,  // Store config in gameState
    lastTime: 0,        // For pause functionality
    accumulatedTime: 0  // For pause functionality
};

// Audio objects
var sounds = {
    backgroundMusic: null,
    shoot: null,
    explosion: null
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

// Toggle mute state
function toggleMute() {
    gameState.isMuted = !gameState.isMuted;
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    
    if (gameState.isMuted) {
        // Mute all sounds
        if (sounds.backgroundMusic) {
            sounds.backgroundMusic.setVolume(0);
            console.log('Muting background music');
        }
        if (sounds.shoot) {
            sounds.shoot.setVolume(0);
            console.log('Muting shoot sound');
        }
        if (sounds.explosion) {
            sounds.explosion.setVolume(0);
            console.log('Muting explosion sound');
        }
        muteIcon.innerHTML = '&#128266;'; // Speaker icon (muted)
        muteBtn.setAttribute('aria-label', 'Unmute sound');
        muteBtn.classList.add('muted');
    } else {
        // Unmute all sounds
        if (sounds.backgroundMusic) {
            sounds.backgroundMusic.setVolume(0.3); // Lower volume for background music
            console.log('Unmuting background music');
        }
        if (sounds.shoot) {
            sounds.shoot.setVolume(1);
            console.log('Unmuting shoot sound');
        }
        if (sounds.explosion) {
            sounds.explosion.setVolume(1);
            console.log('Unmuting explosion sound');
        }
        muteIcon.innerHTML = '&#128264;'; // Speaker icon (unmuted)
        muteBtn.setAttribute('aria-label', 'Mute sound');
        muteBtn.classList.remove('muted');
    }
    
    // If we're unmuting and background music isn't playing, start it
    if (!gameState.isMuted && sounds.backgroundMusic && !sounds.backgroundMusic.isPlaying) {
        console.log('Starting background music playback');
        sounds.backgroundMusic.play();
    }
}

// Toggle pause state
function togglePause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (gameState.gameOver) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        // Pause the game
        if (sounds.backgroundMusic && sounds.backgroundMusic.isPlaying) {
            sounds.backgroundMusic.pause();
        }
        playPauseBtn.textContent = 'Play';
        playPauseBtn.style.backgroundColor = '#4CAF50'; // Green when play is available
    } else {
        // Resume the game
        if (sounds.backgroundMusic && !sounds.backgroundMusic.isPlaying && !gameState.isMuted) {
            sounds.backgroundMusic.play();
        }
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.style.backgroundColor = '#FF9800'; // Orange when pause is available
    }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing game...');
    
    // Set up UI event listeners
    const playPauseBtn = document.getElementById('playPauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    const difficultySelect = document.getElementById('difficulty');
    
    // Set initial mute button state
    muteIcon.innerHTML = gameState.isMuted ? '&#128266;' : '&#128264;';
    muteBtn.setAttribute('aria-label', gameState.isMuted ? 'Unmute sound' : 'Mute sound');
    if (gameState.isMuted) {
        muteBtn.classList.add('muted');
    }
    
    playPauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    muteBtn.addEventListener('click', toggleMute);
    difficultySelect.addEventListener('change', function(e) {
        if (!gameState.isPaused && !gameState.gameOver) {
            togglePause(); // Pause the game when changing difficulty
        }
        gameState.difficulty = e.target.value;
        updateDifficulty();
    });
    
    // Initialize the game
    initGame();
    
    // Start with the game paused
    togglePause();
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
    
    // Create Phaser game configuration
    var phaserConfig = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: gameConfig.width,
        height: gameConfig.height,
        backgroundColor: gameConfig.backgroundColor,
        physics: gameConfig.physics,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    // Initialize the game
    game = new Phaser.Game(phaserConfig);
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
    // Reset game state and restart
    if (game) {
        game.destroy(true);
    }
    // Reset pause state
    gameState.isPaused = false;
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.style.backgroundColor = '#FF9800';
    
    initGame();
}

function gameOver() {
    gameState.gameOver = true;
    const centerX = gameState.config.width / 2;
    const centerY = gameState.config.height / 2;
    
    // Create a semi-transparent background for better visibility
    const bg = game.scene.scenes[0].add.rectangle(centerX, centerY, 300, 120, 0x000000, 0.7)
        .setOrigin(0.5);
    
    // Create the game over text with better styling
    gameOverText = game.scene.scenes[0].add.text(centerX, centerY - 15, 'GAME OVER', {
        fontSize: '40px',
        fill: '#ff0000',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    // Add a restart prompt
    const restartText = game.scene.scenes[0].add.text(centerX, centerY + 30, 'Click to Restart', {
        fontSize: '20px',
        fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Make the text interactive
    restartText.setInteractive();
    restartText.on('pointerdown', function() {
        restartGame();
    });
    
    // Add hover effect
    restartText.on('pointerover', () => restartText.setStyle({ fill: '#ff9999' }));
    restartText.on('pointerout', () => restartText.setStyle({ fill: '#ffffff' }));
    
    // Add to a container for easier management
    gameOverContainer = game.scene.scenes[0].add.container(0, 0, [bg, gameOverText, restartText]);
    gameOverContainer.setScrollFactor(0);
    
    // Add click/tap to restart
    game.scene.scenes[0].input.on('pointerdown', function() {
        if (gameState.gameOver) {
            restartGame();
        }
    });
}

function preload() {
    // Load assets
    this.load.image('player', 'assets/player.png');
    this.load.image('invader1', 'assets/invader.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('background', 'assets/background.png');
    
    // Load bullet for invaders
    this.load.image('enemyBullet', 'assets/bullet.png');
    
    // Load audio files with multiple formats for better browser compatibility
    this.load.audio('backgroundMusic', [
        'assets/audio/galactic_stand_off.mp3',
        'assets/audio/galactic_stand_off.ogg'  // Fallback format
    ]);
    this.load.audio('shoot', [
        'assets/audio/shoot.mp3',
        'assets/audio/shoot.ogg'  // Fallback format
    ]);
    this.load.audio('explosion', [
        'assets/audio/explosion.mp3',
        'assets/audio/explosion.ogg'  // Fallback format
    ]);
    
    // Show loading progress
    this.load.on('progress', function (value) {
        console.log('Loading: ' + (value * 100) + '%');
    });
    
    this.load.on('complete', function () {
        console.log('All assets loaded');
    });
}

function createInvaders() {
    // Clear any existing invaders
    invaders.clear(true, true);
    
    const centerX = gameState.config.width / 2;
    const startY = 80;  // Start higher up in portrait mode
    const spacingX = 45; // Tighter horizontal spacing
    const spacingY = 50; // Tighter vertical spacing
    const maxWidth = gameState.config.width - 40; // Max width for invaders
    
    // Level-based patterns adjusted for portrait
    if (gameState.level === 1) {
        // Level 1: 2 columns of 5 invaders
        createInvaderLine(5, centerX - spacingX/2, startY, 0, spacingY);
        createInvaderLine(5, centerX + spacingX/2, startY, 0, spacingY);
    } else if (gameState.level === 2) {
        // Level 2: 3 columns of 4 invaders
        for (let i = 0; i < 3; i++) {
            createInvaderLine(4, centerX - spacingX + (i * spacingX), startY, 0, spacingY);
        }
    } else {
        // Level 3+: Diamond pattern
        const rows = 3 + Math.min(2, Math.floor(gameState.level / 2));
        for (let i = 0; i < rows; i++) {
            const count = i < Math.ceil(rows/2) ? i + 1 : rows - i;
            const offset = (Math.ceil(rows/2) - count) * spacingX / 2;
            createInvaderLine(count, centerX - offset, startY + i * spacingY, spacingX, spacingY);
        }
    }
}

function create() {
    // Reset game state if needed
    if (gameState.gameOver) {
        gameState.gameOver = false;
        if (gameOverText) gameOverText.destroy();
    }
    
    // Background - using the new portrait background
    this.add.image(gameState.config.width/2, gameState.config.height/2, 'background').setDisplaySize(gameState.config.width, gameState.config.height);

    // Player - position at bottom center
    player = this.physics.add.sprite(gameState.config.width/2, gameState.config.height - 50, 'player').setDisplaySize(40, 25);
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
    
    // Initialize audio objects
    try {
        sounds.backgroundMusic = this.sound.add('backgroundMusic', { 
            loop: true, 
            volume: gameState.isMuted ? 0 : 0.3,
            mute: gameState.isMuted
        });
        
        sounds.shoot = this.sound.add('shoot', { 
            volume: gameState.isMuted ? 0 : 1,
            mute: gameState.isMuted
        });
        
        sounds.explosion = this.sound.add('explosion', { 
            volume: gameState.isMuted ? 0 : 1,
            mute: gameState.isMuted
        });
        
        // Start background music if not muted
        if (!gameState.isMuted && sounds.backgroundMusic) {
            sounds.backgroundMusic.play()
                .catch(function(error) {
                    console.error('Error playing background music:', error);
                });
        }
    } catch (error) {
        console.error('Error initializing audio:', error);
    }
    
    // Reset invader direction
    invaderDirection = 1;
}

function createInvaderLine(count, startX, startY, spacingX, spacingY) {
    for (let i = 0; i < count; i++) {
        const x = spacingX ? startX + i * spacingX : startX;
        const y = spacingY ? startY + i * spacingY : startY;
        const invader = invaders.create(x, y, 'invader1');
        if (invader && invader.setDisplaySize) {
            invader.setDisplaySize(30, 25); // Smaller invaders for portrait
        }
    }
}

function update(time) {
    if (gameState.gameOver || gameState.isPaused) {
        // Handle paused state
        if (gameState.isPaused) {
            // Store the current time for when we unpause
            if (!gameState.lastTime) {
                gameState.lastTime = time;
            } else {
                gameState.accumulatedTime += time - gameState.lastTime;
                gameState.lastTime = time;
            }
            return;
        }
        return;
    }
    
    // Reset the last time when unpausing
    gameState.lastTime = 0;
    
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
    
    const config = gameState.config;
    const invaderWidth = 30; // Width of invader sprite
    const invaderHeight = 25; // Height of invader sprite
    const padding = 20; // Padding from screen edges
    
    var hitEdge = false;
    var invadersAlive = invaders.getChildren().length > 0;
    
    // Check if any invader has hit the edge
    invaders.getChildren().forEach(function(invader) {
        if (!invader.active) return;
        
        // Move invader
        invader.x += gameState.invaderSpeed * 0.05 * invaderDirection;
        
        // Check if invader hit the edge using game config
        if ((invader.x <= padding && invaderDirection < 0) || 
            (invader.x >= config.width - padding - invaderWidth && invaderDirection > 0)) {
            hitEdge = true;
        }
        
        // Check if invaders reached the bottom (leaving space for UI)
        if (invader.y > config.height - 100) {
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
    // Increase speed but cap it at a reasonable maximum
    gameState.invaderSpeed = Math.min(150, gameState.invaderSpeed + 10);
    // Slightly increase shooting frequency
    gameState.invaderShootDelay = Math.max(500, gameState.invaderShootDelay - 100);
    
    updateScore();
    
    // Get the current scene
    const scene = game.scene.scenes[0];
    if (!scene) return;
    
    // Create new invaders in the context of the scene
    createInvaders.call(scene);
    
    // Calculate center position
    const centerX = gameState.config.width / 2;
    const centerY = gameState.config.height / 2;
    
    // Create a semi-transparent background for better visibility
    const bg = scene.add.rectangle(centerX, centerY, 250, 100, 0x000000, 0.7)
        .setOrigin(0.5);
    
    // Show level up message with better styling
    const levelText = scene.add.text(centerX, centerY - 10, `LEVEL ${gameState.level}`, {
        fontSize: '36px',
        fill: '#00ff00',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2,
        fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    // Create a container for the level up message
    const levelContainer = scene.add.container(0, 0, [bg, levelText]);
    levelContainer.setScrollFactor(0);
    
    // Add a tween for a nice entrance effect
    levelContainer.setScale(0.5);
    scene.tweens.add({
        targets: levelContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        ease: 'Back.out'
    });
    
    // Remove the level container after a delay
    scene.time.delayedCall(1500, function() {
        scene.tweens.add({
            targets: levelContainer,
            alpha: 0,
            duration: 500,
            onComplete: function() {
                levelContainer.destroy();
            }
        });
    }, null, scene);
}

function fireBullet() {
    if (this.time.now > lastShot + 500) { // Limit firing rate
        var bullet = playerBullets.create(player.x, player.y - 20, 'bullet');
        bullet.setVelocityY(-500);
        
        // Play shoot sound if not muted
        if (!gameState.isMuted && sounds.shoot) {
            sounds.shoot.play();
        }
        
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
    
    // Play explosion sound if not muted
    if (!gameState.isMuted && sounds.explosion) {
        sounds.explosion.play();
    }
    
    // Update score
    gameState.score += 10 * gameState.level;
    updateScore();
}

function hitPlayer(player, bullet) {
    if (!player || !bullet || !player.active || !bullet.active) return;
    
    bullet.destroy();
    
    // Play explosion sound if not muted
    if (!gameState.isMuted && sounds.explosion) {
        sounds.explosion.play();
    }
    
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