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

/**
 * The base entity to serve connected clients.
 * Automatically disconnects client after specified ttl
 * and adds listeners.
 */
class WSClientListener {
  constructor({
    afterClose = () => {},
    beforeMessage = () => {},
    connectionDate,
    logger,
    socket,
    ttl = DEFAULT_WS_TTL_MILLISECONDS,
  }) {
    this.afterClose = afterClose;
    this.beforeMessage = beforeMessage;
    this.connectionDate = connectionDate;
    this.logger = logger;
    this.socket = socket;
    this.ttl = ttl;
    this.ttlTimeout = setTimeout(
      () => {
        socket.close();
      },
      this.ttl,
    );

    this._registerListeners(this.socket);
  }

  onError() {
  }

  onMessage() {
  }

  onClose() {
  }

  close() {
    this.socket.close();
  }

  _registerListeners(socket) {
    socket.on('error', (error) => this._onError(error));
    socket.on('close', () => this._onClose());
    socket.on('message', (message) => this._onMessage(message));
  }

  _onError(error) {
    this.logger.warning(`An error occurred: ${error}`);
    clearTimeout(this.ttlTimeout);
    this.onError(error);
    this.afterClose();
  }

  _onMessage(message) {
    this.logger.debug(`Receive message ${message}`);
    this.beforeMessage(message);
    this.onMessage(message);
  }

  _onClose() {
    clearTimeout(this.ttlTimeout);
    this.onClose();
    this.logger.info('Close socket');
    this.afterClose();
  }
}

module.exports = WSClientListener;
