==========================
Pattern Recognition Server
==========================

.. image:: https://travis-ci.org/char-lie/pattern-recognition-server.svg?branch=master
    :target: https://travis-ci.org/char-lie/pattern-recognition-server

.. contents::

How to use
==========

Available on `sprs.herokuapp.com`_.
If it doesn't respond for several seconds,
just wait.
I use a free Heroku plan,
so the application sleeps if it isn't in use for a while.
After the request, it wakes up again.

How to launch
=============

If you don't want to use `sprs.herokuapp.com`_ for some reason,
you can launch the server locally,
remember: it tastes better with nvm_.

- Install NodeJS_ 12 or later (you can use ``nvm install node`` for this)
- Download the project using
  ``git clone git@github.com:char-lie/pattern-recognition-server.git``.

Production mode
---------------

- Go to the project directory and run ``npm i``,
  and it will install all needed dependencies locally.
- Execute ``npm build`` to build all static files.
- Execute ``npm start``.

Development mode
----------------

- If you want to develop, run ``npm i -D``
  to install development dependencies as well
  (development server, linter, transpilers, etc.)
- Launch ``npm run start:dev`` to start development server
  with real-time restart on code changes.

Environment variables
---------------------

- ``PORT`` specifies the port to bind the server to.
  ``3000`` by default.
- ``MAX_CONNECTED_CLIENTS`` is the WebSocket connection pool size.
  ``1`` by default.
- ``LOG_LEVEL`` is the bottom line of the logs severities.
  Uses syslog_ levels of winston_ logger.
  The default value is ``warning``.

Tasks
=====

Common recommendations
----------------------

- Use only space symbol (``0x20``, the 32nd symbol of ASCII table)
  for horizontal spacing.
- Use only ``\n`` (``0x0A``, the 10th symbol of ASCII table)
  for vertical spacing.
- The tasks don't allow leading, trailing and repeated whitespaces.

Completing the tasks
--------------------

- You should create your own application.
- The application creates a WebSocket client
  and connects to the WebSocket server.
  Read `Awesome WebSockets`_ for more information.
- The address to connect is
  ``wss://sprs.herokuapp.com/task-number/[session-id]``,
  and also supports insecure WebSocket connection via
  ``ws://sprs.herokuapp.com/task-number/[session-id]``.
- When you connect to the server,
  you create a new session named ``[session-id]``,
  which should be a valid URI segment
  (for example, a number, word, words separated by ``-`` or ``_``, etc.).

**Tip**
Use ``wss://echo.websocket.org`` and ``ws://echo.websocket.org``
to learn how to connect to WebSocket server
and check how your messages look like.

Using Web UI
------------

Web UI is used only to follow the task completion.

- First, connect to the server via your application
  in order to create a new session,
  and pause your application.
- Type the ``[session-id]`` into the corresponding input
  of the desired task page to start watching it.
- Resume your application to the next step and watch the UI changes.
- Continue the previous step until the end.

Troubleshooting
---------------

Server doesn't respond for several seconds
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

I use `free dyno hours`_,
so the server sleeps if it's inactive for a specific time.
In order to wake it,
send a request to it and wait for a while (multiple seconds).

Server has denied my connection
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check the URI you're trying to connect to.
Note that it's case sensitive:
for example, the ``first`` task address is
``wss://sprs.herokuapp.com/first``,
not ``wss://sprs.herokuapp.com/First``
and not ``wss://sprs.herokuapp.com/FIRST``.

Check that you have specified session id
and its format is correct.

Also, this error may occur if sockets pool is full.
Contact the lecturer/administrator/char-lie
if you think this is the problem.

I don't receive any messages
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check whether you're listening for them
and connected to the server at all
(you may be disconnected by it for different reasons).

Connection was closed by the server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Check instruction and your messages:
you may have sent a wrong message.

Also, each task has TTL (time to live) of connections.
If you're working on a task for too long,
you will be disconnected.

Web UI doesn't show anything
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Keep in mind that the UI is used only for watching task completion.
You have to write your own application
to interact with the WebSocket server and complete the tasks.

If you're completing something
but the UI doesn't change,
first check the session id in the UI.
If it's correct, you should see some messages in its messages table.

Zeroth
------

TTL: 1 minute (60 seconds).

