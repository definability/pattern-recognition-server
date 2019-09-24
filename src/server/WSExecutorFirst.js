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
 * Executor for the first task.
 */
class WSExecutorFirst extends WSExecutor {
  static STATES = {
    START: 'START',
    SETUP: 'SETUP',
    READY: 'READY',
    SOLVE: 'SOLVE',
    FINISH: 'FINISH',
  };

  /**
   * Binary matrices of size 5x3 (5 rows, 3 columns),
   * representing digits from `0` to `9`.
   */
  static IDEAL_NUMBERS = {
    0: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    2: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    3: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    4: [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    5: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    6: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    7: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 0, 0],
    ],
    8: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    9: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
  };

  static BASIC_WIDTH = Object.values(WSExecutorFirst.IDEAL_NUMBERS)[0][0].length

  static BASIC_HEIGHT = Object.values(WSExecutorFirst.IDEAL_NUMBERS)[0].length

  static PATH = '/first/';

  static DEFAULT_TTL_SECONDS = 300;

  static DEFAULT_TTL = WSExecutorFirst.DEFAULT_TTL_SECONDS * 1E3;

  static MAX_TOTAL_STEPS = Math.round(1E6);

  static MAX_VERTICAL_SCALE = 100;

  static MAX_HORIZONTAL_SCALE = 100;

  static matrix2string({
    horizontalScale = 1,
    matrix,
    verticalScale = 1,
  }) {
    return matrix
      .map((row) => row
        .map((cell) => Array.from({ length: horizontalScale }).map(() => cell)).flat()
        .join(' '))
      .map((row) => Array.from({ length: verticalScale }).map(() => row)).flat()
      .join('\n');
  }

  /**
   * Fisher–Yates shuffle.
   */
  static shuffle(array) {
    const result = [...array];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  constructor(data) {
    super({
      ...data,
      logger: Logger('Task 1'),
    });

    this.currentSolution = null;
    this.currentStep = 0;
    this.horizontalScale = null;
    this.noiseLevel = null;
    this.state = WSExecutorFirst.STATES.START;
    this.successes = 0;
    this.totalSteps = null;
    this.verticalScale = null;
    this.remapping = {};

    this.logger.info('Executor First created');
  }

  onMessage(message) {
    switch (this.state) {
      case WSExecutorFirst.STATES.START:
        this.onStart(message);
        break;
      case WSExecutorFirst.STATES.SETUP:
        this.onSetup(message);
        break;
      case WSExecutorFirst.STATES.READY:
        this.onReady(message);
        break;
      case WSExecutorFirst.STATES.SOLVE:
        this.onSolve(message);
        break;
      case WSExecutorFirst.STATES.FINISH:
        this.onFinish(message);
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
    this.state = WSExecutorFirst.STATES.SETUP;

    const width = WSExecutorFirst.BASIC_WIDTH;
    const height = WSExecutorFirst.BASIC_HEIGHT;
    const number = Object.keys(WSExecutorFirst.IDEAL_NUMBERS).length;

    this.send(`${width} ${height} ${number}`);
  }

  onSetup(message) {
    const messageSplit = message.split(' ');
    if (!/^[\da-zA-Z\-\. ]+$/.test(message)) {
      const wrongLetters = [...new Set(message.match(/[^\da-zA-Z\-\. ]/g))];
      this.send(
        'Your message contains not allowed symbols: '
        + wrongLetters.join(' ')
        + `. Check whether you message "${message}" meets the needs.`
      );
      this.socket.close();
      return;
    }
    if (
      messageSplit.length !== 5
    ) {
      this.send('Wrong setup. '
                + 'You should send 5 parameters separated by space.');
      this.socket.close();
      return;
    }
    if (!messageSplit.slice(0, 4).map(Number).reduce((acc, e) => acc && e >= 0)) {
      this.send('Wrong setup. '
                + 'The first four parameters should be nonnegative numbers.');
      this.socket.close();
      return;
    }

    [
      this.horizontalScale,
      this.verticalScale,
      this.noiseLevel,
      this.totalSteps,
    ] = messageSplit.slice(0, 4).map(Number);

    if (!['on', 'off'].includes(messageSplit[4].toLowerCase())) {
      this.send('The fifth parameter (shuffle) should be either "on" or "off".');
      this.socket.close();
      return;
    }
    if (
      Math.round(this.horizontalScale) !== this.horizontalScale
      || this.horizontalScale > WSExecutorFirst.MAX_HORIZONTAL_SCALE
    ) {
      this.send('Wrong width');
      this.socket.close();
      return;
    }
    if (
      Math.round(this.verticalScale) !== this.verticalScale
      || this.verticalScale > WSExecutorFirst.MAX_VERTICAL_SCALE
    ) {
      this.send('Wrong height');
      this.socket.close();
      return;
    }
    if (
      Math.round(this.totalSteps) !== this.totalSteps
      || this.totalSteps > WSExecutorFirst.MAX_HORIZONTAL_SCALE
    ) {
      this.send('Wrong number of steps');
      this.socket.close();
      return;
    }
    if (this.noiseLevel < 0 || this.noiseLevel > 1) {
      this.send('Wrong noise level');
      this.socket.close();
      return;
    }

    if (messageSplit[4].toLowerCase() === 'on') {
      const names = WSExecutorFirst.shuffle(Object.keys(WSExecutorFirst.IDEAL_NUMBERS));
      Object.keys(WSExecutorFirst.IDEAL_NUMBERS).forEach((key) => {
        this.remapping[key] = names.pop();
      });
    } else {
      Object.keys(WSExecutorFirst.IDEAL_NUMBERS).forEach((key) => {
        this.remapping[key] = key;
      });
    }

    this.state = WSExecutorFirst.STATES.READY;

    const idealNumbersString = (
      Object.keys(WSExecutorFirst.IDEAL_NUMBERS)
        .map((k) => `${k}\n${WSExecutorFirst.matrix2string({
          horizontalScale: this.horizontalScale,
          matrix: WSExecutorFirst.IDEAL_NUMBERS[this.remapping[k]],
          verticalScale: this.verticalScale,
        })}`)
        .join('\n')
    );

    this.send(idealNumbersString);
  }

  onReady(message) {
    if (message !== 'Ready') {
      this.send('Wrong message. You should say "Ready"! Try again.');
      this.socket.close();
      return;
    }
    this.state = WSExecutorFirst.STATES.SOLVE;

    this.currentStep += 1;
    this.currentSolution = Object.keys(WSExecutorFirst.IDEAL_NUMBERS)[
      Math.floor(
        Math.random() * Object.keys(WSExecutorFirst.IDEAL_NUMBERS).length,
      )
    ];
    const matrix = this.generateMatrix(
      WSExecutorFirst.IDEAL_NUMBERS[this.remapping[this.currentSolution]],
    );

    this.send(`${this.currentStep}\n${WSExecutorFirst.matrix2string({ matrix })}`);
  }

  onSolve(message) {
    const [step, answer] = message.split(' ');
    if (!Object.keys(WSExecutorFirst.IDEAL_NUMBERS).includes(answer)) {
      this.send('Provided answer cannot be right');
      this.socket.close();
      return;
    }
    if (Number(step) !== this.currentStep) {
      this.send(`Wrong step number. The current step is ${this.currentStep}.`);
      this.socket.close();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.state = WSExecutorFirst.STATES.READY;
    } else if (this.currentStep === this.totalSteps) {
      this.state = WSExecutorFirst.STATES.FINISH;
    } else {
      this.logger.alert(`We have step ${this.currentStep} of ${this.totalSteps}!`);
      this.socket.close();
      return;
    }

    if (this.currentSolution === answer) {
      this.successes += 1;
    }

    this.send(`${this.currentStep} ${this.currentSolution}`);
  }

  onFinish(message) {
    if (message !== 'Bye') {
      this.send('You should have said "Bye"');
      this.socket.close();
      return;
    }
    this.send(
      `Finish with ${this.successes} successes of ${this.totalSteps}`,
    );
  }

  /**
   * Generate new matrix.
   * First, one of the First.IDEAL_NUMBERS elements is chosen
   * as the initial value.
   * First.state.width is used to duplicate columns of the reference.
   * First.state.height is used to duplicate rows of the reference.
   * Then, we add a noise to the matrix
   * by xoring each element with random values generated by Bernoulli law.
   */
  generateMatrix(idealDigit) {
    const matrix = [];

    idealDigit.forEach((row, i) => {
      for (let h = 0; h < this.verticalScale; h += 1) {
        matrix.push([]);
        for (let j = 0; j < row.length; j += 1) {
          for (let w = 0; w < this.horizontalScale; w += 1) {
            matrix[i * this.verticalScale + h].push(
              this.applyElementNoise(idealDigit[i][j]),
            );
          }
        }
      }
    });

    return matrix;
  }

  /**
   * Apply Bernoulli noise to the value and return the new one.
   */
  applyElementNoise(value) {
    /* eslint-disable-next-line no-bitwise */
    return value ^ (Math.random() < this.noiseLevel);
  }
}

module.exports = WSExecutorFirst;
