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
const Logger = require('./Logger');
const WSExecutor = require('./WSExecutor');

/**
 * Executor for the zeroth task.
 *
 * The task is:
 * - Create a session on the server under `/zeroth` path
 * - Send `Let's start` message to the server
 * - Receive and parse a string from the server.
 *   The format is: `[number] [operator] [number]`,
 *   where `[number]` is an integer from `1` to `100`
 *   and `[operator]` is one of `+`, `-` and `*`.
 * - Send the solution to the problem (an integer).
 */
class WSExecutorZeroth extends WSExecutor {
  static STATES = {
    START: 'START',
    SOLVE: 'SOLVE',
  };

  static OPERATORS = {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
  }

  static PATH = '/zeroth/';

  static DEFAULT_TTL_SECONDS = 60;

  static DEFAULT_TTL = WSExecutorZeroth.DEFAULT_TTL_SECONDS * 1E3;

  constructor(data) {
    super({
      ...data,
      logger: Logger('Task 0'),
    });

    this.state = WSExecutorZeroth.STATES.START;
    this.expression = null;
    this.logger.info('Zeroth executor created');
  }

  onMessage(message) {
    switch (this.state) {
      case WSExecutorZeroth.STATES.START:
        this.onStart(message);
        break;
      case WSExecutorZeroth.STATES.SOLVE:
        this.onSolve(message);
        break;
      default:
        this.logger.alert(`Unknown state ${this.state}`);
        this.socket.close();
        break;
    }
  }

  onStart(message) {
    if (message !== 'Let\'s start') {
      this.send('Wrong initial message');
      this.socket.close();
      return;
    }
    this.expression = [
      Math.round(Math.random() * 99 + 1),
      Object.keys(WSExecutorZeroth.OPERATORS)[
        Math.floor(Math.random()
        * (Object.keys(WSExecutorZeroth.OPERATORS).length))
      ],
      Math.round(Math.random() * 99 + 1),
    ];
    this.state = WSExecutorZeroth.STATES.SOLVE;
    this.send(`Solve ${this.expression.join(' ')}`);
  }

  onSolve(message) {
    const solution = WSExecutorZeroth.OPERATORS[this.expression[1]](
      this.expression[0],
      this.expression[2],
    );
    if (Number(message) !== solution) {
      this.send(`Wrong answer. The right one is ${solution}.`);
      this.socket.close();
      return;
    }
    this.send('Correct!');
  }
}

module.exports = WSExecutorZeroth;
