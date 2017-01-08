var iodine = require('../index.js');

var app = iodine();

app.bean('foo', function () {
    console.log('foo called');
    this.value = 'foo';
}, { factory: false });

app.bean('bar', function () {
    console.log('bar called');
    this.value = 'bar';
}, { factory: false });

app.bean('foobar', ['foo', 'bar', function (foo, bar) {
    console.log('foobar called');
    this.foo = foo;
    this.bar = bar;
}], { factory: false });

app.run(['foo', 'bar', 'foobar', function (foo, bar, foobar) {
    console.log(foo, bar, foobar);
}]);