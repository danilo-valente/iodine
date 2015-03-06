var _ = require('lodash');
var uber = require('uber.js');
var Bean = require('./Bean.js');
var Injector = require('./Injector.js');

const DEFAULT_CONFIG = {
    valueDelimiter: '#'
};

var App = function (config) {
    this.config = _.extend({}, DEFAULT_CONFIG, config);
    this.injector = new Injector(this.config.valueDelimiter);

    this.bean('$global', function () {
        return global;
    });

    var self = this;
    this.bean('$app', function () {
        return self;
    });

    this.bean('$config', function () {
        return self.config;
    });

    this.bean('$values', ['#', function (values) {
        return values;
    }]);
};

App.prototype._bean = function (name, fn, config, injectCfg) {
    var bean = initBean(name, fn, config, injectCfg);
    return this.injector.bean(bean);
};

App.prototype.bean = uber({

    'function': function (fn) {
        // TODO: Angular-like dependencies inference
        this._bean(fn.name, fn, {}, {});
    },

    'string,function': function (name, fn) {
        this._bean(name, fn, {}, {});
    },

    'array': function (def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        this._bean(fn.name, fn, {}, { inject: inject });
    },

    'string,array': function (name, def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        this._bean(name, fn, {}, { inject: inject });
    },

    'function,plain': function (fn, config) {
        this._bean(fn.name, fn, config, {});
    },

    'array,plain': function (def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        this._bean(fn.name, fn, config, { inject: inject });
    },

    'string,array,plain': function (name, def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        this._bean(name, fn, config, { inject: inject });
    },

    'string,function,plain': function (name, fn, config) {
        this._bean(name, fn, config, {});
    }
});

App.prototype.value = uber({

    'plain': function (val) {
        this.injector.setValue(null, val);
    },

    'string,*': function (path, val) {
        this.injector.setValue(path, val);
    },

    '': function () {
        return this.injector.getValue(null);
    },

    'string': function (path) {
        return this.injector.getValue(path);
    }
});

App.prototype._inject = function (fn, config, injectCfg) {
    var bean = initBean(null, fn, config, injectCfg);
    return this.injector.inject(bean);
};

App.prototype.inject = uber({

    'string': function (name) {
        var bean = this.injector.get(name);
        return this.injector.inject(bean);
    },

    'function': function (fn) {
        // TODO: Angular-like dependencies inference
        return this._inject(fn, {}, {});
    },

    'array': function (def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._inject(fn, {}, { inject: inject });
    },

    'array,plain': function (def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._inject(fn, config, { inject: inject });
    },

    'function,plain': function (fn, config) {
        return this._inject(fn, config, {});
    }
});

App.prototype._run = function (fn, config, injectCfg) {
    var bean = initBean(null, fn, config, injectCfg);
    return this.injector.init(bean);
};

App.prototype.run = uber({

    'string': function (name) {
        var bean = this.injector.get(name);
        return this.injector.init(bean);
    },

    'function': function (fn) {
        // TODO: Angular-like dependencies inference
        return this._run(fn, {}, {});
    },

    'array': function (def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._run(fn, {}, { inject: inject });
    },

    'array,plain': function (def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._run(fn, config, { inject: inject });
    },

    'function,plain': function (fn, config) {
        return this._run(fn, config, {});
    }
});

module.exports = App;

function initBean(name, fn, config, injectCfg) {
    var cfg = _.extend({}, getAnnotations(fn), config, injectCfg);
    return new Bean(name, fn, cfg);
}

function getAnnotations(fn) {
    return {
        inject: fn.__inject,
        singleton: fn.__singleton,
        factory: fn.__factory
    };
}