- Create a session on the server under ``/zeroth`` path
  (wss://sprs.herokuapp.com/zeroth/[session-id])
- Send ``{ "data": { "message": "Let's start" } }`` message to the server
- Receive and parse a string from the server.
  The format is ``{ "data": { "operands": [<operand1>, <operand2>], "operator": "<operand>" }, "success": true }``,
  where

  - ``<operand(1,2)>`` is an integer from ``1`` to ``100``;
  - ``<operator>`` is one of ``+``, ``-`` and ``*``.

- Send the solution to the problem in format ``{ "data": { "answer": <answer> } }``,
  where ``<answer>`` should be an integer.

First
-----

TTL: 5 minutes (300 seconds).

- Create a session on the server under ``/first`` path
  (wss://sprs.herokuapp.com/first/[session-id])
- Send ``{ "data": { "message": "Let's start"}  }`` message to the server
- Receive a string ``{ "data": { "width": <width>, "height": <height>, "number": <number> }, "success": true }`` from the server,
  where ``<width>`` is a basic width (when the horizontal scale is ``1``)
  of images of a digit in pixels,
  ``<height>`` is a basic height (when the vertical is scale ``1``)
  and ``<number>`` is the total number of digits.
- Send a message with settings to the server in the format
  ``{ "data": { "width": <width>, "height": <height>, "totalSteps": <totalSteps>, "noise": <noise>, "shuffle": <shuffle> } }``, where

  - ``<width>`` is an integer from ``1`` to ``100``
    for the horizontal scale of digits;
  - ``<height>`` is an integer from ``1`` to ``100``
    for the vertical scale of digits;
  - ``<noise>`` is a real number from ``0`` to ``1`` representing the noise level;
  - ``<totalSteps>`` is an integer from ``1`` to ``1'000'000``
    representing the number of digits you want to recognize;
  - ``<shuffle>`` is either ``true`` or ``false``,
    and ``off`` means using default correspondence
    between digit names and their matrices
    (matrix for ``5`` is visually similar to the digit ``5``),
    and ``on`` means shuffling of the correspondences
    (so, digit ``1`` may have a matrix of the digit ``8`` and so on)
    to check whether you're parsing the next message from the server.

- Receive a dictionary with digit names as keys and corresponding matrices as values in the form

  .. code-block:: json

    {
      "data": {
        <digit1>: matrix1,
        <digit2>: matrix2,
        ...
        <digitN>: matrixN
      },
      "success": true
    }

  and each matrix is a binary matrix of form

  .. code-block:: json

    [
      [d11, d12, ... d1n],
      [d21, d22, ... d2n],
                 ...
      [dm1, dm2, ... dmn]
    ]

  where ``dij`` is ``0`` or ``1`` value for ``i``-th row and ``j``-th column
  of the image, ``n`` its width (horizontal scale multiplied by the basic width)
  and ``m`` is its height (vertical scale multiplied by the basic height).
- Send the message ``{ "data": { "message": "Ready" } }`` to start completing the task
- Receive a problem in the form

  .. code-block:: json

    {
      "data": {
        "currentStep": <step>,
        "matrix": <matrix>
      },
      "success": true
    }

  where ``<step>`` is the number of the problem,
  and ``<matrix>`` is a binary matrix representing the problem.
  Web UI can display this number
  if you pause the application before the next step.
- Send the response in the form ``{ "data": { "step": <step>, "answer": <answer> } }``,
  where ``<step>`` is the problem number and ``<answer>``
  is your guess to the problem — a digit represented by the ``matrix``.
- Receive a response in the form ``{ "data": { "step": <step>, "answer": <answer> }, "success": true }``,
  where ``<answer>`` is the right answer to the problem ``<step>``.
- If there are more problems left to solve
  (``<step>`` is less than ``<totalSteps>``),
  send ``{ "data": { "message": "Ready" } }`` again and receive a new problem.
- Otherwise, send ``{ "data": { "message": "Bye" } }``
- Receive ``{ "data": { "successes": <successes>, "totalSteps": <totalSteps> }, "success": true }``,
  where ``<successes>`` is the number of success guesses.

Second
------

TTL: 5 minutes (300 seconds).

- Create a session on the server under ``/second`` path
  (wss://sprs.herokuapp.com/second/[session-id])
- Send ``Let's start with [width] [loss] [totalSteps] [repeats]``
  message to the server, where

  - ``[width]`` is an integer from ``2`` to ``1'000``,
    meaning the number of bars in heatmaps,
  - ``[loss]`` is either ``L1`` for distance as a loss
    (distance is measured in heatmap bars),
    or a non-negative integer for delta loss.
    The integer is a radius of an allowed interval:
    zero means binary loss function,
    one means a current bar and its nearest neighbors,
    and so on;
    must be lower than ``[width]``;
  - ``[totalSteps]`` is an integer from ``1`` to ``1'000'000``,
    represents a number of heatmaps to deal with;
  - ``[repeats]`` is an integer from ``1`` to ``1'000``,
    representing the number of attempts per one heatmap.

- Receive the string ``Are you ready?`` from the server,
- Send the message ``Ready`` to start completing the task
- Receive a problem in the form

  ::

    Heatmap [step]
    heatmap

  where ``[step]`` is the number of the heatmap,
  ``heatmap`` is an array of positive integers
  not greater than ``255``,
  and representing the heatmap without normalization.
- Send the response in the form

  ::

    [step]
    guesses

  where ``[step]`` is the heatmap number and ``guesses``
  is an array of your guesses of size ``[repeats]`` in form
  ``G1 G2 ... Grepeats``,
  where each ``Gi`` is a non-negative integer
  smaller than the heatmap size,
  representing the number of the bar you've chosen
  (indexing from zero).
- Receive a response in the form

  ::

    Solutions [step] [loss]
    answers
    guesses
    heatmap

  where ``answers`` is the array with the right answers
  to the problem ``[step]``.
  Web UI should show the animation here
  if you pause the application before going to the next step.
- If there are more problems left to solve
  (``[step]`` is less than ``[totalSteps]``),
  send ``Ready`` again and receive a new problem.
- Otherwise, send ``Bye``
- Receive ``Finish with [loss]``,
  where ``[loss]`` is the sum of all losses.

Normalized heatmap contains probabilities of an aim
to be in specific positions.
In order to normalize it, you should divide its values
by their sums.

Right answers (aim coordinates) are generated according to the heatmap.

.. _Awesome WebSockets:
    https://github.com/facundofarias/awesome-websockets#awesome-websockets-
.. _free dyno hours:
    https://devcenter.heroku.com/articles/free-dyno-hours
.. _nvm:
    https://github.com/nvm-sh/nvm
.. _NodeJS:
    https://nodejs.org
.. _sprs.herokuapp.com:
    https://sprs.herokuapp.com
.. _winston:
    https://www.npmjs.com/package/winston
.. _syslog:
    https://www.npmjs.com/package/winston#logging-levels
