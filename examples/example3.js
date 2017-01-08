var iodine = require('../index.js');

var app = iodine();

app.value({
    debug: false,
    server: {
        port: 3000
    }
});

app.value('db', {
    hostname: 'localhost',
    port: 27071,
    name: 'test',
    collection: 'test'
});

app.value('debug', true);
app.value('author', 'Danilo Valente');
app.value('db.admin', 'DBA');
app.value('db.port', 28081);

app.run(['#', '#server.port', '$app', function (values, port, $app) {
    console.log(values);
    console.log('Running server on port ', port);
    console.log('Running DB on port ', $app.value('db.port'));
}]);

app.value({
    foo: 'bar'
});

app.run(['#', function ($values) {
    console.log($values);
}]);