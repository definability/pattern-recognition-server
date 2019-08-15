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

const MAX_PAYLOAD_KB = 1;
const MAX_PAYLOAD = Math.round(MAX_PAYLOAD_KB * (2 ** 10));

const DEFAULT_CLIENT_TTL_SECONDS = 60;
const DEFAULT_CLIENT_TTL = Math.round(DEFAULT_CLIENT_TTL_SECONDS * 1E3);

const DEFAULT_MAX_CLIENTS = 100;

/**
 * Base task server.
 * Initialize websocket server with validation of connected clients.
 * Create tasks execution sessions to watch by observers.
 */
class WSTaskServer {
  constructor({
    server,
    maxPayload = MAX_PAYLOAD,
    maxClients = DEFAULT_MAX_CLIENTS,
    clientTTL = DEFAULT_CLIENT_TTL,
    taskPath,
    socketPool,
    Observer,
    Executor,
  }) {
    this.Executor = Executor;
    this.maxClients = maxClients;
    this.Observer = Observer;
    this.socketPool = socketPool;
    this.taskPath = taskPath;
    this.clientTTL = clientTTL;

    this.sessions = new Map();

    this.server = new WebSocket.Server({
      maxPayload,
      server,
      verifyClient: () => this.verifyClient,
    });

    this.registerListeners(this.server);
  }

  /**
   * Socket pool should not be full
   * and the client's url should match the task path.
   * Also, it should have session identifier
   * after the task path.
   */
  verifyClient(client) {
    return !this.socketPool.full()
      && typeof client.url === 'string'
      && client.url.startsWith(this.taskPath)
      && client.url.length > this.taskPath;
  }

  /**
   * Register error and new client connection events listeners.
   */
  registerListeners(server) {
    server.on('error', error => this.onError(error));
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
    const sessionId = request.url.substr(this.taskPath.length);
    try {
      this.addClient({ socket, sessionId });
    } catch (error) {
      console.error(
        `Cannot connect a client to session ${sessionId}, because ${error}`,
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
    socket,
    sessionId,
  }) {
    const clientData = {
      connectionDate: new Date(),
      onClose: () => {
        this.sessions.delete(socket);
      },
      socket,
      ttl: this.clientTTL,
    };

    if (this.sessions.has(sessionId)) {
      this.sessions.get(sessionId).set(
        socket,
        new this.Observer(clientData),
      );
      console.log(`Connect to ${sessionId} session`);
    } else {
      this.sessions.set(
        sessionId,
        new Map([socket, new this.Executor(clientData)]),
      );
      console.log(`Open new session ${sessionId}`);
    }
  }
}

module.exports = WSTaskServer;
