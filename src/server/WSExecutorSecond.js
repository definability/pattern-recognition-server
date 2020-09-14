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

const ajv = new Ajv({ allErrors: true, $data: true });

/**
 * Executor for the second task.
 */
class WSExecutorSecond extends WSExecutor {
  static STATES = {
    START: 'START',
    READY: 'READY',
    SOLVE: 'SOLVE',
    FINISH: 'FINISH',
  };

  static LOSS_FUNCTION(identifier) {
    if (identifier === WSExecutorSecond.L1_LOSS_NAME) {
      return (guess, answer) => Math.abs(guess - answer);
    }
    if (Number.isSafeInteger(Number(identifier))) {
      return (guess, answer) => Math.abs(guess - answer) > Number(identifier);
    }
    throw new Error(`Unknown loss function identifier ${identifier}`);
  }

  static PATH = '/second/';

  static DEFAULT_TTL_SECONDS = 300;

  static DEFAULT_TTL = WSExecutorSecond.DEFAULT_TTL_SECONDS * 1E3;

  static MAX_BARS_NUMBER = Math.round(1E3);

  static MAX_REPEATS = WSExecutorSecond.MAX_BARS_NUMBER;

  static MAX_TOTAL_STEPS = Math.round(1E6);

  static MAX_HISTOGRAM_VALUE = 255;

  static L1_LOSS_NAME = 'L1';

  static VALIDATION_SCHEMAS = {
    [WSExecutorSecond.STATES.START]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['width', 'loss', 'totalSteps', 'repeats'],
      properties: {
        width: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorSecond.MAX_BARS_NUMBER,
        },
        loss: {
          oneOf: [{
            type: 'integer',
            minimum: 0,
            maximum: {
              $data: '1/width',
            },
          }, {
            const: WSExecutorSecond.L1_LOSS_NAME,
          }],
        },
        totalSteps: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorSecond.MAX_TOTAL_STEPS,
        },
        repeats: {
          type: 'integer',
          minimum: 1,
          maximum: WSExecutorSecond.MAX_REPEATS,
        },
      },
    }),
    [WSExecutorSecond.STATES.READY]: ajv.compile({
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
    [WSExecutorSecond.STATES.SOLVE]: ajv.compile({
      type: 'object',
      additionalProperties: false,
      required: ['step', 'guesses'],
      properties: {
        step: {
          type: 'integer',
          minimum: 1,
        },
        guesses: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'integer',
          },
          additionalItems: {
            type: 'integer',
          },
        },
      },
    }),
    [WSExecutorSecond.STATES.FINISH]: ajv.compile({
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

  constructor(data) {
    super({
      ...data,
      logger: Logger('Task 2'),
    });

    this.barsNumber = null;
    this.currentHistorgram = null;
    this.currentStep = 0;
    this.loss = null;
    this.lossName = null;
    this.repeats = null;
    this.state = WSExecutorSecond.STATES.START;
    this.totalLoss = 0;
    this.totalSteps = null;

    this.logger.info('Executor Second created');
  }

  onMessage(message) {
    switch (this.state) {
      case WSExecutorSecond.STATES.START:
        this.onStart(message);
        break;
      case WSExecutorSecond.STATES.READY:
        this.onReady();
        break;
      case WSExecutorSecond.STATES.SOLVE:
        this.onSolve(message);
        break;
      case WSExecutorSecond.STATES.FINISH:
        this.onFinish();
        break;
      default:
        this.logger.alert(`Unknown state ${this.state}`);
        this.socket.close();
        break;
    }
  }

  onStart({
    width,
    loss,
    totalSteps,
    repeats,
  }) {
    [
      this.barsNumber,
      this.lossName,
      this.totalSteps,
      this.repeats,
    ] = [width, loss, totalSteps, repeats];

    this.loss = WSExecutorSecond.LOSS_FUNCTION(this.lossName);

    this.state = WSExecutorSecond.STATES.READY;

    this.sendMessage({
      message: 'Are you ready?',
    });
  }

  onReady() {
    this.state = WSExecutorSecond.STATES.SOLVE;

    this.currentStep += 1;
    this.currentHistorgram = this.generateHeatmap();

    this.sendMessage({
      step: this.currentStep,
      heatmap: this.currentHistorgram,
    });
  }

  onSolve({ step, guesses }) {
    if (guesses.length !== this.repeats) {
      this.sendErrors({
        title: 'Provided guess cannot be right',
        detail: `The number of guesses should be ${this.repeats}`,
      });
      this.socket.close();
      return;
    }
    if (!guesses.reduce((acc, e) => acc && this.isValidGuess(e), true)) {
      this.sendErrors({
        title: 'Provided guess cannot be right',
        detail: 'One or more guesses is less than 0 '
              + `or greater than ${this.currentHistorgram.length}`,
      });
      this.socket.close();
      return;
    }
    if (step !== this.currentStep) {
      this.sendErrors({
        title: 'Wrong step number',
        detail: `The current step is ${this.currentStep}`,
      });
      this.socket.close();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.state = WSExecutorSecond.STATES.READY;
    } else if (this.currentStep === this.totalSteps) {
      this.state = WSExecutorSecond.STATES.FINISH;
    } else {
      this.logger.alert(`We have step ${this.currentStep} of ${this.totalSteps}!`);
      this.socket.close();
      return;
    }

    const solutions = this.generateSolutions();
    this.totalLoss = guesses.reduce(
      (result, e, i) => result + this.loss(e, solutions[i]),
      this.totalLoss,
    );

    this.sendMessage({
      step: this.currentStep,
      loss: this.lossName,
      solutions,
      guesses,
      heatmap: this.currentHistorgram,
    });
  }

  onFinish() {
    this.sendMessage({
      loss: this.totalLoss,
    });
  }

  isValidGuess(guess) {
    return (
      Number.isSafeInteger(guess)
      && guess >= 0
      && guess < this.currentHistorgram.length
    );
  }

  /**
   * Generate new heatmap.
   */
  generateHeatmap() {
    const heatmap = [Math.random() * WSExecutorSecond.MAX_HISTOGRAM_VALUE];
    for (let i = 1; i < this.barsNumber; i += 1) {
      const value = (
        heatmap[i - 1]
        + ((Math.random() - 0.5) * 2 * WSExecutorSecond.MAX_HISTOGRAM_VALUE)
        / (this.barsNumber ** 0.5)
      );
      if (value < 0) {
        heatmap.push(0);
      } else if (value > WSExecutorSecond.MAX_HISTOGRAM_VALUE) {
        heatmap.push(WSExecutorSecond.MAX_HISTOGRAM_VALUE);
      } else {
        heatmap.push(value);
      }
    }
    return heatmap.map((e) => (e > 1 ? Math.round(e) : 1));
  }

  generateSolutions() {
    const cumulative = this.currentHistorgram.reduce(
      (result, value, i) => (
        result.length
          ? [...result, result[i - 1] + value]
          : [value]
      ),
      [],
    );

    const result = Array.from({ length: this.repeats }).map(() => {
      const value = Math.random() * cumulative[cumulative.length - 1];
      return cumulative.findIndex((element) => element >= value);
    });
    return result;
  }

  get schema() {
    return WSExecutorSecond.VALIDATION_SCHEMAS[this.state];
  }
}

module.exports = WSExecutorSecond;
