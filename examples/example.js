var iodine = require('iodine');
var app = iodine();

/*
 * Define
 */
app.bean('bean', function () {});
app.bean('bean', ['dep1', 'dep2', function (dep1, dep2) {}]);

var bean = function (dep1, dep2) {};
bean.__inject = ['dep1', 'dep2'];
app.bean('bean', bean);

function bean(dep1, dep2) {};
bean.__inject = ['dep1', 'dep2'];
bean.__type = 'constructor';
app.bean(bean);

function bean(dep1, dep2) {};
bean.__inject = ['dep1', 'dep2'];
bean.__singleton = false;
bean.__type = 'factory';
app.bean(bean);

app.bean(bean, {
    inject: ['dep1', 'dep2'],
    singleton: false,
    type: 'factory'
});

/*
 * Inject (return function with injected dependencies)
 */
app.inject('bean');
app.inject(['dep1', 'dep2', function (dep1, dep2) {}]);

var bean = function (dep1, dep2) {};
bean.__inject = ['dep1', 'dep2'];
app.inject(bean);

/*
 * Run
 */
app.run('bean');
app.run(['dep1', 'dep2', function (dep1, dep2) {}]);

var bean = function (dep1, dep2) {};
bean.__inject = ['dep1', 'dep2'];
app.run(bean);

app.run(function () {
    // Start application
});

/*
 * Config (to be used with @Value('namespace.property')
 */
var config = {
    debug: false,
    server: {
        port: 3000
    },
    db: {
        hostname: 'localhost',
        port: 27071,
        name: 'test',
        collection: 'test'
    }
};
app.value(config);          // server.port
app.value('app', config);   // app.server.port
app.run(['#db.hostname', '#db.port', '#db.name', function (hostname, port, name) {
    db.connect(hostname, port, name);
}]);