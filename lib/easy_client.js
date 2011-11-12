var mysql = require('mysql');

function EasyClient(client, pool) {
    var self = this;
    self.client = client;
    self.pool = pool;
}

EasyClient.prototype.query = function (sql, query_params, cb) {
    var self = this;
    return self.client.query(sql, query_params, cb);
};

EasyClient.prototype.end = function () {
    var self = this;
    if (self.pool) {
        self.pool.release(self.client);
    } else {
        self.client.end();
    }
};

EasyClient.create = function (settings, cb) {
    var easy_client;
    if (settings.pool) {
        settings.pool.acquire(function (err, client) {
            if (err) {
                return cb(err);
            } else {
                easy_client = new EasyClient(client, settings.pool);
                cb(null, easy_client);
            }
        });
    } else {
        var client = mysql.createClient(settings);
        easy_client = new EasyClient(client);
        cb(null, easy_client);
    }
};

module.exports = EasyClient;
