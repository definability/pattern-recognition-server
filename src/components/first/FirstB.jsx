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
import AnimationCanvas from './AnimationCanvas';
import HelicopterSprite from '../../scripts/HelicopterSprite';
import AidSprite from '../../scripts/AidSprite';
import AimSprite from '../../scripts/AimSprite';

class FirstB extends Component {
  /**
   * Default canvas width.
   */
  static WIDTH = 1000;

  /**
   * Height of a sky with helicopters there.
   */
  static SKY_HEIGHT = 200;

  /**
   * Palette for heatmap.
   * Converts color value from `[0; 255]`
   * to `[#000000; #FFFFFF]` grayscale.
   */
  static grayPalette = color => (
    `#${color.toString(16).toUpperCase().padStart(2, '0').repeat(3)}`
  );

  /**
   * Default heatmap height.
   */
  static HEATMAP_HEIGHT = 20;

  constructor(props) {
    super(props);
    this.state = {
      heatmap: [0],
      width: 1,
      helicopters: [],
      aids: [],
      aims: [],
    };
  }

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

  updateSprites(time) {
    const { aids, aims, helicopters } = this.state;
    const existingAids = aids.filter(
      sprite => !sprite.needDestroy(time)
    );
    aims.filter(aim => aim.needDestroy(time) || aim.isDead(time)).forEach(
      aim => aim.takeAid()
    );
    const existingAims = aims.filter(
      sprite => !sprite.needDestroy(time)
    );
    const existingHelicopters = helicopters.filter(
      sprite => !sprite.needDestroy(time)
    );
    const stateChanges = {};
    let change = false;
    if (existingHelicopters.length !== helicopters.length) {
      stateChanges.helicopters = existingHelicopters;
      change = true;
    }
    if (existingAids.length !== aids.length) {
      stateChanges.aids = existingAids;
      change = true;
    }
    if (existingAims.length !== aims.length) {
      stateChanges.aims = existingAims;
      change = true;
    }
    if (change) {
      this.setState(previousState => ({
        ...previousState,
        ...stateChanges,
      }));
    }
  }

  generateX() {
    const { heatmap, width } = this.state;
    const cumulative = heatmap.reduce(
      (result, value, i) => result.length ? [...result, result[i - 1] + value] : [value],
      []
    );
    const value = Math.random() * cumulative[cumulative.length - 1];
    const index = cumulative.findIndex(element => element >= value);
    return (FirstB.WIDTH / width) * (index + 0.5);
  }

  /**
   * Create new helicopter to drop an item.
   */
  drop() {
    const helicopter = new HelicopterSprite({
      birthDate: new Date(),
      canvasWidth: Math.round(FirstB.WIDTH),
      canvasHeight: FirstB.SKY_HEIGHT,
      offsetY: Math.random() * (FirstB.SKY_HEIGHT - HelicopterSprite.IMAGES[0].length * 5),
      scale: 5,
      velocity: 100,
    });
    const aid = new AidSprite({
      birthDate: new Date(),
      canvasHeight: FirstB.SKY_HEIGHT,
      canvasWidth: Math.round(FirstB.WIDTH),
      dropX: Math.random() * (FirstB.WIDTH - AidSprite.IMAGE[0].length),
      helicopter,
      scale: 5,
      velocity: 200,
    });
    const aim = new AimSprite({
      aid,
      birthDate: new Date(),
      canvasHeight: FirstB.SKY_HEIGHT,
      canvasWidth: Math.round(FirstB.WIDTH),
      maxDistance: 200,
      offsetX: this.generateX(),
      scale: 3,
      velocity: 100,
    });
    this.setState(previousState => ({
      ...previousState,
      helicopters: [...previousState.helicopters, helicopter],
      aids: [...previousState.aids, aid],
      aims: [...previousState.aims, aim],
    }));
  }

  /**
   * Generate new heatmap.
   */
  generateHeatmap() {
    const { width } = this.state;
    const heatmap = [Math.random() * 255];
    for (let i = 1; i < width; i += 1) {
      const value = heatmap[i - 1] + (Math.random() - 0.5) * 500 / (width ** 0.5);

      if (value < 0) {
        heatmap.push(0);
      } else if (value > 255) {
        heatmap.push(255);
      } else {
        heatmap.push(value);
      }
    }
    this.setState(previousState => ({
      ...previousState,
      heatmap: heatmap.map(Math.round),
    }));
  }

  render() {
    const {
      heatmap,
      helicopters,
      aids,
      aims,
      width,
    } = this.state;
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
          <button type="button" onClick={() => this.drop()}>
            Drop
          </button>
        </form>
        <AnimationCanvas
          height={Math.round(FirstB.SKY_HEIGHT)}
          width={Math.round(FirstB.WIDTH)}
          sprites={[...helicopters, ...aids, ...aims]}
          updateSprites={time => this.updateSprites(time)}
        />
        <MatrixCanvas
          height={Math.round(FirstB.HEATMAP_HEIGHT)}
          width={Math.round(FirstB.WIDTH)}
          matrix={[heatmap]}
          palette={FirstB.grayPalette}
        />
      </div>
    );
  }
}

export default FirstB;
