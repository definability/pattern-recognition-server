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

class FirstA extends Component {
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

  static randomizeMatrix() {
    const index = Math.floor(Math.random() * FirstA.IDEAL_NUMBERS.length);
    const matrix = FirstA.IDEAL_NUMBERS[index];
    for (let i = 0; i < matrix.length; i += 1) {
      for (let j = 0; j < matrix[0].length; j += 1) {
        /* eslint-disable-next-line no-bitwise */
        matrix[i][j] ^= (Math.random() < 0.1);
      }
    }
    return this.setState(previousState => ({
      ...previousState,
      matrix,
    }));
  }

  constructor(props) {
    super(props);
    this.state = {
      matrix: FirstA.IDEAL_NUMBERS[0],
    };
  }

  render() {
    const { matrix } = this.state;
    return (
      <div>
        <h3>The first subtask</h3>
        <button type="button" onClick={() => FirstA.randomizeMatrix()}>
          Next
        </button>
        <MatrixCanvas
          height={500}
          width={300}
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
