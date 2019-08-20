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

class Zero extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      sessionId: '',
      ws: null,
    };
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
    const ws = new WebSocket(`${HOST}/zero/${sessionId}`);
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
      const newMessage = { author, data };
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
      messages,
      sessionId,
    } = this.state;
    const messagesHtml = messages.map((message) => (
      <div>
        {message.author}
:
        {' '}
        {message.data}
      </div>
    ));
    return (
      <div>
        <label htmlFor={this.sessionId}>
        Session ID:
          <input
            ref={(component) => { this.sessionId = component; }}
          />
        </label>
        <button type="button" onClick={() => this.observeSession()}>
        Observe
        </button>
        <div>{sessionId}</div>
        <div>{messagesHtml}</div>
      </div>
    );
  }
}

export default Zero;
