var RunPrivately = require('../privately/run');
var extend = require('xtend/mutable');

var RunPrivatelyAjax = extend(RunPrivately, {
  run: function(pages) {
    pages.go('/?refresh=true');
  }
});

module.exports = RunPrivatelyAjax;
