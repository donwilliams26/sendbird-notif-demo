// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// IMPORTANT: use express.text() for raw body so signature validation works
app.use('/webhook', express.text({ type: 'json' }));
app.use(cors());

// Webhook endpoint with x-sendbird-signature validation
app.post('/webhook', (req, res) => {
  try {
    const signature = req.get('x-sendbird-signature');
    const body = req.body; // still raw string here
    const masterToken = process.env.SENDBIRD_MASTER_API_TOKEN; // use your Master API Token

    // HMAC-SHA256 hash
    const hash = crypto.createHmac('sha256', masterToken).update(body).digest('hex');

    if (signature !== hash) {
      console.warn('Invalid signature, rejecting webhook');
      return res.sendStatus(401);
    }

    // ✅ Signature verified → parse body to JSON
    const event = JSON.parse(body);
    console.log('Webhook received:', event);

    // Handle profanity events
    if (event.category === 'message' && event.type === 'profanity') {
      io.emit('profanity_detected', {
        sender: event.sender,
        message: event.message
      });
    }

    // Handle group channel creation
    if (event.category === 'channel' && event.type === 'group_channel:create') {
      const channelUrl = event.channel?.channel_url;
      console.log('New group channel created:', channelUrl);
      // (Optional) Add metadata or send admin message here
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error in webhook handler:', err);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('Your backend server is now running'));

io.on('connection', (socket) => {
  console.log('Frontend connected via Socket.IO');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
