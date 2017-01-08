var iodine = require('../index.js');

var app = iodine({
    logger: function (type, message) {
        console.log(type, message);
    }
});

app.import(function bean1() {
    return 1;
});

app.import([function bean2() {
    return 2;
}]);

app.import({
    bean3: function bean3() { return 3; },
    bean4: [function bean4() { return 4; }]
});

app.import({
    bean5: function () { return 5; },
    bean6: [function () { return 6; }]
}, true);