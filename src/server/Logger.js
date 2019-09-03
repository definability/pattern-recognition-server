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
const {
  config: { syslog: { levels } },
  createLogger,
  format,
  transports: { Console },
} = require('winston');

const DEFAULT_LOG_LEVEL = 'warning';
const LOG_LEVEL = ((process.env.LOG_LEVEL || '').toLowerCase() in levels
  ? process.env.LOG_LEVEL.toLowerCase()
  : DEFAULT_LOG_LEVEL);

const Logger = (componentName = 'server') => createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf((info) => (
      `${info.timestamp} [${info.level}] ${componentName}: `
      + `${info.message}`
    )),
  ),
  level: LOG_LEVEL,
  levels,
  transports: [new Console()],
});

module.exports = Logger;
