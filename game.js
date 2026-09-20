const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('startBtn');

const road = {
  x: 70,
  width: canvas.width - 140,
  laneCount: 3,
  laneWidth: 0,
  scroll: 0,
};
road.laneWidth = road.width / road.laneCount;

const state = {
  running: false,
  score: 0,
  best: Number(localStorage.getItem('bb-best-score') || 0),
  speed: 7,
  spawnTimer: 0,
  roadSpeed: 0,
};

const player = {
  width: 54,
  height: 96,
  x: canvas.width / 2,
  y: canvas.height - 130,
  color: '#2de2a7',
  targetX: canvas.width / 2,
  dx: 0,
  tilt: 0,
};

const traffic = [];

function resetGame() {
  state.running = true;
  state.score = 0;
  state.speed = 7;
  state.spawnTimer = 0;
  state.roadSpeed = 0;
  road.scroll = 0;
  traffic.length = 0;
  player.x = canvas.width / 2;
  player.targetX = canvas.width / 2;
  player.dx = 0;
  player.tilt = 0;
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = Math.floor(state.score);
  bestEl.textContent = Math.floor(state.best);
}

function laneCenter(lane) {
  const laneX = road.x + lane * road.laneWidth + road.laneWidth / 2;
  return laneX;
}

function spawnCar() {
  const lane = Math.floor(Math.random() * road.laneCount);
  const car = {
    lane,
    x: laneCenter(lane),
    y: -120,
    width: 54,
    height: 96,
    color: ['#ff5d73', '#ffb703', '#9b8cff', '#47d0ff', '#ff7b54'][Math.floor(Math.random() * 5)],
    speed: 0.9 + Math.random() * 2.3,
  };
  traffic.push(car);
}

function handleInput() {
  const left = keys['ArrowLeft'] || keys['a'];
  const right = keys['ArrowRight'] || keys['d'];

  if (left && !right) {
    player.targetX -= 9;
    player.tilt = -1;
  }

  if (right && !left) {
    player.targetX += 9;
    player.tilt = 1;
  }

  if (!left && !right) {
    player.tilt *= 0.75;
  }

  player.targetX = clamp(player.targetX, road.x + 20, road.x + road.width - 20);
  player.dx = (player.targetX - player.x) * 0.2;
  player.x += player.dx;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function update(dt) {
  if (!state.running) return;

  handleInput();

  state.speed += 0.003 * dt;
  state.roadSpeed = state.speed * 0.9;
  road.scroll += state.roadSpeed * dt * 0.12;
  state.score += dt * 0.02;

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnCar();
    state.spawnTimer = Math.max(500, 1200 - state.speed * 30);
  }

  for (let i = traffic.length - 1; i >= 0; i--) {
    const car = traffic[i];
    car.y += (state.speed + car.speed) * dt * 0.08;

    if (car.y > canvas.height + 200) {
      traffic.splice(i, 1);
      continue;
    }

    const hit =
      player.x < car.x + car.width / 2 &&
      player.x + player.width > car.x - car.width / 2 &&
      player.y < car.y + car.height / 2 &&
      player.y + player.height > car.y - car.height / 2;

    if (hit) {
      endGame();
      return;
    }
  }

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('bb-best-score', String(Math.floor(state.best)));
  }

  updateHUD();
}

function endGame() {
  state.running = false;
  state.best = Math.max(state.best, state.score);
  localStorage.setItem('bb-best-score', String(Math.floor(state.best)));
  updateHUD();
  startBtn.textContent = 'Race Again';
}

function drawBackground() {
  ctx.fillStyle = '#102a2d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#184c35';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1d2b31';
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  ctx.fillStyle = '#8a8f96';
  ctx.fillRect(road.x - 10, 0, 10, canvas.height);
  ctx.fillRect(road.x + road.width, 0, 10, canvas.height);

  const stripeLength = 48;
  const stripeGap = 18;
  const total = Math.ceil(canvas.height / (stripeLength + stripeGap)) + 2;

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < total; i++) {
    const y = ((i * (stripeLength + stripeGap) + (road.scroll % (stripeLength + stripeGap))) % (canvas.height + 80)) - 40;
    for (let lane = 1; lane < road.laneCount; lane++) {
      const laneX = road.x + lane * road.laneWidth;
      ctx.fillRect(laneX - 3, y, 6, stripeLength);
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 12; i++) {
    const x = 20 + (i * 31) % (canvas.width - 40);
    const y = ((i * 79 + road.scroll * 0.6) % (canvas.height + 100)) - 50;
    ctx.fillRect(x, y, 2, 18);
  }
}

function drawCar(x, y, width, height, color, isPlayer = false) {
  ctx.save();
  ctx.translate(x, y);
  if (isPlayer) {
    ctx.rotate(player.tilt * 0.1);
  }

  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a1116';
  ctx.fillRect(-width / 2 + 10, -height / 2 + 14, width - 20, 24);
  ctx.fillRect(-width / 2 + 10, height / 2 - 38, width - 20, 24);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-width / 2 + 12, -height / 2 + 8, 10, 12);
  ctx.fillRect(width / 2 - 22, -height / 2 + 8, 10, 12);
  ctx.fillRect(-width / 2 + 12, height / 2 - 20, 10, 12);
  ctx.fillRect(width / 2 - 22, height / 2 - 20, 10, 12);

  ctx.fillStyle = '#c7f7ff';
  ctx.fillRect(-width / 2 + 8, -height / 2 + 24, width - 16, 6);

  ctx.restore();
}

function drawStartPrompt() {
  ctx.fillStyle = 'rgba(7, 18, 26, 0.45)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ebf7ff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('BB Racing', canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = '18px Arial';
  ctx.fillText('Press Start to Race', canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText('A/D or ←/→ to steer', canvas.width / 2, canvas.height / 2 + 52);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(6, 14, 20, 0.58)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ff5d73';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('Crash!', canvas.width / 2, canvas.height / 2 - 26);

  ctx.fillStyle = '#ebf7ff';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${Math.floor(state.score)}`, canvas.width / 2, canvas.height / 2 + 18);
  ctx.fillText('Press Race Again', canvas.width / 2, canvas.height / 2 + 54);
}

function render() {
  drawBackground();

  for (const car of traffic) {
    drawCar(car.x, car.y, car.width, car.height, car.color);
  }

  drawCar(player.x, player.y, player.width, player.height, player.color, true);

  if (!state.running) {
    if (state.score === 0) {
      drawStartPrompt();
    } else {
      drawGameOver();
    }
  }
}

let lastTime = 0;
const keys = {};

function gameLoop(timestamp) {
  const dt = timestamp - lastTime || 16;
  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  keys[event.key.toLowerCase()] = true;
  if (event.key === ' ' && !state.running) {
    resetGame();
    startBtn.textContent = 'Restart Race';
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
  keys[event.key.toLowerCase()] = false;
});

startBtn.addEventListener('click', () => {
  resetGame();
  startBtn.textContent = 'Restart Race';
});

updateHUD();
render();
requestAnimationFrame(gameLoop);
