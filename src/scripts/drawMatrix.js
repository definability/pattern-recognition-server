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

/**
 * Draw a matrix on the canvas of the specified width and height.
 * Move the matrix by specified offset and apply the provided scale.
 */
function drawMatrix({
  context,
  matrix,
  width,
  height,
  palette,
  offsetX = 0,
  offsetY = 0,
  scaleX = 1,
  scaleY = 1,
}) {
  const originalFillStyle = context.fillStyle;
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
        context.fillStyle = color;
        context.fillRect(
          Math.floor(offsetX + x * scaleX),
          Math.floor(offsetY + y * scaleY),
          Math.ceil(scaleX),
          Math.ceil(scaleY),
        );
      }
    }
  }
  context.fillStyle = originalFillStyle;
}

export default drawMatrix;
