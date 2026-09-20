const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('startBtn');

const keys = {};

const state = {
  running: false,
  score: 0,
  best: Number(localStorage.getItem('bb-racing-best') || 0),
  speed: 7.5,
  spawnTimer: 700,
  roadScroll: 0,
};

const road = {
  left: 90,
  right: canvas.width - 90,
  top: 140,
  bottom: canvas.height,
  laneCount: 4,
};

const player = {
  x: canvas.width / 2,
  y: canvas.height - 110,
  width: 42,
  height: 84,
  color: '#53f2c4',
  tilt: 0,
  speed: 6,
};

const traffic = [];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function laneX(laneIndex) {
  const ratio = (laneIndex + 0.5) / road.laneCount;
  return road.left + (road.right - road.left) * ratio;
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  bestEl.textContent = Math.floor(state.best);
}

function resetGame() {
  state.running = true;
  state.score = 0;
  state.speed = 7.5;
  state.spawnTimer = 800;
  state.roadScroll = 0;
  traffic.length = 0;
  player.x = canvas.width / 2;
  player.tilt = 0;
  updateHud();
}

function spawnTraffic() {
  const lane = Math.floor(Math.random() * road.laneCount);
  const car = {
    lane,
    x: laneX(lane),
    y: -150,
    width: 42,
    height: 78,
    color: ['#ff6a6a', '#ffb34e', '#7a7dff', '#4ec9ff', '#fd7ae6'][Math.floor(Math.random() * 5)],
    speed: 0.8 + Math.random() * 2,
  };
  traffic.push(car);
}

function movePlayer() {
  let direction = 0;
  if ((keys.ArrowLeft || keys.a) && !(keys.ArrowRight || keys.d)) direction = -1;
  if ((keys.ArrowRight || keys.d) && !(keys.ArrowLeft || keys.a)) direction = 1;

  player.x += direction * player.speed * 1.6;
  player.x = clamp(player.x, road.left + 38, road.right - 38);

  player.tilt = direction * 0.9;
  if (direction === 0) player.tilt *= 0.7;
}

function endRace() {
  state.running = false;
  state.best = Math.max(state.best, state.score);
  localStorage.setItem('bb-racing-best', String(Math.floor(state.best)));
  startBtn.textContent = 'Race Again';
  updateHud();
}

function update(dt) {
  if (!state.running) return;

  movePlayer();
  state.score += dt * 0.025;
  state.speed += dt * 0.0007;
  state.roadScroll += state.speed * dt * 0.12;
  state.spawnTimer -= dt;

  if (state.spawnTimer <= 0) {
    spawnTraffic();
    state.spawnTimer = Math.max(380, 1000 - state.speed * 30);
  }

  for (let i = traffic.length - 1; i >= 0; i--) {
    const car = traffic[i];
    car.y += (state.speed + car.speed) * dt * 0.12;

    const hit =
      player.x - player.width / 2 < car.x + car.width / 2 &&
      player.x + player.width / 2 > car.x - car.width / 2 &&
      player.y - player.height / 2 < car.y + car.height / 2 &&
      player.y + player.height / 2 > car.y - car.height / 2;

    if (hit) {
      endRace();
      return;
    }

    if (car.y > canvas.height + 120) {
      traffic.splice(i, 1);
    }
  }

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('bb-racing-best', String(Math.floor(state.best)));
  }

  updateHud();
}

function drawSkyline() {
  const horizon = 170;
  ctx.fillStyle = '#0c1a26';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#142f3a';
  for (let i = 0; i < 12; i++) {
    const x = i * 38;
    const h = 40 + ((i * 29) % 70);
    ctx.fillRect(x, horizon - h, 24, h);
  }

  ctx.fillStyle = '#1d3d4a';
  for (let i = 0; i < 15; i++) {
    const x = i * 30;
    const y = horizon - 5 - ((i * 13) % 30);
    ctx.fillRect(x + 10, y, 12, 30 + (i % 3) * 22);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 20; i++) {
    const x = (i * 35 + state.roadScroll * 0.8) % (canvas.width + 20);
    const y = 30 + ((i * 53) % 70);
    ctx.fillRect(x, y, 2, 12);
  }
}

