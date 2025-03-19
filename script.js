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

let lastFrameTime = performance.now(); // Initialize with the current time
let frameCount = 0; // Initialize frame count to 0
let currentFPS = 60; // Assume 60 FPS initially
const fpsThreshold = 5; // Show popup if FPS drops below this value

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

let fpsSamples = []; // Array to store FPS samples for averaging
const sampleSize = 10; // Number of samples to average

function measureFPS() {
  const now = performance.now();
  const delta = now - lastFrameTime;

  frameCount++;
  if (delta >= 1000) { // Calculate FPS every second
    const currentFPS = (frameCount * 1000) / delta;
    frameCount = 0;
    lastFrameTime = now;

    // Add the current FPS to the samples array
    fpsSamples.push(currentFPS);
    if (fpsSamples.length > sampleSize) {
      fpsSamples.shift(); // Remove the oldest sample
    }

    // Calculate the average FPS
    const averageFPS = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;

    // Debugging: Log the average FPS
    console.log(`Average FPS: ${averageFPS}`);

    // Check if average FPS is below the threshold
    if (averageFPS < fpsThreshold && gameActive) {
      console.log(`Average FPS is below threshold (${fpsThreshold}). Showing popup...`);
      showLowFPSPopup();
    } else {
      console.log(`Average FPS is above threshold (${fpsThreshold}). No action taken.`);
    }
  }
}

function showLowFPSPopup() {
  // Check if the popup already exists
  if (document.getElementById('lowFpsPopup')) {
    return; // Don't show multiple popups
  }

  const popup = document.createElement('div');
  popup.id = 'lowFpsPopup';
  popup.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.85); color: white; padding: 20px; border-radius: 10px; z-index: 1000; text-align: center; max-width: 300px;">
      <p>The game is running slowly on your device. Would you like to switch to a more basic version for better performance?</p>
      <button id="switchToBasicButton" style="margin-top: 10px; padding: 10px; font-size: 1em; background-color: #28a745; border: none; color: white; border-radius: 5px; cursor: pointer;">Switch to Basic Version</button>
      <button id="closePopupButton" style="margin-top: 10px; padding: 10px; font-size: 1em; background-color: #ff5733; border: none; color: white; border-radius: 5px; cursor: pointer;">Continue Anyway</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Add event listener for the "Switch to Basic Version" button
  document.getElementById('switchToBasicButton').addEventListener('click', () => {
    // Redirect to the basic version HTML file
    window.location.href = 'Older.html';
  });

  // Add event listener for the "Continue Anyway" button
  document.getElementById('closePopupButton').addEventListener('click', () => {
    popup.remove();
  });

  // Debugging: Log that the popup is shown
  console.log("Low FPS popup displayed.");
}

