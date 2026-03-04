const gameStatus = document.getElementById("gameStatus");
const gameScore = document.getElementById("gameScore");
const gameTimer = document.getElementById("gameTimer");
const gameBoard = document.getElementById("gameBoard");
const startButton = document.getElementById("startGame");

const candyEmojis = ["🍬", "🍭", "🍫", "🧁", "🍩", "🍪"];

let score = 0;
let timeLeft = 30;
let activeCandyId = null;
let gameTickInterval = null;
let spawnInterval = null;
let gameRunning = false;

function setStatus(message) {
  gameStatus.textContent = message;
}

function clearCandies() {
  gameBoard.querySelectorAll(".candy-target").forEach((item) => item.remove());
}

function updateHud() {
  gameScore.textContent = String(score);
  gameTimer.textContent = String(timeLeft);
}

function removeCandyById(candyId) {
  const element = document.getElementById(candyId);
  if (element) {
    element.remove();
  }
}

function spawnCandy() {
  if (!gameRunning) return;

  if (activeCandyId) {
    removeCandyById(activeCandyId);
  }

  const candy = document.createElement("button");
  const candyId = `candy-${Date.now()}`;
  activeCandyId = candyId;

  candy.className = "candy-target";
  candy.id = candyId;
  candy.type = "button";
  candy.textContent = candyEmojis[Math.floor(Math.random() * candyEmojis.length)];

  const maxX = Math.max(10, gameBoard.clientWidth - 54);
  const maxY = Math.max(10, gameBoard.clientHeight - 54);
  candy.style.left = `${Math.floor(Math.random() * maxX)}px`;
  candy.style.top = `${Math.floor(Math.random() * maxY)}px`;

  candy.addEventListener("click", () => {
    if (!gameRunning) return;
    score += 1;
    setStatus("Sweet catch! Keep going!");
    updateHud();
    candy.remove();
    activeCandyId = null;
  });

  gameBoard.appendChild(candy);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTickInterval);
  clearInterval(spawnInterval);
  gameTickInterval = null;
  spawnInterval = null;
  clearCandies();
  activeCandyId = null;

  setStatus(`Time! You caught ${score} candies.`);
  startButton.disabled = false;
  startButton.textContent = "Play Again";
}

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  updateHud();
  setStatus("Catch as many candies as you can before time runs out!");
  startButton.disabled = true;

  spawnCandy();
  spawnInterval = setInterval(spawnCandy, 900);

  gameTickInterval = setInterval(() => {
    timeLeft -= 1;
    updateHud();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

startButton.addEventListener("click", startGame);
updateHud();
