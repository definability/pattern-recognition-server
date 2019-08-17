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
- ExpressJS_ ``server`` module.
  - ``index`` module serves the ReactJS static.
- WebSocket_ ``server`` module.
  - ``WSClientListener`` base class to serve connected clients.
  - ``WSObserver`` listener for passive observers of tasks.
  - ``WSExecutor`` listener/emitter to serve task executor.
  - ``WSExecutorZero`` checker for task zero.
  - ``WSTaskServer`` tasks manager.
  - ``WebSocketPool`` serverwise connection pool.

.. _Unreleased:
    https://github.com/char-lie/pattern-recognition-server/compare/v0.0.1...HEAD

.. _Keep a Changelog:
    http://keepachangelog.com/en/1.0.0
.. _Semantic Versioning:
    http://semver.org/spec/v2.0.0

.. _ReactJS:
    https://reactjs.org
.. _ExpressJS:
    https://expressjs.com
.. _WebSocket:
    https://github.com/websockets/ws
