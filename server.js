'use strict';

const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://127.0.0.1:5501',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

const { createGameState, gameLoop, getUpdatedVelocity } = require('./src/game');
const { FRAME_RATE } = require('./src/constants');

io.on('connection', (client) => {
  const state = createGameState();

  client.on('keydown', keydownHandler);

  // we are defining the function here to access
  // ... the client object, this is the easiest way right now
  function keydownHandler(keyCode) {
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (
      vel &&
      (state.player.vel.x !== (vel.x * -1) || state.player.vel.y !== (vel.y * -1))
    ) {
      state.player.vel = vel;
    }
  }

  startGameInterval(client, state);
});

function startGameInterval(client, state) {
  const intervalId = setInterval(() => {
    // every frame, check if the game has ended or not
    const winner = gameLoop(state);

    // !winner == game is not finished yet
    if (!winner) {
      client.emit('gameState', JSON.stringify(state));
    } else {
      client.emit('gameOver');
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

server.listen(PORT, () => {
  console.log(`::::: Up n running 🏃 on PORT ${PORT} :::::`);
});
