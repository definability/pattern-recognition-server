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
import HelicopterSprite from './HelicopterSprite';

/**
 * The aid is just a red cross like `+`,
 * dropped by a helicopter.
 */
class AidSprite extends AnimationSprite {
  static IMAGE = [
      [' ', '+', ' '],
      ['+', '+', '+'],
      [' ', '+', ' '],
  ];

  static PALETTE = {
    '+': '#AA5555',
    ' ': '',
  };

  #canvasHeight = 0;

  #canvasWidth = 0

  #helicopter = null;

  #dropX = 0;

  #scale = 1;

  #velocity = 0;

  #taken = false;

  constructor({
    canvasHeight,
    canvasWidth,
    helicopter,
    scale,
    velocity,
    birthDate,
    dropX,
  }) {
    super(birthDate);
    this.#canvasHeight = canvasHeight;
    this.#canvasWidth = canvasWidth;
    this.#helicopter = helicopter;
    this.#scale = scale;
    this.#velocity = velocity;
    this.#dropX = dropX;
  }

  height(time) {
    return this.scale(time) * AidSprite.IMAGE.length;
  }

  image(time) {
      return AidSprite.IMAGE;
  }

  isLanded(time) {
    return this.offsetY(time) >= this.#canvasHeight - this.height(time) - 1;
  }

  landingTime() {
    const dropTime = this.dropTime();
    return new Date(Number(dropTime) + 1E3 * (this.#canvasHeight
      - this.#helicopter.offsetY(dropTime)
      - this.#helicopter.height(dropTime) / 2
      - this.height(this.birthDate)) / this.#velocity);
  }

  needDestroy(time) {
    return this.#taken;
  }

  offsetX() {
    return this.#dropX;
  }

  dropTime() {
    return this.#helicopter.timeFromOffsetX(
      this.offsetX()
      + this.#helicopter.width(this.#helicopter.birthDate)
      - this.width(this.birthDate)
    );
  }

  offsetY(time) {
    const dropTime = this.dropTime();
    if (time < this.dropTime()) {
      return 0;
    }
    if (time < this.landingTime()) {
      return this.#helicopter.offsetY(dropTime)
        + this.#helicopter.height(dropTime) / 2
        + this.#velocity * (time - dropTime) * 1E-3
    }
    return this.#canvasHeight - this.height(time);
  }

  palette(color) {
    return AidSprite.PALETTE[color];
  }

  scale() {
    return this.#scale;
  }

  take() {
    this.#taken = true;
  }

  visible(time) {
    return time - this.dropTime() >= 0;
  }

  width(time) {
    return this.scale(time) * AidSprite.IMAGE.length;
  }
}

export default AidSprite;
