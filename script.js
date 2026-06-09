const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const target = document.getElementById("target");
const gameArea = document.getElementById("gameArea");
const message = document.getElementById("message");

let score = 0;
let time = 30;
let timer = null;
let playing = false;

const bestKey = "reaction-click-best-score";
let best = Number(localStorage.getItem(bestKey) || 0);
bestEl.textContent = best;

function randomPosition(size) {
  const area = gameArea.getBoundingClientRect();
  const padding = 12;
  const maxX = area.width - size - padding;
  const maxY = area.height - size - padding;

  return {
    x: Math.max(padding, Math.random() * maxX),
    y: Math.max(padding, Math.random() * maxY),
  };
}

function moveTarget() {
  const size = Math.max(34, 72 - Math.floor(score / 4) * 4);
  const pos = randomPosition(size);

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${pos.x}px`;
  target.style.top = `${pos.y}px`;
  target.classList.remove("pop");
  void target.offsetWidth;
  target.classList.add("pop");
  target.style.display = "block";
}

function startGame() {
  score = 0;
  time = 30;
  playing = true;

  scoreEl.textContent = score;
  timeEl.textContent = time;
  startBtn.disabled = true;
  startBtn.textContent = "Playing...";
  message.style.display = "none";

  moveTarget();

  timer = setInterval(() => {
    time -= 1;
    timeEl.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  playing = false;
  clearInterval(timer);
  target.style.display = "none";
  startBtn.disabled = false;
  startBtn.textContent = "Play Again";

  if (score > best) {
    best = score;
    localStorage.setItem(bestKey, best);
    bestEl.textContent = best;
    message.innerHTML = `Game selesai! Skor kamu <b>${score}</b>. Rekor baru!`;
  } else {
    message.innerHTML = `Game selesai! Skor kamu <b>${score}</b>. Best score: <b>${best}</b>.`;
  }

  message.style.display = "grid";
}

target.addEventListener("click", () => {
  if (!playing) return;

  score += 1;
  scoreEl.textContent = score;
  moveTarget();
});

startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", () => {
  best = 0;
  localStorage.setItem(bestKey, best);
  bestEl.textContent = best;
});
