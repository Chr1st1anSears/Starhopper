/**
 * Starhopper
 * Arcade space exploration game.
 */

// --- Constants & Config ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_SIZE = 15;
const STAR_RADIUS = 6;
const CONNECTION_DISTANCE = 30; // Distance to trigger connection

const COLORS = {
  background: '#000033',
  starUnconnected: '#ffffff',
  starConnected: '#ff00bb', // Neon pink
  lineUnconnected: 'rgba(255, 255, 255, 0.2)',
  lineConnected: '#ff00bb',
  ship: '#00ffff', // Cyan
  text: '#ffffff'
};

const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  FAIL: 'FAIL',
  WIN: 'WIN'
};

// Zodiac Configurations (Approximate shapes)
// Coordinates are relative 0-1 to scale to canvas
const CONSTELLATIONS = [
  {
    name: "Aries",
    timeLimit: 30,
    stars: [
      { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.4 }, { x: 0.6, y: 0.45 }, { x: 0.7, y: 0.6 }
    ]
  }, // 1
  {
    name: "Taurus",
    timeLimit: 28,
    stars: [
      { x: 0.3, y: 0.7 }, { x: 0.4, y: 0.5 }, { x: 0.35, y: 0.3 }, { x: 0.5, y: 0.35 }, { x: 0.7, y: 0.3 }, { x: 0.8, y: 0.4 }
    ]
  }, // 2
  {
    name: "Gemini",
    timeLimit: 26,
    stars: [
      { x: 0.3, y: 0.2 }, { x: 0.3, y: 0.8 }, { x: 0.4, y: 0.8 }, { x: 0.4, y: 0.2 }, { x: 0.35, y: 0.5 }, { x: 0.5, y: 0.5 } // Abstracted simple form
    ]
  }, // 3 - Gemini is complex, simplified to two parallel lines connected
  {
    name: "Cancer",
    timeLimit: 24,
    stars: [
      { x: 0.5, y: 0.5 }, { x: 0.4, y: 0.3 }, { x: 0.6, y: 0.3 }, { x: 0.5, y: 0.7 }, { x: 0.4, y: 0.8 }
    ]
  }, // 4
  {
    name: "Leo",
    timeLimit: 22,
    stars: [
      { x: 0.6, y: 0.3 }, { x: 0.5, y: 0.2 }, { x: 0.4, y: 0.25 }, { x: 0.35, y: 0.4 }, { x: 0.4, y: 0.6 }, { x: 0.6, y: 0.6 }, { x: 0.7, y: 0.5 }
    ]
  }, // 5
  {
    name: "Virgo",
    timeLimit: 20,
    stars: [
      { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.5 }, { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.7 }, { x: 0.7, y: 0.4 }, { x: 0.8, y: 0.8 }
    ]
  }, // 6
  {
    name: "Libra",
    timeLimit: 19,
    stars: [
      { x: 0.3, y: 0.7 }, { x: 0.5, y: 0.8 }, { x: 0.7, y: 0.7 }, { x: 0.5, y: 0.4 }, { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.4 }
    ]
  }, // 7
  {
    name: "Scorpio",
    timeLimit: 18,
    stars: [
      { x: 0.2, y: 0.3 }, { x: 0.3, y: 0.4 }, { x: 0.4, y: 0.5 }, { x: 0.5, y: 0.6 }, { x: 0.6, y: 0.5 }, { x: 0.6, y: 0.3 }, { x: 0.7, y: 0.3 }, { x: 0.75, y: 0.4 }
    ]
  }, // 8
  {
    name: "Sagittarius",
    timeLimit: 17,
    stars: [
      { x: 0.3, y: 0.6 }, { x: 0.5, y: 0.6 }, { x: 0.5, y: 0.3 }, { x: 0.6, y: 0.5 }, { x: 0.7, y: 0.4 }, { x: 0.4, y: 0.4 }, { x: 0.4, y: 0.7 }
    ]
  }, // 9
  {
    name: "Capricorn",
    timeLimit: 16,
    stars: [
      { x: 0.3, y: 0.3 }, { x: 0.5, y: 0.4 }, { x: 0.7, y: 0.3 }, { x: 0.6, y: 0.7 }, { x: 0.4, y: 0.7 }
    ]
  }, // 10
  {
    name: "Aquarius",
    timeLimit: 15,
    stars: [
      { x: 0.2, y: 0.2 }, { x: 0.3, y: 0.4 }, { x: 0.4, y: 0.2 }, { x: 0.5, y: 0.4 }, { x: 0.6, y: 0.2 }, { x: 0.7, y: 0.4 }
    ]
  }, // 11
  {
    name: "Pisces",
    timeLimit: 14,
    stars: [
      { x: 0.3, y: 0.5 }, { x: 0.4, y: 0.3 }, { x: 0.5, y: 0.3 }, { x: 0.6, y: 0.5 }, { x: 0.5, y: 0.7 }, { x: 0.4, y: 0.7 }
    ]
  }  // 12
];

