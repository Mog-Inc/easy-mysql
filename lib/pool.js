var poolModule = require('generic-pool');
var path       = require('path');
var sys = require('sys');

// TODO: or should this be named 'create'?
function get(settings) {
    var db = settings.db;
    return poolModule.Pool({
        name : 'mysql_' + db,

        create : function (callback) {
            var mysql = require('mysql');
            var client = mysql.createClient(settings);
            callback(null, client);
        },

        destroy : function (client) {
            client.end();
        },

        max : settings.max_connections || 10,

        idleTimeoutMillis : settings.idle_timeout || 5000,

        log : (typeof(settings.debug) === 'undefined') ? false : settings.debug

    });
}

exports.get = get;
