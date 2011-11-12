var EasyClient = require('./easy_client');

function EasyMySQL(settings) {
    if (!(this instanceof EasyMySQL)) {
        return new EasyMySQL(settings);
    }
    var self = this;
    self.client = null;

    self.settings = settings;

    this.get_client = function (cb) {
        var self = this;
        if (self.client) {
            cb(null, self.client);
        } else {
            EasyClient.create(self.settings, function (err, client) {
                if (err) {
                    cb(err);
                } else {
                    self.client = client;
                    cb(null, client);
                }
            });
        }
    };
}

EasyMySQL.prototype.execute = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.get_client(function (err, easy_client) {
        if (err) {
            cb(err);
            if (easy_client) {
                easy_client.end();
            }
            return;
        } else {
            easy_client.query(sql, query_params, function (err, results) {
                if (err) {
                    cb(err, null);
                    if (easy_client) {
                        easy_client.end();
                    }
                    return;
                } else {
                    cb(null, results);
                    easy_client.end();
                }
            });
        }
    });
};

EasyMySQL.prototype.get_one = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.execute(sql, query_params, function (err, results) {
        if (err) {
            cb(err, null);
        } else if (results.length === 0) {
            cb(null, null);
        } else {
            cb(null, results[0]);
        }
    });
};

EasyMySQL.prototype.get_all = function (sql, query_params, cb) {
    var self = this;
    if (typeof query_params === 'function') {
        cb = query_params;
        query_params = [];
    }
    self.execute(sql, query_params, function (err, results) {
        if (err) {
            cb(err, null);
        } else if (results.length === 0) {
            cb(null, []);
        } else {
            cb(null, results);
        }
    });
};


EasyMySQL.prototype.getOne = function (sql, query_params, cb) {
    var self = this;
    return self.get_one(sql, query_params, cb);
};

EasyMySQL.prototype.getAll = function (sql, query_params, cb) {
    var self = this;
    return self.get_all(sql, query_params, cb);
};


module.exports = EasyMySQL;
