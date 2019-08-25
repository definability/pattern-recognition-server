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
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';

const WSTable = ({ messages, sessionId }) => {
  const messagesHtml = messages.map((message, i) => (
    <tr>
      <td>
        {i}
      </td>
      <td>
        {message.author}
      </td>
      <td>
        {message.data}
      </td>
    </tr>
  ));
  const tableCaption = (sessionId
    ? (
      <caption>
        Session
        {sessionId}
      </caption>
    )
    : (<caption>Waiting for session to start</caption>)
  );
  const tableHeading = sessionId ? (
    <thead>
      <tr>
        <th>#</th>
        <th>Author</th>
        <th>Message</th>
      </tr>
    </thead>
  ) : (<thead />);
  return (
    <Table striped bordered hover>
      {tableCaption}
      {tableHeading}
      <tbody>
        {messagesHtml}
      </tbody>
    </Table>
  );
};

WSTable.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  sessionId: PropTypes.string.isRequired,
};

export default WSTable;
