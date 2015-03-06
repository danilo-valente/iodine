var _ = require('lodash');

var Bean = function (name, fn, config) {
    config = config || {};

    // name (default = '')
    this.name = name !== undefined ? String(name) : '';

    // fn
    if (!_.isFunction(fn)) {
        throw new Error('fn must be a function');
    }
    this.fn = fn;

    // inject (default = [])
    var inject = config.inject;
    if (_.isString(inject)) {
        inject = [inject];
    }
    this.inject = _.isArray(inject) ? inject : [];

    // factory (default = true)
    this.factory = config.factory !== false;

    // singleton (default = true)
    this.singleton = config.singleton !== false;
};

module.exports = Bean;