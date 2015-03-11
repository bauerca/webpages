var iso = require('osh-iso-test');

var LOREM = '<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>';

var body = '';

for (var i = 0; i < 4; i++) {
  body += '<h3>Number ' + i + '</h3>' + LOREM;
}

body = '<h3>Did you notice any herky jerkiness?</h3>' +
  '<button id="yes">Yes</button>' +
  '<button id="no">No</button>' +
  body;

var firstRun = true;

var HistoryScroll = {
  read: function(pages, render) {
    setTimeout(render, 100);
  },

  render: function() {
    console.log('rendering view 1');
    document.body.innerHTML = body;
  },

  run: function() {
    if (!firstRun) {
      document.getElementById('yes').onclick = function() {
        iso.fail('History scroll was jerky');
      };

      document.getElementById('no').onclick = function() {
        document.body.innerHTML = '';
        iso.ok('History scroll was silky smooth.');
      };
    }
    firstRun = false;
  }
};

module.exports = HistoryScroll;
