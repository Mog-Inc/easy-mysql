var path = require('path');
require.paths.unshift(path.dirname(__dirname) + '/lib');

try {
    var settings = require('./settings');
} catch (e) {
    console.log('Skipping. See test/settings.template.js for more information.');
    process.exit(0);
}

exports.database = 'easy_mysql_test';
exports.settings = settings;
