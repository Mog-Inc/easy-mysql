var path = require('path');
require.paths.unshift(path.dirname(__dirname) + '/lib');

function clone(object) {
    var ret = {};
    Object.keys(object).forEach(function (val) {
        ret[val] = object[val];
    });
    return ret;
}

try {
    var settings = require('./settings');
} catch (e) {
    console.log('Skipping. See test/settings.template.js for more information.');
    process.exit(0);
}

exports.database = 'easy_mysql_test';
exports.settings = settings;
exports.clone    = clone;
