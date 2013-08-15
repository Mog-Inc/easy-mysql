Node EasyMySQL
==============

## Purpose

A small collection of simple functions that make using MySQL with node.js easier. 
Uses the [node-mysql](https://github.com/felixge/node-mysql) library.

Developed by [MOG.com](http://mog.com)

## Installation

```
npm install easy-mysql
```

## Overview

EasyMySQL allows you to handle MySQL connection pooling, acquiring connections, and releasing them with ease.
For example, where you might do this (using node-pool):

    var get_widget = function(id, cb) {
        pool.acquire(function (err, client) {
            if (err) {
                pool.release(client);
                cb(err, null);
            } else {
                var sql = 'select * from widgets where id = ?';
                client.query(sql, [id], function (err, results) {
                    pool.release(client);
                    if (err || results && results.length === 0) {
                        cb(err, null);
                    } else {
                        cb(null, results[0]);
                    }
                });
            }
        });
    };

...you can do this instead with EasyMySQL:

    var get_widget = function(id, cb) {
        var sql = 'select * from widgets where id = ?';
        easy_mysql.get_one(sql, [id], cb);
    };

## Usage

    // require the module
    var EasyMySQL = require('easy-mysql');

### Connection Modes

You can connect three different ways with EasyMySQL:

  1. Direct: Directly establish a single connection for each query.
  This is probably not a good idea for production code, but may be fine for code
  where you don't want to set up a pool, such as in unit tests.

  2. Custom Pool: Pass in your own pool object.  It must have functions named
  'acquire' and 'release'.

  3. Built-in Pool: Use the built-in pool, which uses [node-pool](https://github.com/coopernurse/node-pool)


#### Direct Connect Example

    var settings = {
        user     : 'myuser',
        password : 'mypass',
        database : 'mydb'
    };
 
    var easy_mysql = EasyMySQL.connect(settings);

#### Custom Pool Example

    var my_pool = /* create your own pool here */;
    var easy_mysql = EasyMySQL.connect_with_pool(pool);

#### Built-in Pool Example

    var settings = {
        user      : 'myuser',
        password  : 'mypass',
        database  : 'mydb',
        pool_size : 50
    };

    var easy_mysql = EasyMySQL.connect_with_easy_pool(settings);

#### Logging

You can specify a logger to log error events (more event types may be added later).

    var settings = {
        user     : 'myuser',
        password : 'mypass',
        database : 'mydb',
        logging: {
            logger: my_logger,
            events: {
                error: {level: 'warn'}
            }
        }
    };

You must pass in your own logger and it must have a function with the same
name as the `level` you specify.


### Instance methods

#### get_one / getOne

Returns only one result, and if no results are found, returns null.

    var sql = 'select * from widgets where id = ?';
    easy_mysql.get_one(sql, [123], function (err, result) {
        cb(err, result);
    });


#### get_all / getAll

Returns an array of results, and if no results are found, returns an empty array.

    var sql = 'select * from widgets where id > ?';
    easy_mysql.get_all(sql, [123], function (err, results) {
        cb(err, results);
    });

#### execute

Executes an arbitrary SQL query and returns the results from node-mysql.

    var sql = 'update widgets set foo = 'bar' where id = ?';
    easy_mysql.execute(sql, [123], function (err, results) {
        cb(err, results);
    });

## Tests and Docs

To run tests and generate docs, first run:

    npm install -d

Run the tests:

    make test

Generate JSDocs:

    make doc


## Contribute

If you would like to contribute to the project, please fork it and send us a pull request.  Please add tests
for any new features or bug fixes.  Also run ``make lint`` before submitting the pull request.


## License

node-easy-mysql is licensed under the MIT license.
