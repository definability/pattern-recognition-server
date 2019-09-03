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
    https://github.com/char-lie/pattern-recognition-server/compare/v0.0.1...HEAD

.. _Keep a Changelog:
    http://keepachangelog.com/en/1.0.0
.. _Semantic Versioning:
    http://semver.org/spec/v2.0.0

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
