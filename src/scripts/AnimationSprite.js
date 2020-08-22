/**
 * MIT License
 *
 * Copyright (c) 2019-2020 char-lie
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

/**
 * Base class for animation sprites.
 * Contains `image` method to provide matrix with image
 * and methods to calculate animation.
 */
class AnimationSprite {
  /**
   * @param birthDate is a date when the object animation starts.
   *        Can be set to `null`
   *        and changed afterwards in `startAnimation` method.
   *        Needed for the `lifetime` method.
   */
  constructor(birthDate = null) {
    this.identifier = Symbol(this.constructor.name);
    if (!birthDate) {
      this.birthDate = null;
    } else {
      this.birthDate = birthDate;
    }
  }

  /**
   * Set the `birthDate` to `date`.
   * Can be called only once.
   * Cannot be called if the birth date was set in the constructor.
   *
   * @param date is a Date instance.
   */
  startAnimation(date) {
    if (!this.birthDate) {
      this.birthDate = date;
    } else {
      throw Error(
        'You cannot restart the ongoing animation. '
        + 'The entity was already started by `startAnimation` '
        + 'or by providing `birthDate` to the constructor.',
      );
    }
    return this;
  }

  /**
   * Height of the `image` in pixels depending on time.
   */
  height() {
    return 0;
  }

  /**
   * Matrix with pixels depending on time.
   * Pixel contains color identifier
   * that will be mapped by `palette`.
   * The scale is not applied to the image,
   * the client should do it.
   */
  image() {
    return [[]];
  }

  /**
   * Object time of living in seconds
   * from its `birthDate` till `time`.
   * @param time is a Date instance.
   */
  lifetime(time) {
    if (!this.birthDate) {
      throw new Error(
        'The object was not born yet. '
        + 'Call `startAnimation` method with the birth date '
        + 'or pass the birth date to the object constructor.',
      );
    }
    return (time - this.birthDate) / 1E3;
  }

  /**
   * Whether the object should not exist anymore.
   */
  needDestroy() {
    return false;
  }

  /**
   * Horizontal offset of the object depending on time
   * (its X position).
   */
  offsetX() {
    return 0;
  }

  /**
   * Vertical offset of the object depending on time
   * (its Y position).
   */
  offsetY() {
    return 0;
  }

  /**
   * Mapping from color identifier of the sprite from `image`
   * to RGB color in "#RrGgBb` for drawing on a canvas.
   */
  palette(color) {
    return color;
  }

  /**
   * Scale of the object depending on time.
   */
  scale() {
    return 1;
  }

  /**
   * Visibility of the object depending on time.
   */
  visible() {
    return true;
  }

  /**
   * Width of the `image` in pixels depending on time.
   */
  width() {
    return 0;
  }
}

export default AnimationSprite;
