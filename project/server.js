const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Persistent message storage
let messages = [];
const MESSAGES_FILE = 'messages.json';
if (fs.existsSync(MESSAGES_FILE)) {
  messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
}

io.on('connection', (socket) => {
  console.log('A user connected.');

  // Send chat history
  socket.emit('chat-history', messages);

  // Chat functionality
  socket.on('send-message', (message) => {
    messages.push(message);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages));
    io.emit('chat-message', message);
  });

  // Video sync functionality
  socket.on('video-event', (event) => {
    socket.broadcast.emit('video-event', event); // Broadcast video events to other users
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
