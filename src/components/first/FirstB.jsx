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

class FirstB extends Component {
  /**
   * Default canvas width.
   */
  static WIDTH = 300;

  /**
   * Default canvas height.
   */
  static HEIGHT = 20;

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

  constructor(props) {
    super(props);
    this.state = {
      heatmap: [0],
      width: 1,
    };
  }

  generateHeatmap() {
    const { width } = this.state;
    const heatmap = [];
    for (let i = 0; i < width; i += 1) {
      let value = 0;
      if (i == 0) {
        value = Math.random() * 255;
      } else {
        value = heatmap[i - 1] + (Math.random() - 0.5) * 500 / (width ** 0.5);
      }

      if (value < 0) {
        heatmap.push(0);
      } else if (value > 255) {
        heatmap.push(255);
      } else {
        heatmap.push(value);
      }
    }
    this.setState((previousState) => ({
      ...previousState,
      heatmap: heatmap.map(Math.round),
    }));
  }

  render() {
    const {
      heatmap,
      width,
    } = this.state;
    console.log(heatmap);
    return (
      <div>
        <h3>Task B</h3>
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
          <button type="button" onClick={() => this.generateHeatmap()}>
            Next
          </button>
        </form>
        <MatrixCanvas
          height={Math.round(FirstB.HEIGHT)}
          width={Math.round(FirstB.WIDTH)}
          matrix={[heatmap]}
          palette={(color) =>
            '#' + color.toString(16).toUpperCase().padStart(2, '0').repeat(3)
          }
        />
      </div>
    );
  }
}

export default FirstB;
