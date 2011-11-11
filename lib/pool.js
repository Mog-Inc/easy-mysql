/* WIP
var poolModule = require('generic-pool');
var path       = require('path');
var sys = require('sys');

function create_mysql(settings) {
    var db = settings.db;
    return poolModule.Pool({
        name     : 'mysql_' + db,
        create   : function (callback) {
            var Client = require('mysql').Client;
            var client = new Client();

            client.user     = settings.user;
            client.password = settings.password;
            client.database = db;
            client.host     = settings.host;

            if (settings.port) { client.port = settings.port; }

            client.connect(function (err) {
                if (err) {
                    if (settings.logger) {
                        logger.debug("Database connection to '" + db + "' failed: " + sys.inspect(settings));
                    }
                    throw err;
                }
            });

            callback(null, client);
        },
        destroy  : function (client) { client.end(); },
        max      : settings.max_connections || 10,
        idleTimeoutMillis : settings.idle_timeout || 5000,
        log : (typeof(settings.debug) === 'undefined') ? false : settings.debug

    });
}

var MySQLPool = (function () {
    var mysql_pool = {
        pool :  {},
        get: function () {
            if (!this.pool) {
                this.pool[db] = create_mysql(db);
            }
            return this.pool[db];
        },
        end: function (cb) {
            var prop;
            var props = 0;
            var exited = 0;
            for (prop in this.pool) {
                if (this.pool.hasOwnProperty(prop)) {
                    props++;
                }
            }

            if (props === 0) { cb(); return; }

            for (prop in this.pool) {
                if (this.pool.hasOwnProperty(prop)) {
                    var p = this.get(prop);
                    p.drain(function () {
                        p.destroyAllNow();
                        if (+exited == props) { cb(); }
                    });
                }
            }
        }
    };

    return {
        mysql_pool: mysql_pool
    };
}());

exports.MySQLPool = MySQLPool;
*/
