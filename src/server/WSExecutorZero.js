/**
 * MIT License
 *
 * Copyright (c) 2019 char-lie
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const WSExecutor = require('./WSExecutor');

/**
 * This client is able to send commands
 * to interact with the server.
 */
class WSExecutorZero extends WSExecutor {
  static STATES = {
    START: 'START',
    SOLVE: 'SOLVE',
  };
  static OPERATORS = {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
  }
  static PATH = '/zero/';

  constructor(data) {
    super(data);
    this.state = WSExecutorZero.STATES.START;
    this.expression = null;
    console.log('Zero executor created');
  }

  onMessage(message) {
    console.log(`Executor says '${message}'`);
    switch (this.state) {
      case WSExecutorZero.STATES.START:
        if (message !== 'Let\'s start') {
          console.error('Wrong message');
          this.socket.close();
          return;
        }
        this.expression = [
          Math.round(Math.random() * 100 + 1),
          Object.keys(WSExecutorZero.OPERATORS)[
            Math.floor(Math.random()
            * (Object.keys(WSExecutorZero.OPERATORS).length - 1E-4))
          ],
          Math.round(Math.random() * 100 + 1),
        ];
        this.state = WSExecutorZero.STATES.SOLVE;
        this.send(`Solve ${this.expression.join(' ')}`);
        break;
      case WSExecutorZero.STATES.SOLVE:
        const solution = WSExecutorZero.OPERATORS[this.expression[1]](
          this.expression[0],
          this.expression[2],
        );
        if (Number(message) !==  solution) {
          console.error('Wrong answer');
          this.socket.close();
          return;
        }
        this.send('Correct!');
        break;
      default:
        console.error(`Unknown state ${this.state}`);
        break;
    }
  }
}

module.exports = WSExecutorZero;
