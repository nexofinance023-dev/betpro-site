const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let balance = 1250;
let bets = [];
let liveOdds = [
  { id: 1, home: 1.85, draw: 3.40, away: 4.20, status: 'live' },
  { id: 2, home: 2.10, draw: 3.25, away: 3.60, status: 'upcoming' }
];

// API simples
app.get('/api/matches', (req, res) => {
  res.json([
    { id: 1, team1: 'Flamengo', team2: 'Palmeiras', time: '20:00', odds: liveOdds[0] },
    { id: 2, team1: 'Real Madrid', team2: 'Barcelona', time: '22:00', odds: liveOdds[1] }
  ]);
});

app.post('/api/bets', (req, res) => {
  const { stake } = req.body;
  balance -= stake;
  bets.push({ ...req.body, id: Date.now(), status: 'confirmed' });
  res.json({ success: true, balance });
});

app.get('/api/wallet', (req, res) => res.json({ balance: balance.toFixed(2) }));

io.on('connection', (socket) => {
  socket.emit('liveOdds', liveOdds);
  
  setInterval(() => {
    liveOdds[0].home = (liveOdds[0].home + (Math.random()-0.5)*0.05).toFixed(2);
    socket.emit('liveOdds', liveOdds);
  }, 2000);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend: http://localhost:${PORT}`));
