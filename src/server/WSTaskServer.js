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
const WebSocket = require('ws');
const WSObserver = require('./WSObserver');

const MAX_PAYLOAD_KB = 1;
const MAX_PAYLOAD = Math.round(MAX_PAYLOAD_KB * (2 ** 10));

const DEFAULT_MAX_CLIENTS = 100;

/**
 * Base task server.
 * Initialize websocket server with validation of connected clients.
 * Create tasks execution sessions to watch by observers.
 */
class WSTaskServer {
  constructor({
    ExecutorFactory,
    maxPayload = MAX_PAYLOAD,
    server,
    socketPool,
    taskPath,
  }) {
    this.ExecutorFactory = ExecutorFactory;
    this.socketPool = socketPool;
    this.taskPath = taskPath;

    this.sessions = new Map();

    this.server = new WebSocket.Server({
      maxPayload,
      server,
      verifyClient: (info) => this.verifyClient(info),
    });

    this.registerListeners(this.server);
  }

  /**
   * Socket pool should not be full
   * and the client's url should match the task path.
   * Also, it should have session identifier
   * after the task path.
   */
  verifyClient(info) {
    const url = info.req.url;
    return !this.socketPool.full()
      && typeof url === 'string'
      && typeof this.ExecutorFactory(url) === 'function';
  }

  /**
   * Register error and new client connection events listeners.
   */
  registerListeners(server) {
    server.on('error', (error) => this.onError(error));
    server.on('close', () => this.onClose(error));
    server.on(
      'connection',
      (socket, request) => this.onConnection(socket, request),
    );
  }

  /**
   * Try not to fail, just print the error.
   */
  onError(error) {
    console.error(error);
  }

  onClose() {
    console.log('Close the server');
  }

  /**
   * When new connection is connected,
   * first check whether the socket pool is not full.
   * If it is, close the connection.
   *
   * Check whether the client is connected to existent session
   * or try to create the new one.
   */
  onConnection(socket, request) {
    if (this.socketPool.full()) {
      socket.close();
      return;
    }
    this.socketPool.add(socket);
    const Executor = this.ExecutorFactory(request.url);
    if (typeof Executor !== 'function') {
      throw new Error("Executor is not a function");
    }
    const sessionId = request.url.substr(Executor.PATH.length);
    try {
      this.addClient({
        path: request.url,
        sessionId,
        socket,
      });
    } catch (error) {
      console.error(
        `Cannot connect a client to session ${sessionId}. ${error}`,
      );
      this.socketPool.remove(socket);
      socket.close();
    }
  }

  /*
   * If the session is new,
   * the client is an executor.
   * Otherwise, it's an observer and cannot interact with the server
   * but listen to messages.
   */
  addClient({
    path,
    sessionId,
    socket,
  }) {
    const Executor = this.ExecutorFactory(path);
    if (typeof Executor !== 'function') {
      throw new Error(`Executor for ${path} is not found`);
      return;
    }
    const clientData = {
      connectionDate: new Date(),
      socket,
      ttl: Executor.DEFAULT_TTL,
    };

    if (this.sessions.has(sessionId)) {
      const observer = new WSObserver({
        ...clientData,
      });
      observer.afterClose = () => {
        this.removeObserver(sessionId, observer);
      };
      this.sessions.get(sessionId).add(observer);
      this.broadcastObservers(sessionId, 'Server: New observer connected');
      console.log(`Connect to ${sessionId} session`);
    } else {
      const executor = new Executor({
        ...clientData,
        afterMessage: (message) => {
          this.broadcastObservers(sessionId, `Executor: ${message}`);
        },
        afterClose: () => {
          this.closeSession(sessionId);
        },
        send: (message) => {
          socket.send(message);
          this.broadcastObservers(sessionId, `Server: ${message}`);
        },
      });
      this.sessions.set(
        sessionId,
        new Set([executor]),
      );
      console.log(`Open new session ${sessionId}`);
    }
  }

  broadcastObservers(sessionId, message) {
    this.sessions.get(sessionId).forEach((client) => {
      if (client instanceof WSObserver) {
        client.send(`Executor: ${message}`);
      }
    });
  }

  removeObserver(sessionId, client) {
    if (this.sessions.has(sessionId)) {
      this.sessions.get(sessionId).delete(client);
      this.socketPool.remove(client.socket);
    }
  }

  closeSession(sessionId) {
    this.sessions.get(sessionId).forEach((client) => {
      client.close();
      this.socketPool.remove(client.socket);
    });
    this.sessions.get(sessionId).clear();
    this.sessions.delete(sessionId);
    console.log(`Close the session ${sessionId}`);
  }
}

module.exports = WSTaskServer;
