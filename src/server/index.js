/**
 * MIT License
 *
 * Copyright (c) 2019 char-lie
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const express = require('express');
const path = require('path');
const WSTaskServer = require('./WSTaskServer');
const WebSocketPool = require('./WebSocketPool');
const WSExecutorZero = require('./WSExecutorZero');

const PORT = process.env.PORT || 3000;
const MAX_CONNECTED_CLIENTS = Number(process.env.MAX_CONNECTED_CLIENTS) || 1;

const STATIC_PATH = path.join(__dirname, '..', '..', 'dist');
const INDEX_FILE = path.join(STATIC_PATH, 'index.html');

const server = express()
  .use(express.static(STATIC_PATH))
  .use((req, res) => res.sendFile(INDEX_FILE))
  .listen(PORT, () => {
    console.log(`Pattern recognition server is listening on port ${PORT}`);
  });

const socketPool = new WebSocketPool(MAX_CONNECTED_CLIENTS);

/* eslint-disable-next-line no-unused-vars */
const wss = new WSTaskServer({
  server,
  socketPool,
  ExecutorFactory: (path) => {
    if (typeof path !== 'string') {
      return null;
    }
    const executors = [WSExecutorZero].filter((Executor) => (
      path.startsWith(Executor.PATH)
        && path.length > Executor.PATH.length
    ));
    if (!executors.length) {
      return null;
    }
    if (executors.length > 1) {
      throw new Error(`${executors.length} executors left.`);
    }
    return executors[0];
  },
});
