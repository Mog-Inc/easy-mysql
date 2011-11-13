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

## Usage

    var settings = {
          user     : 'myuser',
          password : 'mypass',
          database : 'mydb'
    };
 
    var easy_mysql = EasyMySQL.create(settings);
    easy_mysql.get_one("select * from foo where bar = ?", ['jazz'], function (err, result) {
         // do stuff
    });

## License

node-easy-mysql is licensed under the MIT license.
