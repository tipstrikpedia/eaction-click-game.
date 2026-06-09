const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const comboEl = document.getElementById("combo");
const levelEl = document.getElementById("level");
const hitsEl = document.getElementById("hits");
const missesEl = document.getElementById("misses");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const modeSelect = document.getElementById("modeSelect");
const target = document.getElementById("target");
const gameArea = document.getElementById("gameArea");
const message = document.getElementById("message");
const floatingText = document.getElementById("floatingText");

const modes = {
  easy: { time: 45, baseSize: 82, missPenalty: 1, label: "Easy" },
  normal: { time: 40, baseSize: 74, missPenalty: 2, label: "Normal" },
  hard: { time: 30, baseSize: 64, missPenalty: 3, label: "Hard" },
};

let score = 0;
let time = modes.normal.time;
let combo = 0;
let level = 1;
let hits = 0;
let misses = 0;
let timer = null;
let playing = false;
let currentMode = "normal";

const bestKey = "neon-reflex-rush-best";
let best = Number(localStorage.getItem(bestKey) || 0);
bestEl.textContent = best;
timeEl.textContent = time;

function updateHud() {
  scoreEl.textContent = score;
  timeEl.textContent = time;
  comboEl.textContent = combo;
  levelEl.textContent = level;
  hitsEl.textContent = hits;
  missesEl.textContent = misses;
}

function randomPosition(size) {
  const area = gameArea.getBoundingClientRect();
  const padding = 12;
  const maxX = Math.max(padding, area.width - size - padding);
  const maxY = Math.max(padding, area.height - size - padding);

  return {
    x: padding + Math.random() * (maxX - padding),
    y: padding + Math.random() * (maxY - padding),
  };
}

function calculateLevel() {
  return Math.floor(hits / 8) + 1;
}

function getTargetSize() {
  const mode = modes[currentMode];
  return Math.max(30, mode.baseSize - (level - 1) * 5);
}

function moveTarget() {
  level = calculateLevel();
  const size = getTargetSize();
  const pos = randomPosition(size);

  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${pos.x}px`;
  target.style.top = `${pos.y}px`;
  target.classList.remove("pop");
  void target.offsetWidth;
  target.classList.add("pop");
  target.style.display = "block";
  updateHud();
}

function showFloatingText(text, x, y, positive = true) {
  floatingText.textContent = text;
  floatingText.style.left = `${x}px`;
  floatingText.style.top = `${y}px`;
  floatingText.style.color = positive ? "#bef264" : "#fb7185";
  floatingText.classList.remove("show");
  void floatingText.offsetWidth;
  floatingText.classList.add("show");
}

function startGame() {
  currentMode = modeSelect.value;
  score = 0;
  combo = 0;
  level = 1;
  hits = 0;
  misses = 0;
  time = modes[currentMode].time;
  playing = true;

  updateHud();
  startBtn.disabled = true;
  modeSelect.disabled = true;
  startBtn.textContent = "Playing...";
  message.style.display = "none";

  moveTarget();

  timer = setInterval(() => {
    time -= 1;
    updateHud();

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
  modeSelect.disabled = false;
  startBtn.textContent = "Play Again";

  const accuracy = hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100);

  if (score > best) {
    best = score;
    localStorage.setItem(bestKey, best);
    bestEl.textContent = best;
    message.innerHTML = `
      <div class="pulse-icon">🏆</div>
      <h2>Rekor Baru!</h2>
      <p>Skor <b>${score}</b> • Hits <b>${hits}</b> • Accuracy <b>${accuracy}%</b></p>
    `;
  } else {
    message.innerHTML = `
      <div class="pulse-icon">⚡</div>
      <h2>Game Selesai</h2>
      <p>Skor <b>${score}</b> • Hits <b>${hits}</b> • Accuracy <b>${accuracy}%</b> • Best <b>${best}</b></p>
    `;
  }

  message.style.display = "grid";
}

target.addEventListener("click", (event) => {
  if (!playing) return;
  event.stopPropagation();

  hits += 1;
  combo += 1;
  const bonus = Math.floor(combo / 5);
  const points = 10 + bonus;
  score += points;

  const rect = gameArea.getBoundingClientRect();
  showFloatingText(`+${points}`, event.clientX - rect.left, event.clientY - rect.top, true);
  moveTarget();
});

gameArea.addEventListener("click", (event) => {
  if (!playing) return;
  if (event.target === target || target.contains(event.target)) return;

  misses += 1;
  combo = 0;
  score = Math.max(0, score - modes[currentMode].missPenalty);
  updateHud();

  const rect = gameArea.getBoundingClientRect();
  showFloatingText("MISS", event.clientX - rect.left, event.clientY - rect.top, false);
  gameArea.classList.remove("shake");
  void gameArea.offsetWidth;
  gameArea.classList.add("shake");
});

startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", () => {
  best = 0;
  localStorage.setItem(bestKey, best);
  bestEl.textContent = best;
});

modeSelect.addEventListener("change", () => {
  if (playing) return;
  time = modes[modeSelect.value].time;
  timeEl.textContent = time;
});
