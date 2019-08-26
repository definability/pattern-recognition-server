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

import MatrixCanvas from './MatrixCanvas';
import WSTable from './WSTable';

/**
 * The component consists of the three main parts:
 * - Header
 * - Session name input panel
 * - Image
 * - Messages list
 *
 * The header contains only text.
 *
 * The image is a MatrixCanvas component with current noised digit image.
 * We use binary matrices from First.IDEAL_NUMBERS to represent the image.
 *
 * Messages list will be populated by messages
 * received by the client as an observer.
 */
class First extends Component {
  /**
   * Binary matrices of size 5x3 (5 rows, 3 columns),
   * representing digits from `0` to `9`.
   */
  static IDEAL_NUMBERS = [
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 0, 0],
    ],
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
  ];

  /**
   * Default canvas width.
   */
  static WIDTH = 300;

  /**
   * Default canvas height.
   */
  static HEIGHT = 500;

  constructor(props) {
    super(props);
    this.state = {
      matrix: [[0]],
      messages: [],
      sessionId: '',
      ws: null,
    };
  }

  onServerMessage(message) {
    const [step, ...matrixString] = message.split('\n');
    if (!Number.isSafeInteger(Number(step)) || !matrixString.length) {
      return;
    }
    const matrix = matrixString.map((row) => row.split(' ').map(Number));
    const width = matrix[0].length;
    if (!matrix.reduce((acc, row) => (
      acc
      && row.length === width
      && row.reduce((eacc, e) => eacc && Number.isFinite(e), true)
    ), true)) {
      return;
    }
    this.setState((previousState) => ({
      ...previousState,
      matrix,
    }));
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

  render() {
    const {
      matrix,
      messages,
      sessionId,
    } = this.state;
    return (
      <div>
        <h1>Task 1 <small className="text-muted">Digits recognition</small></h1>
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
        <Row className="justify-content-md-center">
          <Col xs={6} lg={4}>
            <MatrixCanvas
              height={Math.round(First.HEIGHT)}
              width={Math.round(First.WIDTH)}
              matrix={matrix}
              palette={{
                0: '#FFFFFF',
                1: '#000000',
              }}
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

export default First;
