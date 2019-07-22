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
import assert from 'assert';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * @param width in pixels
 * @param height in pixels
 * @param palette optional object, array or function with color palette:
 *   - default is the identity function to use a matrix with colors;
 *   - you can provide an object or array to map color identifiers to colors;
 *   - you can also provide the mapping via a function.
 * @param matrix with colors
 *   - strings with RGB colors in CSS format with hash
 *   - numbers with indices of colors from the palette
 */
class MatrixCanvas extends Component {
  static get propTypes() {
    return {
      height: PropTypes.number.isRequired,
      matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]))).isRequired,
      width: PropTypes.number.isRequired,
      palette: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.func,
      ]),
    };
  }

  static get defaultProps() {
    return {
      palette: color => color,
    };
  }

  componentDidMount() {
    const { matrix, height, palette, width } = this.props;
    this.drawMatrix({ matrix, height, palette, width });
  }

  componentDidUpdate() {
    const { matrix, height, palette, width } = this.props;
    this.drawMatrix({ matrix, width, palette, height });
  }

  cleanCanvas({
    cleanColor,
    height,
    width,
  }) {
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = cleanColor;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Virtually split canvas by a grid
   * represented by a matrix.
   * Each cell of grid is filled with the color specified in the matrix.
   */
  drawMatrix({
    matrix,
    width,
    height,
    palette,
    offsetX = 0,
    offsetY = 0,
    scaleX = 1,
    scaleY = 1,
    realScale = false,
  }) {
    const blockHeight = realScale ? 1 : (height / (matrix.length * scaleY));
    const blockWidth = realScale ? 1 : (width / (matrix[0].length * scaleX));
    const ctx = this.canvas.getContext('2d');
    const originalFillStyle = ctx.fillStyle;
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        let color = '';
        if (palette instanceof Function) {
          color = palette(matrix[y][x]);
        } else if (palette instanceof Object && palette !== null) {
          if (!(matrix[y][x] in palette)) {
            throw RangeError(
              `Key ${matrix[y][x]} does not exist in palette ${palette}`,
            );
          }
          color = palette[matrix[y][x]];
        } else {
          assert(false, `Unsupported palette type ${typeof palette}`);
        }
        if (color !== '') {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.floor((offsetX + x * scaleX) * blockWidth),
            Math.floor((offsetY + y * scaleY) * blockHeight),
            Math.ceil(blockWidth * scaleX),
            Math.ceil(blockHeight * scaleY),
          );
        }
      }
    }
    ctx.fillStyle = originalFillStyle;
  }

  render() {
    const { height, width } = this.props;
    return (
      <div>
        <canvas
          ref={(component) => { this.canvas = component; }}
          width={width}
          height={height}
        />
      </div>
    );
  }
}

export default MatrixCanvas;
