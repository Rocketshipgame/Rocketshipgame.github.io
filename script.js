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
let powerUps = [];

let asteroidSpawnRate = 0.02;
let asteroidSpeedMultiplier = 1;
let powerUpSpawnRate = 0.005; // Power-ups spawn less frequently
let isMultiShotActive = false; // Track if multi-shot is active

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

// Power-Up Class
class PowerUp {
  constructor(x, type) {
    this.x = x;
    this.y = 0;
    this.type = type;
    this.element = document.createElement('div');
    this.element.className = 'power-up';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${this.y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.y += 2; // Move downward
    this.element.style.top = `${this.y}px`;
  }

  remove() {
    this.element.remove();
  }
}

// Detect mobile devices
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function addMobileControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'mobileControls';

  document.body.classList.add('mobile-controls-active');

  const leftButton = document.createElement('button');
  leftButton.style.width = '80px';
  leftButton.style.height = '80px';
  leftButton.addEventListener('touchstart', () => (keys.ArrowLeft = true));
  leftButton.addEventListener('touchend', () => (keys.ArrowLeft = false));

  const rightButton = document.createElement('button');
  rightButton.style.width = '80px';
  rightButton.style.height = '80px';
  rightButton.addEventListener('touchstart', () => (keys.ArrowRight = true));
  rightButton.addEventListener('touchend', () => (keys.ArrowRight = false));

  const shootButton = document.createElement('button');
  shootButton.style.width = '80px';
  shootButton.style.height = '80px';
  shootButton.addEventListener('touchstart', () => (keys.Space = true));

  controlsContainer.appendChild(leftButton);
  controlsContainer.appendChild(rightButton);
  controlsContainer.appendChild(shootButton);
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
    this.rotationSpeed = (Math.random() * 6) - 3;
    this.currentRotation = 0;

    this.element = document.createElement('div');
    this.element.className = 'asteroid';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${this.y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.y += this.speed;
    this.element.style.top = `${this.y}px`;
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

function activateMultiShot() {
  isMultiShotActive = true;
  setTimeout(() => {
    isMultiShotActive = false; // Deactivate after 10 seconds
  }, 10000);
}

function update() {
  if (!gameActive) return;

  // Rocket movement
  if (keys.ArrowLeft && rocketX > 0) rocketX -= 5;
  if (keys.ArrowRight && rocketX < window.innerWidth - 40) rocketX += 5;
  rocket.style.left = `${rocketX}px`;

  // Shooting
  if (keys.Space) {
    if (isMultiShotActive) {
      // Shoot 3 bullets in a spread pattern
      bullets.push(new Bullet(rocketX + 10, rocketY - 10));
      bullets.push(new Bullet(rocketX + 20, rocketY - 10));
      bullets.push(new Bullet(rocketX + 30, rocketY - 10));
    } else {
      // Shoot a single bullet
      bullets.push(new Bullet(rocketX + 20, rocketY - 10));
    }
    keys.Space = false;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update();
    if (bullet.y < 0) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  }

  // Spawn asteroids
  if (Math.random() < asteroidSpawnRate) {
    const x = Math.random() * (window.innerWidth - 50);
    const speed = (2 + Math.random() * 2) * asteroidSpeedMultiplier;
    asteroids.push(new Asteroid(x, speed));
  }

  // Update asteroids
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    // Check if asteroid goes off the screen
    if (asteroid.y > window.innerHeight) {
      asteroid.remove();
      asteroids.splice(i, 1);
      continue;
    }

    // Check for collision with bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      if (
        bullet.x < asteroid.x + 50 &&
        bullet.x + 5 > asteroid.x &&
        bullet.y < asteroid.y + 50 &&
        bullet.y + 10 > asteroid.y
      ) {
        // Remove asteroid and bullet
        asteroid.remove();
        asteroids.splice(i, 1);
        bullet.remove();
        bullets.splice(j, 1);

        // Increase score and difficulty
        score++;
        scoreDisplay.innerHTML = `Score: ${score}`;
        increaseDifficulty();
        break;
      }
    }

