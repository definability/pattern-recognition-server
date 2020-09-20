=========
Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on `Keep a Changelog`_
and this project adheres to `Semantic Versioning`_.

.. contents::
    :backlinks: none

Unreleased_
===========

`0.2.1`_ - 2020-09-20
=====================

Fixed
-----

- Build failed with new ``autoprefixer`` (version ``10``).

`0.2.0`_ - 2020-09-19
=====================

Added
-----

- Server-side support of `JSON`_ messages.

Changed
-----

- Using only the `JSON`_ format for all tasks.

Fixed
-----

- Observer should not cause server failure by ignoring the socket close.

`0.1.1`_ - 2020-08-23
=====================

Added
-----

- Validation of symbols in the setup for the first task executor.

Fixed
-----

- In the second task with the ``interval`` loss function,
  the server should send the number of failed attempts
  instead of successful ones.
- In the first and second tasks should allow only positive values
  for ``repeats``, ``totalSteps``, ``height`` and ``width``.
- Maximal ``totalSteps`` of the first task
  should be ``1'000'000``, not ``100``.
- Maximal payload of the WebSocket server should successfully handle
  the allowed messages from clients.
- Server should not fail if the client initialization fails.

`0.1.0`_ - 2019-09-19
=====================

Added
-----

- ``shuffle`` parameter to the first task to add an ability
  to force parsing of ideal matrices.

Fixed
-----

- In the first task the server should send scaled matrices with ideal images.

`0.0.2`_ - 2019-09-19
=====================

Added
-----

- Tasks completion instructions to ``Home`` component and README_.
- ``Zeroth`` component for the test practicum (zeroth practicum).
- ``WSTable`` component to view WebSocket messages.
- winston_ logger to the server.

- WebSocket_ ``server`` module.

  - ``WSClientListener`` base class to serve connected clients.
  - ``WSObserver`` listener for passive observers of tasks.
  - ``WSExecutor`` listener/emitter to serve task executor.
  - ``WSExecutorZeroth`` checker for the zeroth task.
  - ``WSExecutorFirst`` checker for the first task.
  - ``WSExecutorSecond`` checker for the second task.
  - ``WSTaskServer`` tasks manager.
  - ``WebSocketPool`` serverwise connection pool.

Changed
-------

- Use `React Bootstrap`_ components instead of default ones.
- Renamed components

  - ``first/FirstA`` to ``First``.
  - ``first/FirstB`` to ``Second``.
  - ``first/MatrixCanvas`` to ``MatrixCanvas``.
  - ``first/AnimationCanvas`` to ``AnimationCanvas``.

- Use WebSocket as an interface instead of ``input``
  in ``First`` and ``Second`` components.

Fixed
-----

- If ``AidSprite`` has the same drop coordinate
  as the ``AimSprite`` starting position,
  aid should not be destroyed until the aim landing.
- UI error when switching from the ``Second`` task to any other.
- The first task server fail on scales greater than ``1``.
- Order of messages broadcasted by ``WSTaskServer``.

0.0.1 - 2019-07-28
==================

Added
-----

- ReactJS_ client.

  - ``index`` main view.
  - ``App`` container component with routing.
  - ``Home`` component for the homepage.
  - ``first/First`` container component for the first practicum.
  - ``first/FirstA`` container component
    with the task ``A`` of the first practicum.
  - ``first/FirstB`` container component
    with the task ``B`` of the first practicum.
  - ``first/MatrixCanvas`` component
    to visualize matrices based on provided palette.
  - ``first/AnimationCanvas`` component
    to visualize and animate ``AnimationSprite`` instances.
  - ``AnimationSprite`` class
    to store information about animating sprites.
  - ``AimSprite`` with the aim to save.
  - ``AidSprite`` sprite with aid for the aim.
  - ``HelicopterSprite`` sprite
    for helicopter providing the aid.
  - ``drawMatrix`` function to draw a matrix on a canvas.
  - ``main`` stylesheet.

- ExpressJS_ server.

  - ``index`` module serves the ReactJS static.

.. _Unreleased:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.2.1...HEAD
.. _0.2.1:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.2.0...v0.2.1
.. _0.2.0:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.1.1...v0.2.0
.. _0.1.1:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.1.0...v0.1.1
.. _0.1.0:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.0.2...v0.1.0
.. _0.0.2:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.0.1...v0.0.2

.. _Keep a Changelog:
    http://keepachangelog.com/en/1.0.0
.. _Semantic Versioning:
    http://semver.org/spec/v2.0.0

.. _JSON:
    https://www.json.org
.. _README:
    https://github.com/char-lie/pattern-recognition-server/blob/master/README.rst
.. _React Bootstrap:
    https://react-bootstrap.github.io
.. _ReactJS:
    https://reactjs.org
.. _ExpressJS:
    https://expressjs.com
.. _WebSocket:
    https://github.com/websockets/ws
.. _winston:
    https://www.npmjs.com/package/winston
