var path = require('path');
var _ = require('lodash');
var uber = require('uber.js');
var Bean = require('./Bean.js');
var parseArgs = require('./util/parseArgs.js');

var App = function (injector, logger) {
    this._injector = injector;
    this._logger = logger;

    this.bean('$global', function () {
        return global;
    });

    var self = this;
    this.bean('$app', function () {
        return self;
    });

    this.bean('$values', ['#', function (values) {
        return values;
    }]);
};

App.prototype._bean = function (name, fn, config, injectCfg) {
    var bean = initBean(name, fn, config, injectCfg);
    this._injector.bean(bean);
    return this;
};

App.prototype.bean = uber({

    'function': function (fn) {
        var inject = parseArgs(fn);
        return this._bean(fn.name, fn, {}, { inject: inject });
    },

    'string,function': function (name, fn) {
        var inject = parseArgs(fn);
        return this._bean(name, fn, {}, { inject: inject });
    },

    'array': function (def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._bean(fn.name, fn, {}, { inject: inject });
    },

    'string,array': function (name, def) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._bean(name, fn, {}, { inject: inject });
    },

    'function,plain': function (fn, config) {
        return this._bean(fn.name, fn, config, {});
    },

    'array,plain': function (def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._bean(fn.name, fn, config, { inject: inject });
    },

    'string,array,plain': function (name, def, config) {
        var fn = _.last(def);
        var inject = _.initial(def);
        return this._bean(name, fn, config, { inject: inject });
    },

    'string,function,plain': function (name, fn, config) {
        return this._bean(name, fn, config, {});
    }
});

App.prototype.value = uber({

    'plain': function (val) {
        this._injector.setValue(null, val);
    },

    'string,*': function (path, val) {
        this._injector.setValue(path, val);
    },

    '': function () {
        return this._injector.getValue(null);
    },

    'string': function (path) {
        return this._injector.getValue(path);
    }
});

App.prototype._inject = function (fn, config, injectCfg) {
    var bean = initBean(null, fn, config, injectCfg);
    return this._injector.inject(bean);
};

App.prototype.inject = uber({

    'string': function (name) {
        var bean = this._injector.get(name);
        return this._injector.inject(bean);
    },

    'function': function (fn) {
        var inject = parseArgs(fn);
        return this._inject(fn, {}, { inject: inject });
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
    return this._injector.inject(bean)();    // Prevent caching
};

App.prototype.run = uber({

    'string': function (name) {
        var bean = this._injector.get(name);
        return this._injector.init(bean);
    },

    'function': function (fn) {
        var inject = parseArgs(fn);
        return this._run(fn, {}, { inject: inject });
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

App.prototype.import = uber({

    'string': function (filename) {
        this.import(filename, false);
        return this;
    },

    'string,bool': function (filename, keyAsName) {
        var exported = requireParent(filename);
        this.import(exported, keyAsName);
        return this;
    },

    'plain': function (exports) {
        this.import(exports, false);
        return this;
    },

    'plain,bool': function (exports, keyAsName) {
        _.each(exports, function (obj, key) {
            try {
                if (keyAsName) {
                    this.bean(key, obj);
                } else {
                    this.bean(obj);
                }
            } catch (err) {
                this._logger('warning', 'Could not import bean: ' + err);
            }
        }, this);
        return this;
    },

    'function': function (exports) {
        try {
            this.bean(exports);
        } catch (err) {
            this._logger('warning', 'Could not import bean: ' + err);
        }
        return this;
    },

    'array': function (exports) {
        try {
            this.bean(exports);
        } catch (err) {
            this._logger('warning', 'Could not import bean: ' + err);
        }
        return this;
    }
});

App.prototype.require = uber({

    'string': function (filename) {
        var exported = requireParent(filename);
        return this.run(exported);
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

function requireParent(filename) {
    var parentDir = path.dirname(module.parent.parent.filename); // Refer to the file that required iodine
    var modulePath = path.join(parentDir, '/', filename);
    return require(modulePath);
}