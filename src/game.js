/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
const { GRID_SIZE } = require('./constants');

function initGame(){
  const state = createGameState();
  randomFood(state);
  return state;
}

// gameState object
function createGameState() {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10
      },
      vel: {
        x: 1,
        y: 0
      },
      snake: [
        { x: 1, y: 10 },
        { x: 2, y: 10 },
        { x: 3, y: 10 }
      ]
    },{
      pos: {
        x: 18,
        y: 10
      },
      vel: {
        x: 0,
        y: 0
      },
      snake: [
        { x: 20, y: 10 },
        { x: 19, y: 10 },
        { x: 18, y: 10 }
      ]
    }],
    food: {},
    gridSize: GRID_SIZE
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];



  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // out of bounds check
  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x >= GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y >= GRID_SIZE
  ) {
    return 2; // playerTwo wins if playerOne loses
  }
  /// handel player two
  if (
    playerTwo.pos.x < 0 ||
    playerTwo.pos.x >= GRID_SIZE ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.y >= GRID_SIZE
  ) {
    return 1; // playerone wins if playertwo loses
  }

  // eat food check
  // check if position of snake's head is similar to food
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    // increase size of snake
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    // place new food
    randomFood(state);
  }
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    // increase size of snake
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    // place new food
    randomFood(state);
  }


  // moving the snake
  if (playerOne.vel.x || playerOne.vel.y) {
    // make sure it didn't bump into itself
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    // move snake
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }
// moving the snake
if (playerTwo.vel.x || playerTwo.vel.y) {
  // make sure it didn't bump into itself
  for (let cell of playerTwo.snake) {
    if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
      return 1;
    }
  }

  // move snake
  playerTwo.snake.push({ ...playerTwo.pos });
  playerTwo.snake.shift();
}
  // game continues, no winner
  return false;
}

function randomFood(state) {
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };

  // make sure food is not placed on top of a snake cell
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      // recursively call the same function
      return randomFood(state);
    }
  }
    // make sure food is not placed on top of a snake cell
    for (let cell of state.players[1].snake) {
      if (cell.x === food.x && cell.y === food.y) {
        // recursively call the same function
        return randomFood(state);
      }
    }

  state.food = food;
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: { // left
      return { x: -1, y: 0 };
    }
    case 38: { // up
      return { x: 0, y: -1 };
    }
    case 39: { // right
      return { x: 1, y: 0 };
    }
    case 40: { // down
      return { x: 0, y: 1 };
    }
  }
}


module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,

};
