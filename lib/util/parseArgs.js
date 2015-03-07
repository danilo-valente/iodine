/*
 * Based on Angular's injector.js
 * https://github.com/angular/angular.js/blob/0baa17a3b7ad2b242df2b277b81cebdf75b04287/src/auto/injector.js
 */

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

module.exports = function (fn) {
    if (fn.length === 0) {
        return [];
    }

    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    var args = argDecl[1].split(FN_ARG_SPLIT);
    return args.map(function(arg) {
        return arg.trim();
    });
};