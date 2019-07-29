const express = require('express');
const path = require('path');
const SocketServer = require('ws').Server;

const PORT = process.env.PORT || 3000;

const STATIC_PATH = path.join(__dirname, '..', '..', 'dist');
const INDEX_FILE = path.join(STATIC_PATH, 'index.html');

const server = express()
  .use(express.static(STATIC_PATH))
  .use((req, res) => res.sendFile(INDEX_FILE))
  .listen(PORT, () => {
    console.log(`Pattern recognition server is listening on port ${PORT}`);
  });
