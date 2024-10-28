const gameContainer = document.getElementById('gameContainer');
const rocket = document.getElementById('rocket');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

let rocketX = window.innerWidth / 2 - 20;
let rocketY = window.innerHeight - 80;
let score = 0;
let gameActive = true;

let bullets = [];
let asteroids = [];
let stars = [];

let asteroidSpawnRate = 0.02;
let asteroidSpeedMultiplier = 1;

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

// Detect mobile devices
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Add mobile touch controls if detected
function addMobileControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'mobileControls';
  controlsContainer.style.position = 'absolute';
  controlsContainer.style.bottom = '20px';
  controlsContainer.style.width = '100%';
  controlsContainer.style.height = '100px';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.justifyContent = 'space-between';
  
  // Create touch areas
  const leftTouch = document.createElement('div');
  leftTouch.className = 'touchArea';
  leftTouch.style.flex = '1';
  leftTouch.addEventListener('touchstart', () => (keys.ArrowLeft = true));
  leftTouch.addEventListener('touchend', () => (keys.ArrowLeft = false));

  const rightTouch = document.createElement('div');
  rightTouch.className = 'touchArea';
  rightTouch.style.flex = '1';
  rightTouch.addEventListener('touchstart', () => (keys.ArrowRight = true));
  rightTouch.addEventListener('touchend', () => (keys.ArrowRight = false));

  const shootTouch = document.createElement('div');
  shootTouch.className = 'touchArea';
  shootTouch.style.flex = '1';
  shootTouch.addEventListener('touchstart', () => (keys.Space = true));

  controlsContainer.appendChild(leftTouch);
  controlsContainer.appendChild(shootTouch);
  controlsContainer.appendChild(rightTouch);
  document.body.appendChild(controlsContainer);
}

// Retrieve high scores from localStorage
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

window.addEventListener('resize', () => {
  rocketX = window.innerWidth / 2 - 20;
});

document.addEventListener('keydown', (e) => {
  if (e.code in keys) keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

restartBtn.addEventListener('click', () => {
  location.reload();
});

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.element = document.createElement('div');
    this.element.className = 'bullet';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.y -= 5;
    this.element.style.top = `${this.y}px`;
  }

  remove() {
    this.element.remove();
  }
}

class Asteroid {
  constructor(x, speed) {
    this.x = x;
    this.y = 0;
    this.speed = speed;

    // Random rotation speed between -3 and 3 degrees per update
    this.rotationSpeed = (Math.random() * 6) - 3;  // Random speed between -3 and 3
    this.currentRotation = 0;  // Initial rotation

    this.element = document.createElement('div');
    this.element.className = 'asteroid';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${this.y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.y += this.speed;
    this.element.style.top = `${this.y}px`;

    // Update the rotation
    this.currentRotation += this.rotationSpeed;
    this.element.style.transform = `rotate(${this.currentRotation}deg)`;
  }

  remove() {
    this.element.remove();
  }
}

class Star {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.element = document.createElement('div');
    this.element.className = 'star';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.y += this.speed;
    this.element.style.top = `${this.y}px`;
    if (this.y > window.innerHeight) {
      this.y = 0;
    }
  }
}

function increaseDifficulty() {
  if (score % 10 === 0 && score > 0) {
    asteroidSpawnRate += 0.01;
    asteroidSpeedMultiplier += 0.2;
  }
}

function update() {
  if (!gameActive) return;

  if (keys.ArrowLeft && rocketX > 0) rocketX -= 5;
  if (keys.ArrowRight && rocketX < window.innerWidth - 40) rocketX += 5;
  rocket.style.left = `${rocketX}px`;

  if (keys.Space) {
    bullets.push(new Bullet(rocketX + 18, rocketY));
    keys.Space = false;
  }

  bullets.forEach((bullet, index) => {
    bullet.update();
    if (bullet.y < 0) {
      bullet.remove();
      bullets.splice(index, 1);
    }
  });

  if (Math.random() < asteroidSpawnRate) {
    const x = Math.random() * (window.innerWidth - 50);
    const speed = (2 + Math.random() * 2) * asteroidSpeedMultiplier;
    asteroids.push(new Asteroid(x, speed));
  }

  asteroids.forEach((asteroid, asteroidIndex) => {
    asteroid.update();

    if (
      rocketX < asteroid.x + 50 &&
      rocketX + 40 > asteroid.x &&
      rocketY < asteroid.y + 50 &&
      rocketY + 60 > asteroid.y
    ) {
      endGame();
    }

    bullets.forEach((bullet, bulletIndex) => {
      if (
        bullet.x < asteroid.x + 50 &&
        bullet.x + 5 > asteroid.x &&
        bullet.y < asteroid.y + 50 &&
        bullet.y + 10 > asteroid.y
      ) {
        bullets.splice(bulletIndex, 1);
        bullet.remove();

        asteroids.splice(asteroidIndex, 1);
        asteroid.remove();

        score++;
        scoreDisplay.innerHTML = `Score: ${score}`;
        increaseDifficulty();
      }
    });

    if (asteroid.y > window.innerHeight) {
      asteroids.splice(asteroidIndex, 1);
      asteroid.remove();
    }
  });

  stars.forEach((star) => star.update());
}

function createStars() {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const speed = 1 + Math.random();
    stars.push(new Star(x, y, speed));
  }
}

function endGame() {
  gameActive = false;
  gameOverDisplay.style.display = 'block';

  let playerName = prompt("Game Over! Enter your name:");
  if (playerName) {
    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score); // Sort scores in descending order
    highScores = highScores.slice(0, 10); // Keep only top 10 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
  }

  displayHighScores();

  // Add the restart button dynamically below the top scores
  const restartButton = document.createElement('button');
  restartButton.id = 'restartBtn';
  restartButton.innerText = 'Restart Game';
  restartButton.style.marginTop = '20px'; // Add some space from the top scores
  restartButton.style.padding = '10px 20px';
  restartButton.style.fontSize = '18px';
  restartButton.style.cursor = 'pointer';
  restartButton.style.backgroundColor = '#ff5733';
  restartButton.style.color = 'white';
  restartButton.style.border = 'none';
  restartButton.style.borderRadius = '5px';

  restartButton.addEventListener('click', () => {
    location.reload(); // Reload the page to restart the game
  });

  gameOverDisplay.appendChild(restartButton); // Append the button to the gameOver display
}

function displayHighScores() {
  let highScoreHTML = '<h2>Top 10 Scores</h2><ul>';
  highScores.forEach((scoreEntry) => {
    highScoreHTML += `<li>${scoreEntry.name}: ${scoreEntry.score}</li>`;
  });
  highScoreHTML += '</ul>';
  gameOverDisplay.innerHTML = `<p>Game Over</p>${highScoreHTML}`;
}

function gameLoop() {
  update();
  if (gameActive) requestAnimationFrame(gameLoop);
}

// Create stars for the background
createStars();

// Start the game loop
gameLoop();

// If the user is on a mobile device, add the touch controls
if (isMobile()) {
  addMobileControls();
}
