// Server entry file, configures Express and Socket.IO
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve client static files

let players = [];
let scores = [0, 0]; // Scores for Player 1 and Player 2
let choices = [null, null]; // Choices for Player 1 and Player 2

io.on('connection', (socket) => {
  console.log('Player connected');

  // Handle player joining
  if (players.length < 2) {
    players.push(socket);
    socket.emit('playerId', players.length - 1);
    console.log(`Player ${players.length} joined`);

    if (players.length === 2) {
      io.emit('gameStart', { message: 'Game Start! Choose Rock, Paper, or Scissors.' });
    }
  } else {
    socket.emit('gameFull', { message: 'Game is full. Please try again later.' });
    socket.disconnect();
  }

  // Handle player choice
  socket.on('makeChoice', (choice) => {
    const playerId = players.indexOf(socket);
    if (playerId === -1) return;

    choices[playerId] = choice;
    console.log(`Player ${playerId + 1} chose ${choice}`);

    // Check if both players have made their choices
    if (choices[0] && choices[1]) {
      const result = determineWinner(choices[0], choices[1]);
      if (result === 0) {
        io.emit('roundResult', { message: 'It\'s a tie!', scores });
      } else if (result === 1) {
        scores[0]++;
        io.emit('roundResult', { message: 'Player 1 wins this round!', scores });
      } else {
        scores[1]++;
        io.emit('roundResult', { message: 'Player 2 wins this round!', scores });
      }

      // Reset choices for the next round
      choices = [null, null];
      io.emit('nextRound', { message: 'Next round! Choose again.' });
    }
  });

  // Handle surrender
  socket.on('surrender', () => {
    const playerId = players.indexOf(socket);
    if (playerId === -1) return;

    const winnerId = playerId === 0 ? 1 : 0;
    io.emit('gameEnd', { message: `Player ${playerId + 1} surrendered! Player ${winnerId + 1} wins!`, scores });
    resetGame();
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected');
    const playerId = players.indexOf(socket);
    if (playerId !== -1) {
      players.splice(playerId, 1);
      io.emit('gameEnd', { message: 'A player disconnected. Game over.', scores });
      resetGame();
    }
  });
});

// Determine the winner of a round
function determineWinner(choice1, choice2) {
  if (choice1 === choice2) return 0; // Tie
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) return 1; // Player 1 wins
  return 2; // Player 2 wins
}

// Reset the game state
function resetGame() {
  players = [];
  scores = [0, 0];
  choices = [null, null];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});