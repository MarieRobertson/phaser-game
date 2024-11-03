const config = {
  width: window.innerWidth,
  height: window.innerHeight,
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
let dog;
let cursors;
let bones;
let score = 0;
let scoreText;
let timerText;
let dogSpeed = 800;
let boneSpeed = 300;
const speed_increase = 500;
const targetScore = 1000;
const timeLimit = 60000;
let timerEvent;
let timeRemaining;
let winText;
let loseText;
let replayButton;
let gameLost = false;

function preload() {
  this.load.image('background', 'images/background.jpg');
  this.load.image('dog', 'images/dog.png');
  this.load.image('bone', 'images/bone.png');
}

function create() {
  this.add
    .image(0, 0, 'background')
    .setOrigin(0, 0)
    .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

  dog = this.physics.add
    .image(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      'dog'
    )
    .setScale(0.5);
  dog.body.setAllowGravity(false);
  dog.body.collideWorldBounds = true;

  bones = this.physics.add.group({
    removeCallback: function (bone) {
      bone.scene.children.remove(bone);
    },
  });

  this.physics.add.overlap(dog, bones, collectBone, null, this);

  cursors = this.input.keyboard.createCursorKeys();

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000',
  });

  timeRemaining = timeLimit / 1000;
  timerText = this.add.text(16, 60, 'Time: ' + timeRemaining, {
    fontSize: '32px',
    fill: '#000',
  });

  this.add.text(16, 100, 'Goal: 1000 in 1 minute', {
    fontSize: '32px',
    fill: '#000',
  });

  this.time.addEvent({
    delay: 500,
    callback: dropBone,
    callbackScope: this,
    loop: true,
  });

  timerEvent = this.time.addEvent({
    delay: timeLimit,
    callback: () => {},
    callbackScope: this,
    loop: false,
  });

  winText = this.add.text(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2,
    'YOU WIN!',
    {
      fontSize: '64px',
      fill: '#000',
      backgroundColor: '#FFFF00',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }
  );
  winText.setOrigin(0.5);
  winText.setVisible(false);

  loseText = this.add.text(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2,
    'YOU LOSE...',
    {
      fontSize: '64px',
      fill: '#FFF',
      backgroundColor: '#FF0000',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
    }
  );
  loseText.setOrigin(0.5);
  loseText.setVisible(false);

  replayButton = this.add.text(this.sys.game.config.width - 100, 16, 'REPLAY', {
    fontSize: '32px',
    fill: '#FFF',
    backgroundColor: '#0000FF',
    padding: { left: 10, right: 10, top: 5, bottom: 5 },
  });
  replayButton.setOrigin(0.5);
  replayButton.setInteractive();

  replayButton.on('pointerdown', () => {
    location.reload();
  });
}

function dropBone() {
  let x = Phaser.Math.Between(0, this.sys.game.config.width);
  let bone = bones.create(x, 0, 'bone').setScale(0.4).setVelocityY(boneSpeed);
  bone.setCollideWorldBounds(true);
  bone.body.onWorldBounds = true;
}

function collectBone(dog, bone) {
  bone.disableBody(true, true);
  bones.remove(bone, true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (score >= speed_increase) {
    increaseSpeed();
  }

  if (score >= targetScore) {
    displayWinMessage();
  }
}

function increaseSpeed() {
  dogSpeed = 1300;
  boneSpeed = 600;
}

function displayWinMessage() {
  winText.setVisible(true);
}

function displayLoseMessage() {
  loseText.setVisible(true);
  gameLost = true;
}

function update() {
  if (!gameLost) {
    dog.setVelocity(0);

    if (cursors.up.isDown) {
      dog.setVelocityY(-dogSpeed);
    }
    if (cursors.down.isDown) {
      dog.setVelocityY(dogSpeed);
    }
    if (cursors.right.isDown) {
      dog.setVelocityX(dogSpeed);
    }
    if (cursors.left.isDown) {
      dog.setVelocityX(-dogSpeed);
    }

    timeRemaining = Math.max(
      0,
      Math.floor((timeLimit - timerEvent.getElapsed()) / 1000)
    );
    timerText.setText('Time: ' + timeRemaining);

    if (timeRemaining <= 0 && score < targetScore) {
      displayLoseMessage();
    }
  }
}
