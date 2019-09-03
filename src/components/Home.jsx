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
import React from 'react';

const REPOSITORY_URL = 'https://github.com/char-lie/pattern-recognition-server';
const README_URL = `${REPOSITORY_URL}/blob/master/README.rst`;

const Home = () => (
  <div>
    <h1>Welcome to the recognition world</h1>
    <p>
      <a href={`${README_URL}#tasks`}>Here</a>
      {' '}
      is the guideline how to accomplish all the tasks.
    </p>
    <p>
      Shorthands to the instructions for each task:
    </p>
    <ul>
      <li>
        <a href={`${REPOSITORY_URL}#zeroth`}>
          Zeroth
        </a>
        {' '}
        WebSocket conversation
      </li>
      <li>
        <a href={`${REPOSITORY_URL}#first`}>
          First
        </a>
        {' '}
        Digits recognition
      </li>
      <li>
        <a href={`${REPOSITORY_URL}#second`}>
          Second
        </a>
        {' '}
        Aiding people
      </li>
    </ul>
  </div>
);

export default Home;
