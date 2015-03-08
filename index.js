var _ = require('lodash');
var App = require('./lib/App.js');
var Injector = require('./lib/Injector.js');

var DEFAULT_CONFIG = {
    valueDelimiter: '#'
};

module.exports = function (config) {
    var cfg = _.extend({}, DEFAULT_CONFIG, config);
    return new App(new Injector(cfg.valueDelimiter));
};