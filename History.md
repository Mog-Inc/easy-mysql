- 0.0.1
  Initial release.

- 0.5.0
  Converted tests from nodeunit to mocha.

- 0.6.0
  Added support for test coverage (via mocha). Requires jscoverage. Run with ``make test-cov``.

- 0.6.1
  Added support for multiple pools in easy_pool. Fixes https://github.com/Mog-Inc/easy-mysql/issues/1.

- 0.6.2
  Using ENV var EASY_MYSQL_JSCOV to avoid collisions if others use the JSCOV ENV var.

- 0.6.3
  Adding alias methods all(), one(), and query(). Bit more test coverage.

- 0.6.4
  Adding compatibility with node-mysql 0.9.1 (to be deprecated) and 2.0.0-alpha.

- 0.6.5
  Cleanup, bumping generic-pool version to 2.0.2.

- 0.6.6
  Fixed intermittent stress test failure (solution: use InnoDB, not MyISAM).

- 1.0.0
  Version bump.  This has been stable for a while now.

- 1.0.1
  Adding ability to add a logger to log errors returned from MySQL.
