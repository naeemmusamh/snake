/* eslint-disable no-unused-vars */
'use strict';

// eslint-disable-next-line no-undef
const socket = io.connect('http://localhost:3000');

socket.on('init', initHandler);
socket.on('gameState', gameStateHandler);
socket.on('gameOver', gameOverHandler);
socket.on('gameCode', gameCodeHandler);
socket.on('unknownGame', unknownGameHandler);
socket.on('tooManyPlayers', tooManyPlayersHandler);

const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

const gameScreen = document.getElementById('game-screen');
const initialScreen = document.getElementById('initial-screen');
const newGameBtn = document.getElementById('new-game-button');
const joinGameBtn = document.getElementById('join-game-button');
const gameCodeInput = document.getElementById('game-code-input');
const gameCodeDisplay = document.getElementById('game-code-display');

newGameBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);
function newGame(event){
  event.preventDefault();
  
  socket.emit('newGame');
  init();
}
function joinGame(event){
  event.preventDefault();
  const code=gameCodeInput.value;
  socket.emit('joinGame',code);
  init();

}

// global variables
let canvas, ctx;
let playerNumber;
let gameActive=false;

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = '600';

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive=true;
}

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

  paintPlayer(state.players[0], size, SNAKE_COLOR);
  paintPlayer(state.players[1], size, 'red');
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
  playerNumber=payload; 
}

function gameStateHandler(gameState) {
  if(!gameActive){
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function gameOverHandler(gameState) {
  if(!gameActive){
    return;
  }
  gameState=JSON.parse(gameState);
  if(gameState.winner === playerNumber){
    alert('you win ');
  }else{
    alert('you lose');
  }
  gameActive=false;
}
function gameCodeHandler(gameCode){
  gameCodeDisplay.innerHTML=gameCode;
}
function unknownGameHandler(){
  reset();
  alert('unknown game code');
}
function tooManyPlayersHandler(){
  reset();
  alert('game in progress');

}
function reset(){
  playerNumber=null;
  gameCodeInput.value='';
  gameCodeDisplay.innerText='';
}