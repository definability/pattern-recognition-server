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
import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import App from './App';
import Home from './Home';
import First from './First';
import Second from './Second';

describe('App', () => {
  it('should render correctly', () => {
    expect(shallowToJson(shallow(<App />))).toMatchSnapshot();
  });
  it('should show the home page on /', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(wrapper).toContainExactlyOneMatchingElement(Home);
    expect(wrapper).not.toContainMatchingElement(First);
    expect(wrapper).not.toContainMatchingElement(Second);
  });
  it('should show the first task page on /first', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/first']}>
        <App />
      </MemoryRouter>,
    );
    expect(wrapper).toContainExactlyOneMatchingElement(First);
    expect(wrapper).not.toContainMatchingElement(Second);
    expect(wrapper).not.toContainMatchingElement(Home);
  });
  it('should show the second task page on /second', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/second']}>
        <App />
      </MemoryRouter>,
    );
    expect(wrapper).toContainExactlyOneMatchingElement(Second);
    expect(wrapper).not.toContainMatchingElement(First);
    expect(wrapper).not.toContainMatchingElement(Home);
  });
});
