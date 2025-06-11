// server.js
const express = require('express');
const WebSocket = require('ws');
const app = express();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('🟢 Serveur WebSocket lancé !');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', socket => {
  console.log('🆕 Nouvelle connexion !');

  socket.on('message', msg => {
    console.log('📩 Reçu :', msg);
    // Renvoi à tous les autres
    wss.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  socket.on('close', () => {
    console.log('🔌 Déconnexion');
  });
});
