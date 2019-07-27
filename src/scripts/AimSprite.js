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
import AnimationSprite from './AnimationSprite';

/**
 * Aim for the aid to save.
 * The aim is a human looking like this
 *
 *   O
 *  ###
 * # # #
 * # # #
 *  # #
 *  # #
 *  # #
 *  # #
 *
 * It can run and die.
 * When its dead, it turns into a cross.
 * I'm not christian
 * but this is a recognizable sign of death.
 *
 *   #
 *   #
 * #####
 *   #
 *   ##
 *   #
 *  ##
 *   #
 *   #
 */
class AimSprite extends AnimationSprite {
  static IMAGES = {
    NEUTRAL: [
      [' ', ' ', ' ', ' ', ' '],
      [' ', ' ', 'O', ' ', ' '],
      [' ', '-', 'X', '-', ' '],
      ['-', ' ', 'X', ' ', '-'],
      ['W', ' ', 'X', ' ', 'W'],
      [' ', '|', '|', '|', ' '],
      [' ', '|', ' ', '|', ' '],
      [' ', '|', ' ', '|', ' '],
      [' ', 'F', ' ', 'F', ' '],
    ],
    WALKING: [
      [
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', 'O', ' ', ' '],
        [' ', '-', 'X', '-', ' '],
        ['-', ' ', 'X', ' ', 'W'],
        ['W', ' ', 'X', ' ', ' '],
        [' ', '|', '|', '|', ' '],
        [' ', '|', ' ', '|', ' '],
        [' ', ' ', ' ', '|', ' '],
        [' ', ' ', ' ', 'F', ' '],
      ],
      [
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', 'O', ' ', ' '],
        [' ', '-', 'X', '-', ' '],
        ['W', ' ', 'X', ' ', '-'],
        [' ', ' ', 'X', ' ', 'W'],
        [' ', '|', '|', '|', ' '],
        [' ', '|', ' ', '|', ' '],
        [' ', '|', ' ', ' ', ' '],
        [' ', 'F', ' ', ' ', ' '],
      ],
    ],
    DEAD: [
      [' ', ' ', 'T', ' ', ' '],
      [' ', ' ', 'T', ' ', ' '],
      ['T', 'T', 'T', 'T', 'T'],
      [' ', ' ', 'T', ' ', ' '],
      [' ', ' ', 'T', 'T', ' '],
      [' ', ' ', 'T', ' ', ' '],
      [' ', 'T', 'T', ' ', ' '],
      [' ', ' ', 'T', ' ', ' '],
      [' ', ' ', 'T', ' ', ' '],
    ],
  };

  static PALETTE = {
    ' ': '',
    '-': '#55AA55',
    '|': '#8888EE',
    F: '#AA5500',
    O: '#FF88AA',
    T: '#AAAAAA',
    W: '#FF88AA',
    X: '#55AA55',
  };

  #aid = null;

  #canvasHeight = 0;

  #canvasWidth = 0

  #maxDistance = -1;

  #offsetX = 0;

  #scale = 1;

  #velocity = 0;

  constructor({
    aid,
    birthDate,
    canvasHeight,
    canvasWidth,
    maxDistance,
    offsetX,
    scale,
    velocity,
  }) {
    super(birthDate);
    this.#aid = aid;
    this.#canvasHeight = canvasHeight;
    this.#canvasWidth = canvasWidth;
    this.#maxDistance = maxDistance;
    this.#offsetX = offsetX;
    this.#scale = scale;
    this.#velocity = velocity;
  }

  height(time) {
    return this.scale(time) * AimSprite.IMAGES.NEUTRAL.length;
  }

  image(time) {
    if (this.isDead(time)) {
      return AimSprite.IMAGES.DEAD;
    }
    if (!this.isActive(time)) {
      return AimSprite.IMAGES.NEUTRAL;
    }
    const frame = Math.round(this.lifetime(time) * 4) % 2;
    return AimSprite.IMAGES.WALKING[frame];
  }

  isActive(time) {
    if (!this.#aid.isLanded(time)) {
      return false;
    }
    if (Math.abs(this.offsetX(time) - this.#aid.offsetX()) <= 1) {
      return false;
    }
    if (this.isDead(time)) {
      return false;
    }
    return true;
  }

  isDead(time) {
    return (
      this.#maxDistance > 0
      && Math.abs(this.offsetX(time) - this.#offsetX) >= this.#maxDistance
    );
  }

  needDestroy(time) {
    if (Math.abs(this.offsetX(time) - this.#aid.offsetX()) <= 1) {
      return true;
    }
    return false;
  }

  offsetX(time) {
    const landingTime = this.#aid.landingTime();
    if (this.#aid.landingTime() > time) {
      return this.#offsetX;
    }
    const theoreticalDistance = this.#velocity * (time - landingTime) * 1E-3;
    const distance = (
      this.#maxDistance <= 0 || theoreticalDistance <= this.#maxDistance
        ? theoreticalDistance
        : this.#maxDistance
    );
    const aidOffsetX = this.#aid.offsetX(time);
    if (Math.abs(this.#offsetX - aidOffsetX) <= distance) {
      return aidOffsetX;
    }
    const direction = this.#offsetX > this.#aid.offsetX(time) ? -1 : 1;
    return this.#offsetX + direction * distance;
  }

  offsetY(time) {
    return this.#canvasHeight - this.height(time);
  }

  palette(color) {
    return AimSprite.PALETTE[color];
  }

  scale() {
    return this.#scale;
  }

  takeAid() {
    this.#aid.take();
  }

  visible() {
    return true;
  }

  width(time) {
    return this.scale(time) * AimSprite.IMAGES.NEUTRAL.length;
  }
}

export default AimSprite;
