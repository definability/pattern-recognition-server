/**
 * MIT License
 *
 * Copyright (c) 2019-2020 char-lie
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
const Ajv = require('ajv');

const Logger = require('./Logger');
const WSExecutor = require('./WSExecutor');

const ajv = new Ajv({ allErrors: true });

/**
 * Executor for the zeroth task.
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

  static VALIDATION_SCHEMAS = {
    [WSExecutorZeroth.STATES.START]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          const: 'Let\'s start',
        },
      },
    }),
    [WSExecutorZeroth.STATES.SOLVE]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['answer'],
      properties: {
        answer: {
          type: 'integer',
        },
      },
    }),
  };

  constructor(data) {
    super({
      ...data,
      logger: Logger('Task 0'),
    });

    this.state = WSExecutorZeroth.STATES.START;
    this.operands = null;
    this.operator = null;
    this.logger.info('Zeroth executor created');
  }

  onMessage(message) {
    switch (this.state) {
      case WSExecutorZeroth.STATES.START:
        this.onStart();
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

  onStart() {
    this.operands = [
      Math.round(Math.random() * 99 + 1),
      Math.round(Math.random() * 99 + 1),
    ];
    this.operator = Object.keys(WSExecutorZeroth.OPERATORS)[
      Math.floor(Math.random()
      * (Object.keys(WSExecutorZeroth.OPERATORS).length))
    ];
    this.state = WSExecutorZeroth.STATES.SOLVE;
    this.sendMessage({
      operands: this.operands,
      operator: this.operator,
    });
  }

  onSolve({ answer }) {
    const solution = WSExecutorZeroth.OPERATORS[this.operator](...this.operands);
    if (answer !== solution) {
      this.sendErrors({
        title: 'Wrong answer',
        detail: `The right answer is ${solution}.`,
      });
      return;
    }
    this.sendMessage({
      answer: 'Correct!',
    });
  }

  get schema() {
    return WSExecutorZeroth.VALIDATION_SCHEMAS[this.state];
  }
}

module.exports = WSExecutorZeroth;
