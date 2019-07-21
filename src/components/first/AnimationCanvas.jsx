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
import React from 'react';
import PropTypes from 'prop-types';

import MatrixCanvas from './MatrixCanvas';

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
class AnimationCanvas extends MatrixCanvas {
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
    const { matrix, height, width } = this.props;
    this.drawMatrix({ matrix, height, width });
  }

  componentDidUpdate() {
    const { matrix, height, width } = this.props;
    this.drawMatrix({ matrix, width, height });
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

export default AnimationCanvas;