function drawRoad() {
  const horizon = 170;
  const roadTop = 60;

  ctx.fillStyle = '#143a2d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1d262f';
  ctx.beginPath();
  ctx.moveTo(road.left, canvas.height);
  ctx.lineTo(road.left, horizon);
  ctx.lineTo(road.right, horizon);
  ctx.lineTo(road.right, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#26313c';
  ctx.fillRect(road.left - 8, horizon, 8, canvas.height - horizon);
  ctx.fillRect(road.right, horizon, 8, canvas.height - horizon);

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(road.left, horizon);
  ctx.lineTo(road.left, canvas.height);
  ctx.moveTo(road.right, horizon);
  ctx.lineTo(road.right, canvas.height);
  ctx.stroke();

  const laneSeg = 26;
  const laneGap = 20;
  for (let lane = 1; lane < road.laneCount; lane++) {
    const x1 = road.left + ((road.right - road.left) * lane) / road.laneCount;
    const x2 = road.left + ((road.right - road.left) * lane) / road.laneCount;
    const stripCount = Math.ceil((canvas.height - horizon) / (laneSeg + laneGap));
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;

    for (let i = 0; i < stripCount; i++) {
      const y = horizon + ((i * (laneSeg + laneGap) + (state.roadScroll * 1.5)) % ((canvas.height - horizon) + 60));
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y + laneSeg);
      ctx.stroke();
    }
  }
}

function drawCar(x, y, width, height, color, isPlayer = false) {
  ctx.save();
  ctx.translate(x, y);

  if (isPlayer) {
    ctx.rotate(player.tilt * 0.22);
  }

  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#101922';
  ctx.fillRect(-width / 2 + 8, -height / 2 + 10, width - 16, 18);
  ctx.fillRect(-width / 2 + 8, height / 2 - 28, width - 16, 18);

  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillRect(-width / 2 + 8, -height / 2 + 8, 10, 10);
  ctx.fillRect(width / 2 - 18, -height / 2 + 8, 10, 10);
  ctx.fillRect(-width / 2 + 8, height / 2 - 18, 10, 10);
  ctx.fillRect(width / 2 - 18, height / 2 - 18, 10, 10);

  ctx.fillStyle = '#d8faff';
  ctx.fillRect(-width / 2 + 7, -height / 2 + 26, width - 14, 5);

  ctx.restore();
}

function drawStartScene() {
  ctx.fillStyle = 'rgba(6, 12, 18, 0.46)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ebf8ff';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('BB Racing', canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = '18px Arial';
  ctx.fillText('Press Start to Race', canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText('A / D or ← / → to steer', canvas.width / 2, canvas.height / 2 + 42);
}

function drawCrashScene() {
  ctx.fillStyle = 'rgba(7, 12, 18, 0.62)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff6a6a';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('Crash!', canvas.width / 2, canvas.height / 2 - 28);

  ctx.fillStyle = '#ebf8ff';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${Math.floor(state.score)}`, canvas.width / 2, canvas.height / 2 + 18);
  ctx.fillText('Press Race Again', canvas.width / 2, canvas.height / 2 + 52);
}

function render() {
  drawSkyline();
  drawRoad();

  for (const car of traffic) {
    drawCar(car.x, car.y, car.width, car.height, car.color);
  }

  drawCar(player.x, player.y, player.width, player.height, player.color, true);

  if (!state.running) {
    if (state.score === 0) {
      drawStartScene();
    } else {
      drawCrashScene();
    }
  }
}

let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min(32, timestamp - lastTime || 16);
  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[event.key] = true;
  keys[key] = true;

  if ((event.key === ' ' || key === 'enter') && !state.running) {
    resetGame();
    startBtn.textContent = 'Restart Race';
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  keys[event.key] = false;
  keys[key] = false;
});

startBtn.addEventListener('click', () => {
  resetGame();
  startBtn.textContent = 'Restart Race';
});

updateHud();
render();
requestAnimationFrame(gameLoop);
