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
const DEFAULT_WS_TTL_MILLISECONDS = 30 * 1E3;

class WSClientListener {
  constructor({
    connectionDate,
    socket,
    afterClose = () => {},
    ttl = DEFAULT_WS_TTL_MILLISECONDS,
  }) {
    this.connectionDate = connectionDate;
    this.socket = socket;
    this.afterClose = afterClose;
    this.ttl = ttl;
    this.ttlTimeout = setTimeout(() => {
      socket.close();
    }, this.ttl);

    this.registerListeners(this.socket);
  }

  registerListeners(socket) {
    socket.on('error', (error) => this.onError(error));
    socket.on('close', () => this.onClose());
    socket.on('message', (message) => this.onMessage(message));
  }

  onError(error) {
    console.error(error);
    clearTimeout(this.ttlTimeout);
    this.afterClose();
  }

  onMessage(message) {
    console.log(message);
  }

  onClose() {
    this.afterClose();
  }
}

/**
 * This client is able to send commands
 * to interact with the server.
 */
class WSClientListenerExecutor extends WSClientListener {
  onMessage(message) {
    console.log(`Executor says '${message}'`);
  }
}

/**
 * This client is able only to receive messages
 * as a passive observer.
 * Attempts to send a message end up with connection close.
 */
class WSClientListenerObserver extends WSClientListener {
  onMessage(message) {
    console.log(`Unexpected message from observer '${message}'`);
    clearTimeout(this.ttlTimeout);
    this.socket.close();
  }
}

module.exports = {
  WSClientListenerExecutor,
  WSClientListenerObserver,
};