// --- Global State ---
let canvas, ctx;
let gameState = GAME_STATES.START;
let currentLevelIndex = 0;
let levelTimeRemaining = 0;
let lastTime = 0;
let keys = {};

// Game Objects
let ship = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  vx: 0,
  vy: 0,
  speed: 5,
  boostMulti: 1.5,
  brakeMulti: 0.5,
  angle: 0
};

let stars = []; // Current level stars
let nextStarIndex = 0; // Which star needs to be connected next

// --- UI Elements ---
const uiStart = document.getElementById('start-screen');
const uiFail = document.getElementById('fail-screen');
const uiWin = document.getElementById('win-screen');
const uiHud = document.getElementById('hud');
const elLevel = document.getElementById('level-display');
const elTimer = document.getElementById('timer-display');

// --- Initialization ---
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Enter') handleStateInput();

    // Debug cheat
    if (e.key === 'D' && e.shiftKey && gameState === GAME_STATES.PLAYING) {
      completeLevel();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  requestAnimationFrame(gameLoop);
}

function handleStateInput() {
  if (gameState === GAME_STATES.START) {
    startGame();
  } else if (gameState === GAME_STATES.FAIL) {
    resetGame();
  } else if (gameState === GAME_STATES.WIN) {
    resetGame();
  }
}

function resetGame() {
  currentLevelIndex = 0;
  startGame();
}

function startGame() {
  gameState = GAME_STATES.PLAYING;
  uiStart.classList.add('hidden');
  uiFail.classList.add('hidden');
  uiWin.classList.add('hidden');
  uiHud.classList.remove('hidden');

  startLevel(0);
}

function startLevel(index) {
  currentLevelIndex = index;
  const levelData = CONSTELLATIONS[index];

  levelTimeRemaining = levelData.timeLimit;
  nextStarIndex = 0;

  // Initialize stars scaled to canvas
  stars = levelData.stars.map(s => ({
    x: s.x * CANVAS_WIDTH,
    y: s.y * CANVAS_HEIGHT,
    connected: false
  }));

  // Reset ship position generally to center-ish or bottom
  ship.x = CANVAS_WIDTH / 2;
  ship.y = CANVAS_HEIGHT - 50;
  ship.vx = 0;
  ship.vy = 0;

  updateHud();
}

function completeLevel() {
  if (currentLevelIndex < CONSTELLATIONS.length - 1) {
    startLevel(currentLevelIndex + 1);
  } else {
    winGame();
  }
}

function failGame() {
  gameState = GAME_STATES.FAIL;
  uiFail.classList.remove('hidden');
  uiHud.classList.add('hidden');
}

function winGame() {
  gameState = GAME_STATES.WIN;
  uiWin.classList.remove('hidden');
  uiHud.classList.add('hidden');
}

