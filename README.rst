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
I use free Heroku plan,
so the application sleeps if it isn't in use for an hour.
After the response it wakes up again.

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
  You can also provide ``PORT`` environment variable
  to specify the port to bind the server to.

Development mode
----------------

- If you want to develop, run ``npm i -D``
  to install development dependencies as well
  (development server, linter, transpilers, etc.)
- Launch ``npm run start:dev`` to start development server
  with real-time restart on code changes.

.. _nvm:
    https://github.com/nvm-sh/nvm
.. _NodeJS:
    https://nodejs.org
.. _sprs.herokuapp.com:
    https://sprs.herokuapp.com
