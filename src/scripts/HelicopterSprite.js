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

import AnimationSprite from './AnimationSprite';

/**
 * The helicopter looks like
 *
 *    # # # # # # #
 *          #
 *        # # # #
 *  #   # # # # #
 *  # # # # # # #
 *  #       #
 *      # # # # #
 *
 * - `M` is a metal for blades and skids
 * - `A` is an armor for the main frame
 * - `W` is a window (glass)
 * - `D` is a door
 * - Space is a space, it's transparent.
 */
class HelicopterSprite extends AnimationSprite {
  static IMAGE = [
    [
      [' ', 'M', 'M', 'M', 'M', 'M', 'M', 'M'],
      [' ', ' ', ' ', ' ', 'M', ' ', ' ', ' '],
      [' ', ' ', ' ', 'A', 'A', 'A', 'A', ' '],
      ['M', ' ', 'A', 'A', 'D', 'A', 'W', ' '],
      ['A', 'A', 'A', 'A', 'D', 'A', 'A', ' '],
      ['M', ' ', ' ', ' ', 'M', ' ', ' ', 'M'],
      [' ', ' ', 'M', 'M', 'M', 'M', 'M', ' '],
    ],
    [
      [' ', ' ', 'M', 'M', 'M', 'M', 'M', ' '],
      [' ', ' ', ' ', ' ', 'M', ' ', ' ', ' '],
      [' ', ' ', ' ', 'A', 'A', 'A', 'A', ' '],
      ['M', ' ', 'A', 'A', 'D', 'A', 'W', ' '],
      ['A', 'A', 'A', 'A', 'D', 'A', 'A', ' '],
      ['M', ' ', ' ', ' ', 'M', ' ', ' ', 'M'],
      [' ', ' ', 'M', 'M', 'M', 'M', 'M', ' '],
    ],
    [
      [' ', ' ', ' ', 'M', 'M', 'M', ' ', ' '],
      [' ', ' ', ' ', ' ', 'M', ' ', ' ', ' '],
      [' ', ' ', ' ', 'A', 'A', 'A', 'A', ' '],
      ['M', ' ', 'A', 'A', 'D', 'A', 'W', ' '],
      ['A', 'A', 'A', 'A', 'D', 'A', 'A', ' '],
      ['M', ' ', ' ', ' ', 'M', ' ', ' ', 'M'],
      [' ', ' ', 'M', 'M', 'M', 'M', 'M', ' '],
    ],
  ];

  static REVERSED = HelicopterSprite.IMAGE.map(sprite =>
    sprite.map(row => [...row].reverse())
  );

  static PALETTE = {
    M: '#000000',
    A: '#55AA55',
    W: '#5555FF',
    D: '#AA5500',
    ' ': '',
  };

  #canvasHeight = 0;

  #canvasWidth = 0

  #moveRight = 0;

  #offsetY = 0;

  #scale = 1;

  #velocity = 0;

  constructor({
    canvasHeight,
    canvasWidth,
    offsetY,
    scale,
    velocity,
    birthDate,
  }) {
    super(birthDate);
    this.#canvasHeight = canvasHeight;
    this.#canvasWidth = canvasWidth;
    this.#moveRight = Math.random() > 0.5;
    this.#offsetY = offsetY;
    this.#scale = scale;
    this.#velocity = velocity;
  }

  height(time) {
    return this.scale(time) * HelicopterSprite.IMAGE.length;
  }

  image(time) {
    const images = this.#moveRight ? HelicopterSprite.IMAGE : HelicopterSprite.REVERSED;
    switch (Math.round(this.lifetime(time) * 4) % 4) {
      case 0:
        return images[0];
      case 1:
        return images[1];
      case 2:
        return images[2];
      case 3:
        return images[1];
      default:
        assert(
          false,
          `Impossible lifetime ${Math.round(this.lifetime(time) * 4) % 4}`,
        );
    }
  }

  needDestroy(time) {
    const lifetime = this.lifetime(time);
    const offsetX = this.offsetX(time);
    const width = this.width(time);
    if (this.#moveRight && offsetX >= this.#canvasWidth + width) {
      return true;
    }
    if (!this.#moveRight && offsetX + width < 0) {
      return true;
    }
    return false;
  }

  offsetX(time) {
    if (this.#moveRight) {
      return this.lifetime(time) * this.#velocity - this.width(this.birthDate);
    }
    return this.#canvasWidth - this.lifetime(time) * this.#velocity;
  }

  offsetY() {
    return this.#offsetY;
  }

  palette(color) {
    return HelicopterSprite.PALETTE[color];
  }

  scale() {
    return this.#scale;
  }

  width(time) {
    return this.scale(time) * HelicopterSprite.IMAGE.length;
  }
}

export default HelicopterSprite;
