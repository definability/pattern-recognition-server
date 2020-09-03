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

  static VALIDATION_SCHEMAS = {
    [WSExecutorFirst.STATES.START]: ajv.compile({
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
    [WSExecutorFirst.STATES.SETUP]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['width', 'height', 'totalSteps', 'noise', 'shuffle'],
      properties: {
        width: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorFirst.MAX_HORIZONTAL_SCALE,
        },
        height: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorFirst.MAX_VERTICAL_SCALE,
        },
        totalSteps: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorFirst.MAX_TOTAL_STEPS,
        },
        noise: {
          type: 'number',
          minimum: 0,
          maximum: 1,
        },
        shuffle: {
          type: 'boolean',
        },
      },
    }),
    [WSExecutorFirst.STATES.READY]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          const: 'Ready',
        },
      },
    }),
    [WSExecutorFirst.STATES.SOLVE]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['step', 'answer'],
      properties: {
        step: {
          type: 'integer',
          minimum: 1,
        },
        answer: {
          enum: Object.keys(WSExecutorFirst.IDEAL_NUMBERS),
        },
      },
    }),
    [WSExecutorFirst.STATES.FINISH]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          const: 'Bye',
        },
      },
    }),
  };

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

  /**
   * Apply Bernoulli noise to the value and return the new one.
   */
  static applyElementNoise(value, noiseLevel) {
    /* eslint-disable-next-line no-bitwise */
    return value ^ (Math.random() < noiseLevel);
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
        this.onStart();
        break;
      case WSExecutorFirst.STATES.SETUP:
        this.onSetup(message);
        break;
      case WSExecutorFirst.STATES.READY:
        this.onReady();
        break;
      case WSExecutorFirst.STATES.SOLVE:
        this.onSolve(message);
        break;
      case WSExecutorFirst.STATES.FINISH:
        this.onFinish();
        break;
      default:
        this.logger.alert(`Unknown state ${this.state}`);
        this.socket.close();
        break;
    }
  }

  onStart() {
    this.state = WSExecutorFirst.STATES.SETUP;

    this.sendMessage({
      width: WSExecutorFirst.BASIC_WIDTH,
      height: WSExecutorFirst.BASIC_HEIGHT,
      number: Object.keys(WSExecutorFirst.IDEAL_NUMBERS).length,
    });
  }

  onSetup({
    height,
    width,
    noise,
    totalSteps,
    shuffle,
  }) {
    if (shuffle) {
      const names = WSExecutorFirst.shuffle(Object.keys(WSExecutorFirst.IDEAL_NUMBERS));
      Object.keys(WSExecutorFirst.IDEAL_NUMBERS).forEach((key) => {
        this.remapping[key] = names.pop();
      });
    } else {
      Object.keys(WSExecutorFirst.IDEAL_NUMBERS).forEach((key) => {
        this.remapping[key] = key;
      });
    }

    [
      this.horizontalScale,
      this.verticalScale,
      this.noiseLevel,
      this.totalSteps,
    ] = [height, width, noise, totalSteps];

    this.state = WSExecutorFirst.STATES.READY;

    const idealNumbers = {};
    Object.keys(WSExecutorFirst.IDEAL_NUMBERS).forEach((key) => {
      idealNumbers[key] = this.generateMatrix(
        WSExecutorFirst.IDEAL_NUMBERS[this.remapping[key]],
        0,
      );
    });

    this.sendMessage(idealNumbers);
  }

  onReady() {
    this.state = WSExecutorFirst.STATES.SOLVE;

    this.currentStep += 1;
    this.currentSolution = Object.keys(WSExecutorFirst.IDEAL_NUMBERS)[
      Math.floor(
        Math.random() * Object.keys(WSExecutorFirst.IDEAL_NUMBERS).length,
      )
    ];
    const matrix = this.generateMatrix(
      WSExecutorFirst.IDEAL_NUMBERS[this.remapping[this.currentSolution]],
      this.noiseLevel,
    );

    this.sendMessage({
      currentStep: this.currentStep,
      matrix,
    });
  }

  onSolve({ step, answer }) {
    if (step !== this.currentStep) {
      this.sendErrors({
        title: 'Wrong step number',
        detail: `The current step is ${this.currentStep}`,
      });
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

    this.sendMessage({
      step: this.currentStep,
      solution: this.currentSolution,
    });
  }

  onFinish() {
    this.sendMessage({
      message: `Finish with ${this.successes} successes of ${this.totalSteps}`,
    });
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
  generateMatrix(idealDigit, noiseLevel) {
    const matrix = [];

    idealDigit.forEach((row, i) => {
      for (let h = 0; h < this.verticalScale; h += 1) {
        matrix.push([]);
        for (let j = 0; j < row.length; j += 1) {
          for (let w = 0; w < this.horizontalScale; w += 1) {
            matrix[i * this.verticalScale + h].push(
              WSExecutorFirst.applyElementNoise(idealDigit[i][j], noiseLevel),
            );
          }
        }
      }
    });

    return matrix;
  }

  get schema() {
    return WSExecutorFirst.VALIDATION_SCHEMAS[this.state];
  }
}

module.exports = WSExecutorFirst;
