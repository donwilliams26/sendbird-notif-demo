const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // for testing, allow all origins
  },
});

const PORT = 3000;

app.use(bodyParser.json());

// Optional GET route
app.get('/', (req, res) => res.send('Webhook server is running!'));

// POST /webhook route (Sendbird sends events here)
app.post('/webhook', (req, res) => {
  const webhookEvent = req.body;
  console.log('Webhook received:', webhookEvent);

  // Example: check if the event is profanity
  if (webhookEvent.category?.startsWith('profanity_filter:')) {

    io.emit('profanity_detected', {
      sender: webhookEvent.sender,
      message: webhookEvent.payload?.message || 'Message flagged',
      category: webhookEvent.category
    });
  }

  res.sendStatus(200); // always respond 200 OK
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Frontend connected via Socket.IO');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
