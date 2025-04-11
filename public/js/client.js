const socket = io();

socket.on('playerId', (id) => {
  document.getElementById('status').innerText = `You are Player ${id + 1}`;
});

socket.on('gameStart', ({ message }) => {
  document.getElementById('status').innerText = message;
  document.getElementById('choices').style.display = 'block';
  document.getElementById('surrender').style.display = 'block';
});

socket.on('gameFull', ({ message }) => {
  alert(message);
});

socket.on('roundResult', ({ message, scores }) => {
  document.getElementById('status').innerText = message;
  document.getElementById('scores').innerText = `Scores - Player 1: ${scores[0]} | Player 2: ${scores[1]}`;
});

socket.on('nextRound', ({ message }) => {
  document.getElementById('status').innerText = message;
});

socket.on('gameEnd', ({ message, scores }) => {
  alert(message);
  document.getElementById('status').innerText = 'Game Over. Waiting for new players...';
  document.getElementById('scores').innerText = `Scores - Player 1: ${scores[0]} | Player 2: ${scores[1]}`;
  document.getElementById('choices').style.display = 'none';
  document.getElementById('surrender').style.display = 'none';
});

function makeChoice(choice) {
  socket.emit('makeChoice', choice);
  document.getElementById('status').innerText = 'Waiting for the other player...';
  document.getElementById('choices').style.display = 'none';
}

function surrender() {
  socket.emit('surrender');
}