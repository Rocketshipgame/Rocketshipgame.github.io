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

function addMobileControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'mobileControls';

  // Add a class to the body or game container when mobile controls are added
  document.body.classList.add('mobile-controls-active');
  
  // Create left button (transparent, no text)
  const leftButton = document.createElement('button');
  leftButton.style.width = '80px';
  leftButton.style.height = '80px';
  leftButton.addEventListener('touchstart', () => (keys.ArrowLeft = true));
  leftButton.addEventListener('touchend', () => (keys.ArrowLeft = false));

  // Create right button (transparent, no text)
  const rightButton = document.createElement('button');
  rightButton.style.width = '80px';
  rightButton.style.height = '80px';
  rightButton.addEventListener('touchstart', () => (keys.ArrowRight = true));
  rightButton.addEventListener('touchend', () => (keys.ArrowRight = false));

  // Create shoot button (transparent, no text)
  const shootButton = document.createElement('button');
  shootButton.style.width = '80px';
  shootButton.style.height = '80px';
  shootButton.addEventListener('touchstart', () => (keys.Space = true));

  // Append buttons to controls container
  controlsContainer.appendChild(leftButton);
  controlsContainer.appendChild(rightButton);
  controlsContainer.appendChild(shootButton);

  // Append the controls container to the body
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
  // Adjust the bullet's starting x position to be centered on the rocket
  const bulletX = rocketX + (rocket.offsetWidth / 2) - 2.5; // Adjusting for bullet width (5px)
  
  // Adjust the bullet's starting y position to be slightly higher up the rocket
  const bulletY = rocketY - 10; // Move it up slightly above the rocket

  // Create the bullet with adjusted x and y
  bullets.push(new Bullet(bulletX, bulletY));
  keys.Space = false;
}


  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    if (bullet.y < 0) {
      bullet.remove();
      bullets.splice(bulletIndex, 1);
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
        // Explosion effect at the asteroid's position
        createExplosion(asteroid.x + 25, asteroid.y + 25); // Adjust coordinates as necessary

        // Remove the bullet and asteroid
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

// Function to create explosion dots that shoot to the corners
function createExplosion(x, y) {
  const corners = [
    { x: 0, y: 0 },                               // Top-left corner
    { x: window.innerWidth, y: 0 },               // Top-right corner
    { x: 0, y: window.innerHeight },              // Bottom-left corner
    { x: window.innerWidth, y: window.innerHeight } // Bottom-right corner
  ];

  corners.forEach((corner) => {
    const dot = document.createElement('div');
    dot.className = 'explosion-dot';
    dot.style.position = 'absolute';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.width = '5px';
    dot.style.height = '5px';
    dot.style.backgroundColor = 'white';
    dot.style.borderRadius = '50%';

    // Move the dot to the corner using left and top positions
    const deltaX = corner.x - x;
    const deltaY = corner.y - y;

    dot.style.transition = 'left 1s linear, top 1s linear';
    setTimeout(() => {
      dot.style.left = `${corner.x}px`;
      dot.style.top = `${corner.y}px`;
    }, 10); // Small delay to ensure transition works

    gameContainer.appendChild(dot);

    // Remove the dot after the animation
    setTimeout(() => {
      dot.remove();
    }, 1000); // Duration of the animation
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

   // Show special popup if the score is 200 or more
  if (score >= 200) {
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
    <a href="https://bangarangcrafts.co.za/">BangarangCrafts</a>
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

