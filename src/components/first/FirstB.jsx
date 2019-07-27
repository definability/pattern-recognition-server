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

/**
 * The component consists of the three main parts:
 * - Header
 * - Control panel
 * - Map
 * - Heatmap
 *
 * The header contains only text.
 *
 * The control panel contains controls
 * width and height of the map and heatmap canvas,
 * At the moment, it also sets number of the heatmap bars
 * and maximal distance between aid and aim.
 *
 * Map displays helicopters providing aid to the aim.
 * Aim position is chosen randomly based on the heatmap.
 * Aid drop position is chosen randomly at the moment,
 * but then it should be chosen by the algorithm,
 * given the heatmap (without knowing actual aim position).
 *
 * Heatmap is generated randomly without normalization
 * and rendered as a sequence of grayscale rectangles.
 */
class FirstB extends Component {
  /**
   * Default canvas width.
   */
  static WIDTH = 100;

  /**
   * Height of a sky with helicopters there.
   */
  static SKY_HEIGHT = 100;

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
      aids: [],
      aimDelta: -1,
      aims: [],
      barsNumber: 1,
      heatmap: [0],
      height: FirstB.SKY_HEIGHT,
      helicopters: [],
      width: FirstB.WIDTH,
    };
  }

  /**
   * Change the maximal good distance between aim and aid
   * in heatmap bars.
   * Zero beans only current bar.
   * Set `-1` to remove the constraint.
   */
  changeAimDelta(inputAimDelta) {
    let aimDelta = Number(inputAimDelta);
    if (aimDelta < -1) {
      aimDelta = -1;
    }
    aimDelta = Math.round(aimDelta);
    this.setState(previousState => ({
      ...previousState,
      aids: [],
      aims: [],
      aimDelta,
      helicopters: [],
    }));
  }

  /**
   * Change number of bars in heatmap.
   */
  changeBarsNumber(inputBarsNumber) {
    let barsNumber = Number(inputBarsNumber);
    if (barsNumber < 1) {
      barsNumber = 1;
    }
    barsNumber = Math.round(barsNumber);
    this.setState(previousState => ({
      ...previousState,
      aids: [],
      aims: [],
      barsNumber,
      helicopters: [],
    }));
  }

  /**
   * Change number of bars in heatmap.
   */
  changeHeight(inputHeight) {
    let height = Number(inputHeight);
    if (height < 1) {
      height = 1;
    }
    height = Math.round(height);
    this.setState(previousState => ({
      ...previousState,
      aids: [],
      aims: [],
      helicopters: [],
      height,
    }));
  }

  /**
   * Change number of bars in heatmap.
   */
  changeWidth(inputWidth) {
    let width = Number(inputWidth);
    if (width < 1) {
      width = 1;
    }
    width = Math.round(width);
    this.setState(previousState => ({
      ...previousState,
      aids: [],
      aims: [],
      helicopters: [],
      width,
    }));
  }

  updateSprites(time) {
    const { aids, aims, helicopters } = this.state;
    const existingAids = aids.filter(
      sprite => !sprite.needDestroy(time),
    );
    aims.filter(aim => aim.needDestroy(time) || aim.isDead(time)).forEach(
      aim => aim.takeAid(),
    );
    const existingAims = aims.filter(
      sprite => !sprite.needDestroy(time),
    );
    const existingHelicopters = helicopters.filter(
      sprite => !sprite.needDestroy(time),
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
    const { heatmap, barsNumber, width } = this.state;
    const cumulative = heatmap.reduce(
      (result, value, i) => (
        result.length
          ? [...result, result[i - 1] + value]
          : [value]
      ),
      [],
    );
    const value = Math.random() * cumulative[cumulative.length - 1];
    const index = cumulative.findIndex(element => element >= value);
    return (width / barsNumber) * (index + 0.5);
  }

  /**
   * Create new helicopter to drop an item.
   */
  drop() {
    const {
      aimDelta,
      barsNumber,
      height,
      width,
    } = this.state;

    const helicopter = new HelicopterSprite({
      birthDate: new Date(),
      canvasWidth: Math.round(width),
      canvasHeight: height,
      offsetY: Math.random() * (height - HelicopterSprite.IMAGES[0].length * 5),
      scale: 5,
      velocity: 200,
    });
    const aid = new AidSprite({
      birthDate: new Date(),
      canvasHeight: height,
      canvasWidth: Math.round(width),
      dropX: Math.random() * (width - AidSprite.IMAGE[0].length),
      helicopter,
      scale: 5,
      velocity: 200,
    });
    const aim = new AimSprite({
      aid,
      birthDate: new Date(),
      canvasHeight: height,
      canvasWidth: Math.round(width),
      maxDistance: (aimDelta + 0.5) * width / barsNumber,
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
    const { barsNumber } = this.state;
    const heatmap = [Math.random() * 255];
    for (let i = 1; i < barsNumber; i += 1) {
      const value = (
        heatmap[i - 1] + (Math.random() - 0.5) * 500 / (barsNumber ** 0.5)
      );
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
      aids: [],
      aims: [],
      heatmap: heatmap.map(Math.round),
      helicopters: [],
    }));
  }

  render() {
    const {
      aids,
      aimDelta,
      aims,
      barsNumber,
      heatmap,
      height,
      helicopters,
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
          <label htmlFor={this.heightInput}>
            Height:
            <input
              ref={(component) => { this.heightInput = component; }}
              type="number"
              value={height}
              step={1}
              onChange={event => this.changeHeight(event.target.value)}
            />
          </label>
          <label htmlFor={this.barsNumberInput}>
            Bars number:
            <input
              ref={(component) => { this.barsNumberInput = component; }}
              type="number"
              value={barsNumber}
              step={1}
              onChange={event => this.changeBarsNumber(event.target.value)}
            />
          </label>
          <label htmlFor={this.aimDeltaInput}>
            Aim life delta:
            <input
              ref={(component) => { this.aimDeltaInput = component; }}
              type="number"
              value={aimDelta}
              step={1}
              onChange={event => this.changeAimDelta(event.target.value)}
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
          height={height}
          width={Math.round(width)}
          sprites={[...helicopters, ...aids, ...aims]}
          updateSprites={time => this.updateSprites(time)}
        />
        <MatrixCanvas
          height={Math.round(FirstB.HEATMAP_HEIGHT)}
          width={width}
          matrix={[heatmap]}
          palette={FirstB.grayPalette}
        />
      </div>
    );
  }
}

export default FirstB;
