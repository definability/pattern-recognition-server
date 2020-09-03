/**
 * MIT License
 *
 * Copyright (c) 2019-2020 char-lie
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
const WSClientListener = require('./WSClientListener');

/**
 * This client is able to send commands
 * to interact with task server.
 */
class WSExecutor extends WSClientListener {
  constructor({
    send = () => {},
    ...data
  }) {
    super(data);
    this.send = send;
  }

  sendMessage(message, ...args) {
    const payload = {
      data: { ...message },
      success: true,
    };
    return this.send(JSON.stringify(payload), ...args);
  }

  sendErrors(errors, ...args) {
    const payload = {
      errors: Array.isArray(errors) ? errors : [errors],
      success: false,
    };
    return this.send(JSON.stringify(payload), ...args);
  }

  /**
   * JSON error response generator
   * for the case of validation error.
   */
  sendValidationError(e) {
    this.sendErrors({
      title: 'The message is invalid',
      detail: e,
    });
    this.socket.close();
  }
}

module.exports = WSExecutor;
