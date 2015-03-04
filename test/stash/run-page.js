var Page = require('osh-page');

module.exports = Page.extend({
  path: {
    pattern: '/stash'
  },

  get: function(done) {
    var props = this.props;
    this.title = 'Test stash()';
    var article = {
      title: 'Lorem Ipsum',
      text: (
'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis ' +
'nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in ' +
'culpa qui officia deserunt mollit anim id est laborum.'
      )
    };
    this.body = (
      '<h1>' + article.title + '</h1>' +
      '<p id="ipsum">' + article.text + '</p>'
    );
    this.stash.title = article.title;
    done();
  },

  /**
   *  Before the first run. Aggregate data from stash and document.
   */

  run: function() {
    var fail;
    // The text is always in the document at this point.
    var article = {
      title: this.stash.title,
      text: document.getElementById('ipsum').textContent,
    };

    if (/incididunt/.test(document.getElementById('__recovery').textContent)) {
      fail = 'full text found in stash';
    }
    if (!/incididunt/.test(article.text)) {
      fail = 'text not in dom';
    }
    //console.log(document.getElementById('__stash').textContent);
    document.location = (
      fail ?
      '/?result=Failure: ' + fail :
      '/?result=Success'
    );
  }
});
