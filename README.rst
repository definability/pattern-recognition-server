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
so the application sleeps if it isn't in use for an hour.
After the response, it wakes up again.

How to launch
=============

If you want to launch the application locally,
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
  and connects to the WebSocket server
  Read `Awesome WebSockets`_ for more information.
- The address to connect is
  ``wss://sprs.herokuapp.com/task-number/[session-id]``.
- When you connect to the server,
  you create a new session named ``[session-id]``,
  which should be a valid URI segment
  (for example, a number, word, words separated by ``-`` or ``_``, etc.).
- Web UI is used only to follow the task completion.
  Just type the ``[session-id]`` into the corresponding input
  of the desired task page to start watching it.

**Tip**
It's better for you to create a local demo WebSocket server
to get familiar with WebSockets.

Zero
----

- Create a session on the server under ``/zero`` path
  (wss://sprs.herokuapp.com/zero)
- Send ``Let's start`` message to the server
- Receive and parse a string from the server.
  The format is: ``[number] [operator] [number]``,
  where ``[number]`` is an integer from ``1`` to ``100``
  and ``[operator]`` is one of ``+``, ``-`` and ``*``.
- Send the solution to the problem (an integer).

First
-----

- Create a session on the server under ``/first`` path
  (wss://sprs.herokuapp.com/first)
- Send ``Let's start`` message to the server
- Receive a string ``[width] [height] [N]`` from the server,
  where ``[width]`` is a basic width (for horizontal scale ``1``)
  of images of a digit in pixels,
  ``[height]`` is a basic height (for vertical scale ``1``)
  and ``[N]`` is the total number of digits,
- Send settings to the server in the following format
  ``[width] [height] [noise] [totalSteps]``,
  where ``[width]`` is a positive integer for the horizontal scale of digits,
  ``[height]`` is a positive integer for the vertical scale of digits,
  ``[noise]`` is a real number from ``0`` to ``1`` representing the noise level.
  ``[totalSteps]`` is a positive integer,
  representing the number of digits you want to recognize
- Receive an array of digit names and corresponding matrices in the form

  ::

    digit1
    matrix1
    digit2
    matrix2
    ...
    digitN
    matrixN

  and each matrix is a binary matrix of form

  ::

    d11 d12 ... d1n
    d21 d22 ... d2n
          ...
    dm1 dm2 ... dmn

  where ``dij`` is ``0`` or ``1`` value for ``i``-th row and ``j``-th column
  of the image, ``n`` its width (horizontal scale multiplied by basic width)
  and ``m`` is its height (vertical scale multiplied by basic height).
- Send the message ``Ready`` to start completing the task
- Receive a problem in the form

  ::

    [step]
    matrixj

  where ``[step]`` is the number of the problem,
  and ``matrixj`` is a binary matrix representing the problem
- Send the response in the form ``[step] [solutionj]``,
  where ``[step]`` is the problem number and ``[solutionj]``
  is your guess to the problem
- Receive a response in the form ``[step] answerj``,
  where ``answerj`` is the right answer to the problem ``[step]``.
- If there are more problems left to solve
  (``[step]`` is less than ``[totalSteps]``),
  send ``Ready`` again and receive a new problem.
- Otherwise, send ``Bye``
- Receive ``Finish with [successes] successes of [totalSteps]``,
  where ``[successes]`` is the number of success guesses.

Second
------

- Create a session on the server under ``/second`` path
  (wss://sprs.herokuapp.com/second)
- Send ``Let's start with [loss] [width] [totalSteps] [repeats]``
  message to the server,
  where ``[loss]`` is either ``L1`` for distance as a loss
  (distance is measured in heatmap bars),
  or a non-negative integer for delta loss.
  The integer is a radius of an allowed interval:
  zero means binary loss function,
  one means a current bar and its nearest neighbors,
  and so on,
  ``[width]`` is a number of bars in heatmaps,
  ``[totalSteps]`` is a number of heatmaps to deal with,
  and ``[repeats]`` is a number of attempts per one heatmap.
- Receive the string ``Are you ready?`` from the server,
- Send the message ``Ready`` to start completing the task
- Receive a problem in the form

  ::

    Heatmap [step]
    heatmapj

  where ``[step]`` is the number of the heatmap,
  ``heatmapj`` is an array of positive integers
  not greater than ``255``,
  and representing the heatmap without normalization.
- Send the response in the form

  ::

    [step]
    guessesj

  where ``[step]`` is the heatmap number and ``guessesj``
  is an array of your guesses of size ``[repeats]`` in form
  ``G1 G2 ... Grepeats``
- Receive a response in the form

  ::

    Solutions [step] [loss]
    answersj
    guessesj
    heatmapj

  where ``answersj`` is the array with the right answers
  to the problem ``[step]``.
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
.. _nvm:
    https://github.com/nvm-sh/nvm
.. _NodeJS:
    https://nodejs.org
.. _sprs.herokuapp.com:
    https://sprs.herokuapp.com
