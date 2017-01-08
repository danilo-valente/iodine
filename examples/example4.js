var iodine = require('../index.js');

var app = iodine();

app.bean('foo', function () {
    console.log('foo called');
    return 'foo';
});

app.bean('bar', function () {
    console.log('bar called');
    return 'bar';
});

app.bean('foobar', function (foo, bar) {
    console.log('foobar called');
    return {
        foo: foo,
        bar: bar
    };
});

app.run(function (foo, bar, foobar) {
    console.log(foo, bar, foobar);
});