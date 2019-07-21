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
import React, { Component } from 'react';

import MatrixCanvas from './MatrixCanvas';

/**
 * The component consists of the three main parts:
 * - Header
 * - Control panel
 * - Image
 * 
 * The header contains only text.
 *
 * The image is a MatrixCanvas component with current noised digit image.
 * We use binary matrices from FirstA.IDEAL_NUMBERS to represent the image.
 *
 * Control panel contains inputs to change
 * - Image width multiplier (FirstA.changeWidth)
 * - Image height multiplier (FirstA.changeHeight)
 * - Change noise level (FirstA.changeNoiseLevel)
 * - Generate new image (FirstA.generateMatrix)
 *
 * The noise level is a probability of generated random variable
 * to be equal `1`.
 * Otherwise, it's `0`.
 * A random number is generated independently for each pixel.
 * Then it's xor-ed with the matrix value.
 */
class FirstA extends Component {
  /**
   * Binary matrices of size 5x3 (5 rows, 3 columns),
   * representing digits from `0` to `9`.
   */
  static IDEAL_NUMBERS = [
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 0, 0],
    ],
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
  ];

  /**
   * Default canvas width.
   */
  static WIDTH = 300;

  /**
   * Default canvas height.
   */
  static HEIGHT = 500;

  constructor(props) {
    super(props);
    this.state = {
      matrix: [[0]],
      width: 1,
      height: 1,
      noiseLevel: 0,
    };
  }

  /**
   * Change image height multiplier.
   * The height is a positive integer.
   */
  changeHeight(inputHeight) {
    let height = Number(inputHeight);
    if (height < 1) {
      height = 1;
    }
    height = Math.round(height);
    this.setState(previousState => ({
      ...previousState,
      height,
    }));
  }

  /**
   * Change the probability of Bernoulli random variable
   * infered in FirstA.applyElementNoise.
   */
  changeNoiseLevel(inputNoiseLevel) {
    let noiseLevel = Number(inputNoiseLevel);
    if (noiseLevel < 0) {
      noiseLevel = 0;
    } else if (noiseLevel > 1) {
      noiseLevel = 1;
    }
    this.setState(previousState => ({
      ...previousState,
      noiseLevel,
    }));
  }

  /**
   * Change image width multiplier.
   * The width is a positive integer.
   */
  changeWidth(inputWidth) {
    let width = Number(inputWidth);
    if (width < 1) {
      width = 1;
    }
    width = Math.round(width);
    this.setState(previousState => ({
      ...previousState,
      width,
    }));
  }

  /**
   * Apply Bernoulli noise to the value and return the new one.
   */
  applyElementNoise(value) {
    const { noiseLevel } = this.state;
    /* eslint-disable-next-line no-bitwise */
    return value ^ (Math.random() < noiseLevel);
  }

  /**
   * Generate new matrix.
   * First, one of the FirstA.IDEAL_NUMBERS elements is chosen
   * as the initial value.
   * First.state.width is used to duplicate columns of the reference.
   * First.state.height is used to duplicate rows of the reference.
   * Then, we add a noise to the matrix
   * by xoring each element with random values generated by Bernoulli law.
   */
  generateMatrix() {
    const { width, height } = this.state;
    const index = Math.floor(Math.random() * FirstA.IDEAL_NUMBERS.length);
    const idealDigit = FirstA.IDEAL_NUMBERS[index];
    const matrix = [];

    idealDigit.forEach((row, i) => {
      for (let h = 0; h < height; h += 1) {
        matrix.push([]);
        for (let j = 0; j < row.length; j += 1) {
          for (let w = 0; w < width; w += 1) {
            matrix[i * height + h].push(
              this.applyElementNoise(FirstA.IDEAL_NUMBERS[index][i][j]),
            );
          }
        }
      }
    });

    this.setState(previousState => ({
      ...previousState,
      matrix,
    }));
  }

  render() {
    const {
      matrix,
      width,
      height,
      noiseLevel,
    } = this.state;
    return (
      <div>
        <h3>Subtask A</h3>
        <form>
          <label htmlFor={this.widthInput}>
            Width:
            <input
              ref={(component) => { this.widthInput = component; }}
              type="number"
              value={width}
              step={1}
              onChange={event => this.changeWidth(event.target.value)}
            />
          </label>
          <label htmlFor={this.heightInput}>
            Height:
            <input
              ref={(component) => { this.heightInput = component; }}
              type="number"
              value={height}
              step={1}
              onChange={event => this.changeHeight(event.target.value)}
            />
          </label>
          <label htmlFor={this.noiseLevelInput}>
            Noise level:
            <input
              ref={(component) => { this.noiseLevelInput = component; }}
              type="number"
              value={noiseLevel}
              step={0.1}
              onChange={event => this.changeNoiseLevel(event.target.value)}
            />
          </label>
          <button type="button" onClick={() => this.generateMatrix()}>
            Next
          </button>
        </form>
        <MatrixCanvas
          height={Math.round(FirstA.HEIGHT)}
          width={Math.round(FirstA.WIDTH)}
          matrix={matrix}
          palette={{
            0: '#FFFFFF',
            1: '#000000',
          }}
        />
      </div>
    );
  }
}

export default FirstA;
