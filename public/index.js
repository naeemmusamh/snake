'use strict';

// eslint-disable-next-line no-undef
const socket = io.connect('http://localhost:3000');

socket.on('init', initHandler);
socket.on('gameState', gameStateHandler);
socket.on('gameOver', gameOverHandler);

const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

const gameScreen = document.getElementById('game-screen');

// global variables
let canvas, ctx;

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = '600';

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
}
init();

// keydown INPUT
function keydown(e) {
  console.log(e.keyCode);
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.player, size, SNAKE_COLOR);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

// socket function
function initHandler(payload) {
  console.log(payload);
}

function gameStateHandler(gameState) {
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function gameOverHandler(gameState) {
  alert('you lose');
}