function switchToBasicVersion() {
  console.log("Switching to basic version...");

  // Stop the current game loop
  gameActive = false;

  // Remove all game elements
  gameContainer.innerHTML = '';

  // Load the basic version of the game
  const script = document.createElement('html');
  html.src = 'Older.html'; // Replace with the path to your basic version
  script.onload = () => {
    console.log("Basic version loaded successfully.");
  };
  script.onerror = () => {
    console.error("Failed to load basic version.");
  };
  document.body.appendChild(script);
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
  leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    keys.ArrowLeft = true;
  });
  leftButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    keys.ArrowLeft = false;
  });

  const rightButton = document.createElement('button');
  rightButton.style.width = '80px';
  rightButton.style.height = '80px';
  rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    keys.ArrowRight = true;
  });
  rightButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    keys.ArrowRight = false;
  });

  const shootButton = document.createElement('button');
  shootButton.style.width = '80px';
  shootButton.style.height = '80px';
  shootButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    keys.Space = true;
  });

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

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => {
  if (e.code in keys) keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

// Restart game button
restartBtn.addEventListener('click', () => {
  location.reload();
});

// Game loop
function gameLoop() {
  update();
  measureFPS(); // Measure FPS every frame
  if (gameActive) requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

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
  updateBullets();

  // Spawn asteroids
  if (Math.random() < asteroidSpawnRate) {
    const x = Math.random() * (window.innerWidth - 50);
    const speed = (2 + Math.random() * 2) * asteroidSpeedMultiplier;
    asteroids.push(new Asteroid(x, speed));
  }

  // Spawn power-ups
  if (Math.random() < powerUpSpawnRate) {
    const x = Math.random() * (window.innerWidth - 30);
    powerUps.push(new PowerUp(x, 'multiShot'));
  }

  // Update asteroids
  updateAsteroids();

  // Update power-ups
  updatePowerUps();

  // Update stars
  stars.forEach((star) => star.update());
}

class Bullet {
  constructor(x, y, vx = 0, vy = -5) {
    this.x = x;
    this.y = y;
    this.vx = vx; // Horizontal velocity
    this.vy = vy; // Vertical velocity
    this.element = document.createElement('div');
    this.element.className = 'bullet';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    gameContainer.appendChild(this.element);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;

    // Remove the bullet if it goes off the screen
    if (
      this.x < 0 || this.x > window.innerWidth ||
      this.y < 0 || this.y > window.innerHeight
    ) {
      this.remove();
      const index = bullets.indexOf(this);
      if (index !== -1) {
        bullets.splice(index, 1); // Remove the bullet from the array
      }
    }
  }

  remove() {
    this.element.remove();
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update();

    // Check for collision with power-ups
    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j];
      if (
        bullet.x < powerUp.x + 30 &&
        bullet.x + 5 > powerUp.x &&
        bullet.y < powerUp.y + 30 &&
        bullet.y + 10 > powerUp.y
      ) {
        // Remove the bullet and power-up
        bullet.remove();
        bullets.splice(i, 1);
        powerUp.remove();
        powerUps.splice(j, 1);

        // Create explosion effect
        createExplosion(powerUp.x, powerUp.y);

        // Create 4 new exploding bullets
        createExplodingBullets(powerUp.x, powerUp.y);
        break;
      }
    }
  }
}

function createExplodingBullets(x, y) {
  // Define the four corners of the screen
  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: window.innerWidth, y: 0 }, // Top-right
    { x: 0, y: window.innerHeight }, // Bottom-left
    { x: window.innerWidth, y: window.innerHeight } // Bottom-right
  ];

  // Create a bullet for each corner
  corners.forEach(corner => {
    const dx = corner.x - x; // Horizontal distance to corner
    const dy = corner.y - y; // Vertical distance to corner
    const angle = Math.atan2(dy, dx); // Calculate the angle to the corner

    // Calculate velocity toward the corner
    const speed = 5; // Adjust speed as needed
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Create an exploding bullet
    const bullet = new Bullet(x, y, vx, vy);
    bullet.element.classList.add('blue-orb'); // Add blue-orb class
    bullets.push(bullet);
  });
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

function updateAsteroids() {
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

        // Create explosion effect
        createExplosion(asteroid.x, asteroid.y);

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
      // Create explosion effect
      createExplosion(asteroid.x, asteroid.y);

      endGame(); // End the game if the rocket collides with an asteroid
      break;
    }
  }
}

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

function updatePowerUps() {
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
      if (powerUp.type === 'multiShot') {
        activateMultiShot();
      }
      powerUp.remove();
      powerUps.splice(i, 1);
    }

    // Remove power-up if it goes off the screen
    if (powerUp.y > window.innerHeight) {
      powerUp.remove();
      powerUps.splice(i, 1);
    }
  }
}

function activateMultiShot() {
  isMultiShotActive = true;
  setTimeout(() => {
    isMultiShotActive = false; // Deactivate after 10 seconds
  }, 10000);
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

function createStars() {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const speed = 1 + Math.random();
    stars.push(new Star(x, y, speed));
  }
}

// Create stars for the background
createStars();

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

function createExplosion(x, y) {
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  explosion.style.left = `${x}px`;
  explosion.style.top = `${y}px`;
  gameContainer.appendChild(explosion);

  // Remove the explosion after the animation ends
  setTimeout(() => {
    explosion.remove();
  }, 500); // Match the duration of the CSS animation
}

function increaseDifficulty() {
  if (score % 10 === 0 && score > 0) {
    asteroidSpawnRate += 0.01;
    asteroidSpeedMultiplier += 0.2;
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

// If the user is on a mobile device, add the touch controls
if (isMobile()) {
  addMobileControls();
}

function gameLoop() {
  update();
  measureFPS(); // Measure FPS every frame
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
