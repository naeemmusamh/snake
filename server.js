'use strict';

require('dotenv').config();
const app = require('express')();
const server = require('http').createServer(app);

const ORIGIN = process.env.ORIGIN || 'https://snake-warz.herokuapp.com/';

const io = require('socket.io')(server, {
  cors: {
    origin: ORIGIN, // 'https://ourapp-snake.io.heroku.com/'
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

const { gameLoop, getUpdatedVelocity, initGame } = require('./src/game');
const { makeId } = require('./src/utils');
const { FRAME_RATE } = require('./src/constants');
// const { emit } = require('process');

const state = {};
const clientRooms = {};
io.on('connection', (client) => {
  console.log('CLIENT ID ::::::', client.id);
  client.on('keydown', keydownHandler);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(gameCode) {
    const room = io.sockets.adapter.rooms.get(gameCode);
    let allUsers;
    if (room) {
      allUsers = room.size; // room.sockets
    }

    let numClients = allUsers; // let numClients = 0; 
    // if (allUsers) {
    //   numClients = Object.keys(allUsers).length;
    // }

    if (numClients === 0) {
      client.emit('unknownGame');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = gameCode;
    client.join(gameCode);
    client.number = 2;
    client.emit('init', 2);

    startGameInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);
    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  // we are defining the function here to access
  // ... the client object, this is the easiest way right now
  function keydownHandler(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    // every frame, check if the game has ended or not
    const winner = gameLoop(state[roomName]);

    // !winner == game is not finished yet
    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}
function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}

server.listen(PORT, () => {
  console.log(`::::: Up n running 🏃 on PORT ${PORT} :::::`);
});