// --- Game Loop ---
function gameLoop(timestamp) {
  let deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (gameState === GAME_STATES.PLAYING) {
    update(deltaTime);
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Timer
  levelTimeRemaining -= dt;
  if (levelTimeRemaining <= 0) {
    failGame();
    return;
  }

  // Ship Movement
  let speed = ship.speed;
  if (keys['Shift']) speed *= ship.boostMulti;
  if (keys['z'] || keys['Z']) speed *= ship.brakeMulti;

  let dx = 0;
  let dy = 0;

  if (keys['ArrowUp']) dy = -1;
  if (keys['ArrowDown']) dy = 1;
  if (keys['ArrowLeft']) dx = -1;
  if (keys['ArrowRight']) dx = 1;

  // Normalize diagonal
  if (dx !== 0 && dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
  }

  if (dx !== 0 || dy !== 0) {
    ship.angle = Math.atan2(dy, dx);
  }

  ship.x += dx * speed;
  ship.y += dy * speed;

  // Boundary checks
  ship.x = Math.max(0, Math.min(CANVAS_WIDTH, ship.x));
  ship.y = Math.max(0, Math.min(CANVAS_HEIGHT, ship.y));

  // Star Connection Logic
  checkConnections();

  updateHud();
}

function checkConnections() {
  if (nextStarIndex >= stars.length) {
    completeLevel();
    return;
  }

  const targetStar = stars[nextStarIndex];
  const dist = Math.hypot(ship.x - targetStar.x, ship.y - targetStar.y);

  if (dist < CONNECTION_DISTANCE) {
    targetStar.connected = true;
    nextStarIndex++;
    // Check if finished immediately
    if (nextStarIndex >= stars.length) {
      completeLevel();
    }
  }
}

function updateHud() {
  if (CONSTELLATIONS[currentLevelIndex]) {
    elLevel.innerText = `Level ${currentLevelIndex + 1}: ${CONSTELLATIONS[currentLevelIndex].name}`;
    elTimer.innerText = `TIME: ${Math.ceil(levelTimeRemaining)}`;

    // Timer warning color
    if (levelTimeRemaining <= 5) {
      elTimer.style.color = '#ff0000';
    } else {
      elTimer.style.color = '#00ffff';
    }
  }
}

// --- Rendering ---
function draw() {
  // Clear background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (gameState !== GAME_STATES.PLAYING) {
    // Draw some background dust/stars for ambiance even in menus?
    // Optional. For now plain background.
    return;
  }

  // Draw Constellation Lines (Unconnected)
  ctx.beginPath();
  ctx.strokeStyle = COLORS.lineUnconnected;
  ctx.setLineDash([5, 5]); // Dotted
  ctx.lineWidth = 2;
  // Draw full path guide
  if (stars.length > 1) {
    ctx.moveTo(stars[0].x, stars[0].y);
    for (let i = 1; i < stars.length; i++) {
      ctx.lineTo(stars[i].x, stars[i].y);
    }
  }
  ctx.stroke();

  // Draw Connected Lines
  ctx.beginPath();
  ctx.strokeStyle = COLORS.lineConnected;
  ctx.setLineDash([]); // Solid
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLORS.lineConnected;

  if (stars.length > 0) {
    // Draw up to the last connected star
    // We only draw lines between connected stars. 
    // If stars[0] is connected and stars[1] is connected, draw 0->1.
    // Logic: connection is sequential. So we draw 0 to `nextStarIndex-1`.
    // Wait, if stars are points, we want to draw line from S_i to S_i+1 IF S_i+1 is connected? 
    // Actually, if we touched star N, it becomes "connected".
    // The edge leading TO it should be lit.

    let lastConnectedIdx = nextStarIndex - 1;
    if (lastConnectedIdx >= 0) {
      ctx.moveTo(stars[0].x, stars[0].y);
      for (let i = 1; i <= lastConnectedIdx; i++) {
        ctx.lineTo(stars[i].x, stars[i].y);
      }
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Stars
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    ctx.beginPath();

    // Color based on connection or target
    if (s.connected) {
      ctx.fillStyle = COLORS.starConnected;
      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS.starConnected;
    } else if (i === nextStarIndex) {
      ctx.fillStyle = '#ffff00'; // Highlight next target
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffff00';
    } else {
      ctx.fillStyle = COLORS.starUnconnected;
      ctx.shadowBlur = 0;
    }

    // Draw star shape (simple circle for now, or asterisk)
    ctx.arc(s.x, s.y, STAR_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
  }

  // Draw Ship
  drawShip();
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  // Rotate to match movement direction. 
  // ship.angle is in radians, 0 is East.
  // Ship model points North (Up, -Y).
  // So if angle is 0 (East), we want to rotate 90 deg (PI/2) to point Right? 
  // No, standard context rotation:
  // angle 0 = Right.
  // Ship points Up ( -90deg relative to Right). 
  // So we need to rotate by ship.angle + PI/2.
  ctx.rotate(ship.angle + Math.PI / 2);

  ctx.fillStyle = COLORS.ship;
  ctx.beginPath();
  ctx.moveTo(0, -SHIP_SIZE);
  ctx.lineTo(SHIP_SIZE / 2, SHIP_SIZE);
  ctx.lineTo(-SHIP_SIZE / 2, SHIP_SIZE);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  if (keys['Shift']) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.moveTo(0, SHIP_SIZE);
    ctx.lineTo(5, SHIP_SIZE + 10);
    ctx.lineTo(-5, SHIP_SIZE + 10);
    ctx.fill();
  }

  ctx.restore();
}

// Start
init();
