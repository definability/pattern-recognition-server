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
 * Executor for the first task.
 *
 * The task is:
 * - Create a session on the server under `/first` path
 * - Send `Let's start` message to the server
 * - Receive a string `[width] [height] [N]` from the server,
 *   where `[width]` is a basic width (for horizontal scale `1`)
 *   of images of a digit in pixels,
 *   `[height]` is a basic height (for vertical scale `1`)
 *   and `[N]` is the total number of digits,
 * - Send settings to the server in the following format
 *   `[width] [height] [noise] [totalSteps]`,
 *   where `[width]` is a positive integer for the horizontal scale of digits,
 *   `[height]` is a positive integer for the vertical scale of digits,
 *   `[noise]` is a real number from `0` to `1` representing the noise level.
 *   `[totalSteps]` is a positive integer,
 *   representing the number of digits you want to recognize
 * - Receive an array of digit names and corresponding matrices in the form
 *   ```
 *   digit1
 *   matrix1
 *   digit2
 *   matrix2
 *   ...
 *   digitN
 *   matrixN
 *   ```
 *   and each matrix is a binary matrix of form
 *   ```
 *   d11 d12 ... d1n
 *   d21 d22 ... d2n
 *         ...
 *   dm1 dm2 ... dmn
 *   ```
 *   where `dij` is `0` or `1` value for `i`-th row and `j`-th column
 *   of the image, `n` its width (horizontal scale multiplied by basic width)
 *   and `m` is its height (vertical scale multiplied by basic height).
 * - Send the message `Ready` to start completing the task
 * - Receive a problem in the form
 *   ```
 *   [step]
 *   matrixj
 *   ```
 *   where `[step]` is the number of the problem,
 *   and `matrixj` is a binary matrix representing the problem
 * - Send the response in the form `[step] [solutionj]`,
 *   where `[step]` is the problem number and `[solutionj]`
 *   is your guess to the problem
 * - Receive a response in the form `[step] answerj`,
 *   where `answerj` is the right answer to the problem `[step]`.
 * - If there are more problems left to solve
 *   (`[step]` is less than `[totalSteps]`),
 *   send `Ready` again and receive a new problem.
 * - Otherwise, send `Bye`
 * - Receive `Finish with [successes] successes of [totalSteps]`,
 *   where `[successes]` is the number of success guesses.
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

  static IDEAL_NUMBERS_STRING = (
    Object.keys(WSExecutorFirst.IDEAL_NUMBERS).map((k) => `${k}\n${WSExecutorFirst.matrix2string(WSExecutorFirst.IDEAL_NUMBERS[k])}`).join('\n')
  );

  static BASIC_WIDTH = Object.values(WSExecutorFirst.IDEAL_NUMBERS)[0][0].length

  static BASIC_HEIGHT = Object.values(WSExecutorFirst.IDEAL_NUMBERS)[0].length

  static PATH = '/first/';

  static DEFAULT_TTL_SECONDS = 300;

  static DEFAULT_TTL = WSExecutorFirst.DEFAULT_TTL_SECONDS * 1E3;

  static MAX_TOTAL_STEPS = Math.round(1E6);

  static MAX_VERTICAL_SCALE = 100;

  static MAX_HORIZONTAL_SCALE = 100;

  static matrix2string(matrix) {
    return matrix.map((row) => row.join(' ')).join('\n');
  }

  constructor(data) {
    super(data);

    this.currentSolution = null;
    this.currentStep = 0;
    this.horizontalScale = null;
    this.noiseLevel = null;
    this.state = WSExecutorFirst.STATES.START;
    this.successes = 0;
    this.totalSteps = null;
    this.verticalScale = null;

    console.log('Executor First created');
  }

  onMessage(message) {
    console.log(`Executor says: '${message}'`);
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
        console.error(`Unknown state ${this.state}`);
        break;
    }
  }

  onStart(message) {
    if (message !== 'Let\'s start') {
      console.error('Wrong message');
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
    const messageSplit = message.split(' ').map(Number);
    if (
      messageSplit.length !== 4
      || !messageSplit.reduce((acc, e) => acc && e >= 0)
    ) {
      console.error('Wrong message');
      this.socket.close();
      return;
    }

    [
      this.horizontalScale,
      this.verticalScale,
      this.noiseLevel,
      this.totalSteps,
    ] = messageSplit;

    if (
      Math.round(this.horizontalScale) !== this.horizontalScale
      || this.horizontalScale > WSExecutorFirst.MAX_HORIZONTAL_SCALE
    ) {
      console.error('Wrong width');
      this.socket.close();
    }
    if (
      Math.round(this.verticalScale) !== this.verticalScale
      || this.verticalScale > WSExecutorFirst.MAX_VERTICAL_SCALE
    ) {
      console.error('Wrong height');
      this.socket.close();
    }
    if (
      Math.round(this.totalSteps) !== this.totalSteps
      || this.totalSteps > WSExecutorFirst.MAX_HORIZONTAL_SCALE
    ) {
      console.error('Wrong totalSteps number');
      this.socket.close();
    }
    if (this.noiseLevel < 0 || this.noiseLevel > 1) {
      console.error('Wrong noise level');
      this.socket.close();
    }
    this.state = WSExecutorFirst.STATES.READY;

    this.send(WSExecutorFirst.IDEAL_NUMBERS_STRING);
  }

  onReady(message) {
    if (message !== 'Ready') {
      console.error('Wrong message');
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
      WSExecutorFirst.IDEAL_NUMBERS[this.currentSolution],
    );

    this.send(`${this.currentStep}\n${WSExecutorFirst.matrix2string(matrix)}`);
  }

  onSolve(message) {
    const [step, answer] = message.split(' ');
    if (!Object.keys(WSExecutorFirst.IDEAL_NUMBERS).includes(answer)) {
      console.error('Provided answer cannot be right');
      this.socket.close();
      return;
    }
    if (Number(step) !== this.currentStep) {
      console.error('Wrong step number');
      this.socket.close();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.state = WSExecutorFirst.STATES.READY;
    } else if (this.currentStep === this.totalSteps) {
      this.state = WSExecutorFirst.STATES.FINISH;
    } else {
      console.error(`We have step ${this.currentStep} of ${this.totalSteps}!`);
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
      console.error('Wrong message');
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