    // Check for collision with rocket
    if (
      rocketX < asteroid.x + 50 &&
      rocketX + 40 > asteroid.x &&
      rocketY < asteroid.y + 50 &&
      rocketY + 80 > asteroid.y
    ) {
      endGame(); // End the game if the rocket collides with an asteroid
      break;
    }
  }

  // Spawn power-ups
  if (Math.random() < powerUpSpawnRate) {
    const x = Math.random() * (window.innerWidth - 30);
    powerUps.push(new PowerUp(x, 'multiShot'));
    console.log("Power-up spawned at:", x); // Debugging log
  }

  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.update();

    // Check for collision with rocket
    if (
      rocketX < powerUp.x + 30 &&
      rocketX + 40 > powerUp.x &&
      rocketY < powerUp.y + 30 &&
      rocketY + 60 > powerUp.y
    ) {
      console.log("Power-up collected!"); // Debugging log
      if (powerUp.type === 'multiShot') {
        activateMultiShot();
      }
      powerUp.remove();
      powerUps.splice(i, 1);
    }

    // Remove power-up if it goes off the screen
    if (powerUp.y > window.innerHeight) {
      console.log("Power-up missed!"); // Debugging log
      powerUp.remove();
      powerUps.splice(i, 1);
    }
  }

  // Update stars
  stars.forEach((star) => star.update());
}

function createExplosion(x, y) {
  const corners = [
    { x: 0, y: 0 },
    { x: window.innerWidth, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight }
  ];

  corners.forEach((corner) => {
    const dot = document.createElement('div');
    dot.className = 'explosion-dot';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.transition = 'left 1s linear, top 1s linear';
    setTimeout(() => {
      dot.style.left = `${corner.x}px`;
      dot.style.top = `${corner.y}px`;
    }, 10);
    gameContainer.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  });
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

   // Show special popup if the score is 100 or more
  if (score >= 100) {
    showSpecialPopup();
  }
  
  const restartButton = document.createElement('button');
  restartButton.id = 'restartBtn';
  restartButton.innerText = 'Restart Game';
  restartButton.style.marginTop = '20px';
  restartButton.style.padding = '10px 20px';
  restartButton.style.fontSize = '18px';
  restartButton.style.cursor = 'pointer';
  restartButton.style.backgroundColor = '#ff5733';
  restartButton.style.color = 'white';
  restartButton.style.border = 'none';
  restartButton.style.borderRadius = '5px';

  restartButton.addEventListener('click', () => {
    location.reload();
  });

  gameOverDisplay.appendChild(restartButton);
}

function showSpecialPopup() {
  const popup = document.createElement('div');
  popup.id = 'specialPopup';
  popup.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.85); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center; max-width: 300px;">
      <p>Congratulations! You have won! Use promo code <strong>BANG!</strong> at checkout to get 10% off.</p>
      <button id="visitStoreButton" style="margin-top: 10px; padding: 10px; font-size: 1em; background-color: #28a745; border: none; color: white; border-radius: 5px; cursor: pointer;">BangarangCrafts.co.za</button>
      <button id="closePopupButton" style="margin-top: 10px; padding: 10px; font-size: 1em; background-color: #ff5733; border: none; color: white; border-radius: 5px; cursor: pointer;">Exit</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Add event listener for the "Visit Store" button to open the link
  document.getElementById('visitStoreButton').addEventListener('click', () => {
    window.open('https://bangarangcrafts.co.za', '_blank');
  });

  // Add event listener for the "Exit" button to close the popup
  document.getElementById('closePopupButton').addEventListener('click', () => {
    popup.remove();
  });
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

window.addEventListener('load', () => {
  // Show the endgame menu right when the game loads
  document.getElementById('gameOver').style.display = 'block';
  document.getElementById('gameOver').innerHTML = `
    <H1>Rocket Ship</H1>
    <p>Created By</p>
	<p>BangarangCrafts</p>
    <button id="startGameButton">Start Game</button>
  `;
  
  // Pause the game loop initially
  gameActive = false;

  // Start the game when the player clicks the Start Game button
  document.getElementById('startGameButton').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none'; // Hide the endgame menu
    gameActive = true; // Set the game to active
    gameLoop(); // Start the game loop  
  });
});
