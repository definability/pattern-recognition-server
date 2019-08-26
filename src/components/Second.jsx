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
import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';

import AidSprite from '../scripts/AidSprite';
import AimSprite from '../scripts/AimSprite';
import AnimationCanvas from './AnimationCanvas';
import HelicopterSprite from '../scripts/HelicopterSprite';
import MatrixCanvas from './MatrixCanvas';
import WSTable from './WSTable';

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
class Second extends Component {
  /**
   * Default canvas width.
   */
  static WIDTH = 1000;

  /**
   * Height of a sky with helicopters there.
   */
  static SKY_HEIGHT = 300;

  /**
   * Palette for heatmap.
   * Converts color value from `[0; 255]`
   * to `[#000000; #FFFFFF]` grayscale.
   */
  static grayPalette = (color) => (
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
      guesses: null,
      heatmap: [0],
      height: Second.SKY_HEIGHT,
      helicopters: [],
      messages: [],
      sessionId: '',
      solutions: null,
      width: Second.WIDTH,
      ws: null,
    };
  }

  async onServerMessage(message) {
    const [
      stepInformation,
      solutionsString,
      guessesString,
      heatmapString,
      ...tail
    ] = message.split('\n');
    const [type, step, loss] = stepInformation.split(' ');
    if (
      !Number.isSafeInteger(Number(step))
      || type !== 'Solutions'
      || (loss !== 'L1' && !Number.isSafeInteger(Number(loss)))
      || !solutionsString
      || !guessesString
      || !heatmapString
      || tail.length
    ) {
      return;
    }
    const solutions = solutionsString.split(' ').map(Number);
    if (
      !solutions.length
      || !solutions.reduce((acc, e) => acc && Number.isSafeInteger(e), true)
    ) {
      return;
    }
    const guesses = guessesString.split(' ').map(Number);
    if (
      !guesses.length
      || !guesses.reduce((acc, e) => acc && Number.isSafeInteger(e), true)
    ) {
      return;
    }
    const heatmap = heatmapString.split(' ').map(Number);
    if (
      !heatmap.length
      || !heatmap.reduce((acc, e) => acc && Number.isSafeInteger(e), true)
    ) {
      return;
    }

    await this.changeAimDelta(loss === 'L1' ? -1 : Number(loss));
    await this.changeHeatmap(heatmap);
    this.dropAll(guesses, solutions);
  }

  /**
   * Change canvas width.
   */
  changeWidth(inputWidth) {
    let width = Number(inputWidth);
    if (width < 1) {
      width = 1;
    }
    width = Math.round(width);
    this.setState((previousState) => ({
      ...previousState,
      aids: [],
      aims: [],
      helicopters: [],
      width,
    }));
  }

  /**
   * Change sky height.
   */
  changeHeight(inputHeight) {
    let height = Number(inputHeight);
    if (height < 1) {
      height = 1;
    }
    height = Math.round(height);
    this.setState((previousState) => ({
      ...previousState,
      aids: [],
      aims: [],
      helicopters: [],
      height,
    }));
  }

  dropAll(guesses, solutions) {
    guesses.forEach((guess, i) => this.drop({
      aimBar: solutions[i],
      aidBar: guess,
    }));
  }

  changeHeatmap(heatmap) {
    if (
      !Array.isArray(heatmap)
      || !heatmap.length
      || !heatmap.reduce((acc, e) => acc && Number.isSafeInteger(e), true)
    ) {
      throw new Error('Heatmap is invalid');
    }
    return new Promise((resolve) => this.setState(
      (previousState) => ({
        ...previousState,
        aids: [],
        aims: [],
        barsNumber: heatmap.length,
        heatmap,
        helicopters: [],
      }),
      resolve,
    ));
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
    return new Promise((resolve) => this.setState((previousState) => ({
      ...previousState,
      aids: [],
      aims: [],
      aimDelta,
      helicopters: [],
    }),
    resolve));
  }

  observeSession() {
    const {
      ws: oldWS,
    } = this.state;
    const sessionId = this.sessionId.value;
    if (oldWS && [oldWS.CONNECTING, oldWS.OPEN].includes(oldWS.readyState)) {
      oldWS.removeEventListener('open', oldWS.onopen);
      oldWS.removeEventListener('close', oldWS.onclose);
      oldWS.removeEventListener('error', oldWS.onerror);
      oldWS.close(1000);
    }
    const HOST = window.location.origin.replace(/^http/, 'ws');
    const ws = new WebSocket(`${HOST}/first/${sessionId}`);
    ws.addEventListener('open', () => {
      const message = {
        author: 'Client',
        data: `Connect to session ${sessionId}`,
      };
      this.setState((previousState) => ({
        ...previousState,
        messages: [...previousState.messages, message],
      }));
    });
    ws.addEventListener('close', ({ code, target: { url } }) => {
      const message = {
        author: 'Client',
        data: `Disconnected from ${url} with code ${code}`,
      };
      this.setState((previousState) => ({
        ...previousState,
        messages: [...previousState.messages, message],
      }));
    });
    ws.addEventListener('error', ({ target: { url } }) => {
      const message = {
        author: 'Client',
        data: `Error in ${url}`,
      };
      this.setState((previousState) => ({
        ...previousState,
        messages: [...previousState.messages, message],
      }));
    });
    ws.addEventListener('message', ({ data: message }) => {
      const colonIndex = message.search(':');
      const author = colonIndex === -1 ? '' : message.slice(0, colonIndex);
      const dataIndex = colonIndex === -1 ? 0 : colonIndex + 2;
      const data = message.slice(dataIndex, message.length);
      const newMessage = {
        author,
        data: data.length < 30 ? data : '[hidden message]',
      };
      if (author === 'Server') {
        this.onServerMessage(data);
      }
      this.setState((previousState) => ({
        ...previousState,
        messages: [...previousState.messages, newMessage],
      }));
    });
    this.setState((previousState) => ({
      ...previousState,
      messages: [],
      sessionId,
      ws,
    }));
  }

  updateSprites(time) {
    const { aids, aims, helicopters } = this.state;
    const existingAids = aids.filter(
      (sprite) => !sprite.needDestroy(time),
    );
    aims.filter((aim) => aim.needDestroy(time) || aim.isDead(time)).forEach(
      (aim) => aim.takeAid(),
    );
    const existingAims = aims.filter(
      (sprite) => !sprite.needDestroy(time),
    );
    const existingHelicopters = helicopters.filter(
      (sprite) => !sprite.needDestroy(time),
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
      this.setState((previousState) => ({
        ...previousState,
        ...stateChanges,
      }));
    }
  }

  /**
   * Create new helicopter to drop an item.
   */
  drop({ aimBar, aidBar }) {
    const {
      aimDelta,
      barsNumber,
      height,
      width,
    } = this.state;

    const BASE_VELOCITY = 100;
    const helicopter = new HelicopterSprite({
      birthDate: new Date(),
      canvasWidth: Math.round(width),
      canvasHeight: height,
      offsetY: Math.random() * (height - HelicopterSprite.IMAGES[0].length * 5),
      scale: 5,
      velocity: BASE_VELOCITY * 2,
    });
    const aid = new AidSprite({
      birthDate: new Date(),
      canvasHeight: height,
      canvasWidth: Math.round(width),
      dropX: (
        ((aidBar + 0.5) * width) / barsNumber
        - (AidSprite.IMAGE[0].length / 2)
      ),
      helicopter,
      scale: 5,
      velocity: BASE_VELOCITY * 2,
    });
    const aim = new AimSprite({
      aid,
      birthDate: new Date(),
      canvasHeight: height,
      canvasWidth: Math.round(width),
      maxDistance: ((aimDelta + 0.5) * width) / barsNumber,
      offsetX: (
        ((aimBar + 0.5) * width) / barsNumber
        - (AimSprite.IMAGES.NEUTRAL[0].length / 2)
      ),
      scale: 3,
      velocity: BASE_VELOCITY,
    });
    this.setState((previousState) => ({
      ...previousState,
      helicopters: [...previousState.helicopters, helicopter],
      aids: [...previousState.aids, aid],
      aims: [...previousState.aims, aim],
    }));
  }

  render() {
    const {
      aids,
      aims,
      heatmap,
      height,
      helicopters,
      messages,
      sessionId,
      width,
    } = this.state;
    return (
      <div>
        <h1>
          Task 2
          <small className="text-muted">Aiding people</small>
        </h1>
        <Row>
          <Col xs={12} lg={6}>
            <Form>
              <Form.Row className="justify-content-md-center">
                <Col xs={8}>
                  <Form.Control
                    ref={(component) => { this.sessionId = component; }}
                    placeholder="Session ID"
                  />
                </Col>
                <Col xs={4}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => this.observeSession()}
                  >
                    Observe
                  </Button>
                </Col>
              </Form.Row>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <AnimationCanvas
              height={height}
              width={Math.round(width)}
              sprites={[...helicopters, ...aids, ...aims]}
              updateSprites={(time) => this.updateSprites(time)}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <MatrixCanvas
              height={Math.round(Second.HEATMAP_HEIGHT)}
              width={width}
              matrix={[heatmap]}
              palette={Second.grayPalette}
            />
          </Col>
        </Row>
        <Row>
          <WSTable messages={messages} sessionId={sessionId} />
        </Row>
      </div>
    );
  }
}

export default Second;
