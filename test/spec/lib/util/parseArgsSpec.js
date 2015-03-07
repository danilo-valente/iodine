var expect = require('expect.js');
var parseArgs = require('../../../../lib/util/parseArgs.js');

describe('lib/util/parseArgs', function () {

    it('should match "foo" and "bar" arguments of an anonymous function', function () {
        var fn = function (foo, bar) {};
        var args = parseArgs(fn);

        expect(args).to.eql(['foo', 'bar']);
    });

    it('should match "foo" and "bar" arguments of a named function', function () {
        function fn(foo, bar) {};
        var args = parseArgs(fn);

        expect(args).to.eql(['foo', 'bar']);
    });

    it('should match "foo" and "bar" arguments of a function that contains a function declaration in its body', function () {
        function fn(foo, bar) {
            return function (quux) {};
        }
        var args = parseArgs(fn);

        expect(args).to.eql(['foo', 'bar']);
    });

    it('should ignore comments in the header', function () {
        var fn = function (/* string */ foo /* a foo */,
                           /* string */ bar /* a bar */) {};
        var args = parseArgs(fn);

        expect(args).to.eql(['foo', 'bar']);
    });
});