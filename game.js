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

function preload ()
{
    this.load.image('player', 'assets/player.png');
    this.load.image('invader1', 'assets/invader1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('background', 'assets/background.png');
}

function create ()
{
    // Background
    this.add.image(400, 300, 'background'); // Adjust position as needed

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
}

function hitInvader (bullet, invader) {
    bullet.destroy();
    invader.destroy();
    // Update score here if you have a score variable
}