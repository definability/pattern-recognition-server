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
import PropTypes from 'prop-types';

import AnimationSprite from '../../scripts/AnimationSprite';
import drawMatrix from '../../scripts/drawMatrix';

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
class AnimationCanvas extends Component {
  static get propTypes() {
    return {
      height: PropTypes.number.isRequired,
      sprites: PropTypes.arrayOf(PropTypes.instanceOf(AnimationSprite)),
      width: PropTypes.number.isRequired,
    };
  }

  static get defaultProps() {
    return {
      sprites: [],
    };
  }

  componentDidMount() {
    window.requestAnimationFrame(() => this.animation());
  }

  animation() {
    const {
      height,
      sprites,
      width,
    } = this.props;

    const time = new Date();
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    sprites.forEach((sprite) => {
      if (sprite.needDestroy(time)) {
        return;
      }
      drawMatrix({
        context,
        matrix: sprite.image(time),
        offsetX: sprite.offsetX(time),
        offsetY: sprite.offsetY(time),
        palette: sprite.palette,
        scaleX: sprite.scale(time),
        scaleY: sprite.scale(time),
      });
    });

    window.requestAnimationFrame(() => this.animation());
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
