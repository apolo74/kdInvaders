// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing game...');
    
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

    // Initialize the game
    try {
        var game = new Phaser.Game(config);
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to initialize the game. Please check the console for errors.');
    }
});

var player;
var invaders;
var playerBullets;
var cursors;
var gameSettings = {
    soundMuted: false
};
var soundButton;
var soundIcon; 
var musicTrack;
var shootSound;
var explosionSound;

function preload ()
{
    this.load.image('player', 'assets/player.png');
    this.load.image('invader1', 'assets/invader1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('background', 'assets/background.png');
    // Create sound icons as SVG elements in the DOM
    createSoundIcons();
    
    // Load sound icons as files
    this.load.image('soundOn', 'assets/sound-on.png');
    this.load.image('soundOff', 'assets/sound-off.png');
    
    // Load audio files - replace these with your actual sound files
    this.load.audio('backgroundMusic', ['assets/galactic_stand_off.mp3']);
    this.load.audio('shoot', ['assets/shoot.mp3']);
    this.load.audio('explosion', ['assets/explosion.mp3']);
}

function createSoundIcons() {
    // Create sound-on icon
    const soundOnSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    
    // Create sound-off icon
    const soundOffSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    
    // Create a style element to position the sound button
    const style = document.createElement('style');
    style.textContent = `
        #sound-button {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        #sound-button svg {
            width: 24px;
            height: 24px;
        }
    `;
    document.head.appendChild(style);
    
    // Create the sound button
    const soundButton = document.createElement('div');
    soundButton.id = 'sound-button';
    soundButton.innerHTML = soundOnSvg;
    soundButton.addEventListener('click', () => {
        window.dispatchEvent(new Event('toggleSound'));
    });
    document.body.appendChild(soundButton);
    
    // Store the button element for later use
    window.soundButton = soundButton;
    window.soundOnSvg = soundOnSvg;
    window.soundOffSvg = soundOffSvg;
}

function create ()
{
    // Background
    this.add.image(400, 300, 'background');
    
    // Create audio objects but don't play them yet
    musicTrack = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
    shootSound = this.sound.add('shoot', { volume: 0.3 });
    explosionSound = this.sound.add('explosion', { volume: 0.5 });
    
    // Add a one-time click handler to start audio
    const startAudio = () => {
        if (!gameSettings.soundMuted && musicTrack) {
            musicTrack.play();
        }
        // Remove the event listener after first interaction
        window.removeEventListener('click', startAudio);
        window.removeEventListener('keydown', startAudio);
        window.removeEventListener('touchstart', startAudio);
    };
    
    // Add event listeners for user interaction
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
    window.addEventListener('touchstart', startAudio);
    
    // Listen for sound toggle events from the DOM button
    window.addEventListener('toggleSound', () => {
        toggleSound();
    });

    // Player
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();

    // Invaders
    invaders = this.physics.add.group();

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var invader = invaders.create(x * 50 + 50, y * 50 + 50, 'invader1');
            invader.body.velocity.x = 50;
        }
    }

    // Bullets
    playerBullets = this.physics.add.group();

    // Collision Detection
    this.physics.add.overlap(playerBullets, invaders, hitInvader, null, this);
}

function toggleSound() {
    gameSettings.soundMuted = !gameSettings.soundMuted;
    
    if (gameSettings.soundMuted) {
        // Update the DOM button
        if (window.soundButton) {
            window.soundButton.innerHTML = window.soundOffSvg;
        }
        // Pause audio
        if (musicTrack) {
            musicTrack.pause();
        }
    } else {
        // Update the DOM button
        if (window.soundButton) {
            window.soundButton.innerHTML = window.soundOnSvg;
        }
        // Play audio if not already playing
        if (musicTrack && !musicTrack.isPlaying) {
            musicTrack.play();
        }
    }
}

function update ()
{
    // Player Movement
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
    }
    else
    {
        player.setVelocityX(0);
    }

    if (cursors.space.isDown)
    {
        fireBullet();
    }

    // Invader Movement
    invaders.children.iterate(function(invader) {
        if (invader.x <= 0 || invader.x >= 750) {
            invader.body.velocity.x *= -1;
            invader.y += 10;
        }
    });
}

function fireBullet () {
    var bullet = playerBullets.create(player.x, player.y - 20, 'bullet');
    bullet.setVelocityY(-300);
    if (!gameSettings.soundMuted) {
        shootSound.play();
    }
}

function hitInvader (bullet, invader) {
    bullet.destroy();
    invader.destroy();
    if (!gameSettings.soundMuted) {
        explosionSound.play();
    }
    // Update score here if you have a score variable
}