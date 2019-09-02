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
 * Executor for the second task.
 *
 * The task is:
 * - Create a session on the server under `/second` path
 * - Send `Let's start with [loss] [width] [totalSteps] [repeats]`
 *   message to the server,
 *   where `[width]` is a number of bars in heatmaps,
 *   `[loss]` is either `L1` for distance as a loss
 *   (distance is measured in heatmap bars),
 *   or a non-negative integer for delta loss.
 *   The integer is a radius of an allowed interval:
 *   zero means binary loss function,
 *   one means a current bar and its nearest neighbors,
 *   and so on,
 *   `[totalSteps]` is a number of heatmaps to deal with,
 *   and `[repeats]` is a number of attempts per one heatmap.
 * - Receive the string `Are you ready?` from the server,
 * - Send the message `Ready` to start completing the task
 * - Receive a problem in the form
 *   ```
 *   Heatmap [step]
 *   heatmapj
 *   ```
 *   where `[step]` is the number of the heatmap,
 *   and `heatmapj` is an array of positive integers
 *   not greater than `255`,
 *   representing the heatmap without normalization.
 * - Send the response in the form
 *   ```
 *   [step]
 *   guessesj
 *   ```
 *   where `[step]` is the heatmap number and `guessesj`
 *   is an array of your guesses of size `[repeats]` in form
 *   `G1 G2 ... Grepeats`
 * - Receive a response in the form
 *   ```
 *   Solutions [step] [loss]
 *   answersj
 *   guessesj
 *   heatmapj
 *   ```
 *   where `answersj` is the array with the right answers
 *   to the problem `[step]`.
 * - If there are more problems left to solve
 *   (`[step]` is less than `[totalSteps]`),
 *   send `Ready` again and receive a new problem.
 * - Otherwise, send `Bye`
 * - Receive `Finish with [loss]`,
 *   where `[loss]` is the sum of all losses.
 *
 * Normalized heatmap contains probabilities of an aim
 * to be in specific positions.
 * In order to normalize it, you should divide its values
 * by their sums.
 *
 * Right answers (aim coordinates) are generated according to the heatmap.
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
      return (guess, answer) => Math.abs(guess - answer) <= Number(identifier);
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

  constructor(data) {
    super(data);

    this.barsNumber = null;
    this.currentHistorgram = null;
    this.currentStep = 0;
    this.loss = null;
    this.lossName = null;
    this.repeats = null;
    this.state = WSExecutorSecond.STATES.START;
    this.totalLoss = 0;
    this.totalSteps = null;

    console.log('Executor Second created');
  }

  onMessage(message) {
    console.log(`Executor says: '${message}'`);
    switch (this.state) {
      case WSExecutorSecond.STATES.START:
        this.onStart(message);
        break;
      case WSExecutorSecond.STATES.READY:
        this.onReady(message);
        break;
      case WSExecutorSecond.STATES.SOLVE:
        this.onSolve(message);
        break;
      case WSExecutorSecond.STATES.FINISH:
        this.onFinish(message);
        break;
      default:
        console.error(`Unknown state ${this.state}`);
        break;
    }
  }

  onStart(message) {
    if (!message.startsWith('Let\'s start with ')) {
      this.send('You should send a correct starting message');
      this.socket.close();
      return;
    }
    const [barsNumber, lossName, totalSteps, repeats, ...tail] = (
      message.slice('Let\'s start with '.length).split(' ')
    );

    if (tail.length) {
      this.send('Redundant arguments');
      this.socket.close();
      return;
    }

    if (
      !Number.isSafeInteger(Number(barsNumber))
      || Number(barsNumber) > WSExecutorSecond.MAX_BARS_NUMBER
    ) {
      this.send('Incorrect number of bars');
      this.socket.close();
      return;
    }
    this.barsNumber = Number(barsNumber);

    if (
      lossName !== WSExecutorSecond.L1_LOSS_NAME
      && !Number.isSafeInteger(Number(lossName))
    ) {
      this.send('Unknown loss');
      this.socket.close();
      return;
    }
    if (
      Number.isSafeInteger(Number(lossName))
      && (Number(lossName) < 0 || Number(lossName) >= this.barsNumber)
    )
    {
      this.send('Incorrect loss delta');
      this.socket.close();
      return;
    }
    this.lossName = lossName;
    this.loss = WSExecutorSecond.LOSS_FUNCTION(lossName);


    if (
      !Number.isSafeInteger(Number(totalSteps))
      || Number(totalSteps) > WSExecutorSecond.MAX_TOTAL_STEPS
    ) {
      this.send('Incorrect total steps');
      this.socket.close();
      return;
    }
    this.totalSteps = Number(totalSteps);


    if (
      !Number.isSafeInteger(Number(repeats))
      || Number(repeats) > WSExecutorSecond.MAX_REPEATS
    ) {
      this.send('Incorrect repeats number');
      this.socket.close();
      return;
    }
    this.repeats = Number(repeats);


    this.state = WSExecutorSecond.STATES.READY;

    this.send('Are you ready?');
  }

  onReady(message) {
    if (message !== 'Ready') {
      this.send('You should be "Ready"');
      this.socket.close();
      return;
    }
    this.state = WSExecutorSecond.STATES.SOLVE;

    this.currentStep += 1;
    this.currentHistorgram = this.generateHeatmap();

    this.send(`Heatmap ${this.currentStep}\n${this.currentHistorgram.join(' ')}`);
  }

  onSolve(message) {
    const [step, guessesString] = message.split('\n');
    if (!guessesString || !guessesString.length) {
      this.send('No guesses');
      this.socket.close();
      return;
    }

    const guesses = guessesString.split(' ').map(Number);
    if (
      !guesses.reduce((acc, e) => acc && this.isValidGuess(e), true)
      || guesses.length !== this.repeats
    ) {
      this.send('Provided guess cannot be right');
      this.socket.close();
      return;
    }
    if (Number(step) !== this.currentStep) {
      this.send('Wrong step number');
      this.socket.close();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.state = WSExecutorSecond.STATES.READY;
    } else if (this.currentStep === this.totalSteps) {
      this.state = WSExecutorSecond.STATES.FINISH;
    } else {
      console.error(`We have step ${this.currentStep} of ${this.totalSteps}!`);
      this.socket.close();
      return;
    }

    const solutions = this.generateSolutions();
    this.totalLoss = guesses.reduce(
      (result, e, i) => result + this.loss(e, solutions[i]),
      this.totalLoss,
    );

    const information = `Solutions ${this.currentStep} ${this.lossName}`;
    const solutionsString = solutions.join(' ');
    const heatmapString = this.currentHistorgram.join(' ');

    this.send(
      `${information}\n${solutionsString}\n${guessesString}\n${heatmapString}`,
    );
  }

  onFinish(message) {
    if (message !== 'Bye') {
      this.send('You should have said "Bye"');
      this.socket.close();
      return;
    }
    this.send(
      `Finish with ${this.totalLoss}`,
    );
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
}

module.exports = WSExecutorSecond;
