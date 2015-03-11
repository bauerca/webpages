var iso = require('osh-iso-test');
var runs = 0;
var renders = 0;

var HistoryCacheRun = {
  read: function(pages, render) {
    if (typeof window !== 'undefined') {
      iso.fail('Read was called in the browser; should have used cache.');
    }
    else {
      render();
    }
  },

  render: function() {
    // Render should be called once.
    renders++;

    if (renders > 1) {
      iso.fail('Render was called more than once.');
    }
  },

  run: function(pages) {
    // Run should be called twice.
    runs++;
    console.log('running history-cache');

    if (runs === 2) {
      iso.ok('page.read() was skipped.');
    }
    else {
      pages.go('back', {});
    }
  }
};

module.exports = HistoryCacheRun;
