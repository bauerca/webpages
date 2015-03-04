var webpages = require('..');
var express = require('express');
var expect = require('expect.js');
var supertest = require('supertest');
var async = require('async');
var morgan = require('morgan');
var http = require('http');
var host = require('osh-test-host');
var iso = require('osh-iso-test');


describe('webpages', function() {
  describe('server', function() {
    it('should bundle', function(done) {
      this.timeout(10.e3);
      var pages = webpages({
        basedir: __dirname + '/bundling',
        routes: './routes',
        layout: './layout'
      });

      pages.set('home', './home-page');
      pages.set('help', './help-page');

      pages.bundle({output: __dirname + '/bundles'});
      pages.on('bundled', function(entryInfo) {
        //console.log(JSON.stringify(entryInfo, null, 2));
        expect(entryInfo.home.length).to.be(4);
        expect(entryInfo.help.length).to.be(4);
        done();
      });
    });

    describe('routing', function() {
      it('should fall through when no route', function(done) {
        var pages = webpages({
          basedir: __dirname + '/no-route',
          routes: 'routes',
          layout: 'layout'
        });

        var app = express();
        app.use(pages);
        app.use(function(req, res) {
          res.status(404).send('some 404 message');
        });

        var request = supertest(app);
        request.get('/some/url')
        .expect(404, /some 404 message/, done);
      });

      it('should fall through on POST to read-only page', function(done) {
        var pages = webpages({
          basedir: __dirname + '/readonly',
          routes: 'routes',
          layout: 'layout'
        });

        pages.set('readonly', './readonly');

        var app = express();
        app.use(pages);
        app.use(function(req, res) {
          res.status(404).send('some 404 message');
        });

        var request = supertest(app);

        request.get('/readonly')
        .expect(200, function(err, res) {
          if (err) return done(err);

          request.post('/readonly')
          .expect(404, /some 404 message/, done);
        });
      });

    });

    describe('secrets', function() {
      var request;

      before(function() {
        var pages = webpages({
          basedir: __dirname + '/secrets',
          routes: 'routes',
          layout: 'layout'
        });

        pages.set('set-fail', './set-fail');
        pages.set('set-success', './set-success');

        pages.fn('setIt', function(opts, done) {
          this.session.setSecrets({secret: 'sshh'});
          done();
        });

        var app = express();
        app.use(pages);
        app.use(function(err, req, res, next) {
          res.status(500).send(err.message)
        });

        request = supertest(app);
      });

      it('should disallow setting secret', function(done) {
        request.get('/set-fail')
        .expect(500, /undefined/, done);
      });

      it('should set a secret', function(done) {
        request.get('/set-success')
        .expect('set-cookie', /sshh/)
        .expect(200, done);
      });
    });

    describe('csrf', function() {
      it('should place token in html', function(done) {
        var pages = webpages({
          basedir: __dirname + '/csrf',
          routes: 'routes',
          layout: 'layout'
        });

        pages.set('csrf', './csrf');

        var app = express();
        app.use(pages);

        supertest(app).get('/csrf')
        .expect(200, /^_csrf_tokey=[0-9a-zA-Z-_]+$/, done);
      });
    });
  });

  describe('iso', function() {
    
    it('should pass all tests', function(done) {
      this.timeout(0);
      iso({
        basedir: __dirname + '/iso',
        debug: true,
        manual: true
      }, done);
    });

  });

//    //  Each name is a subdirectory of the test directory
//    //  that contains an index.js file that exports a
//    //  name/page-path mapping.
//    //
//    //  The mapping should have a homepage that runs a test
//    //  when the 
//    var tests = [
//      'interrupt',
//      'redirector',
//      'stash'
//      //'visit',
//    ];
//
//    var runner = express();
//    runner.use(morgan('combined'));
//
//    before(function(done) {
//
//      async.each(
//        tests,
//        function(test, done) {
//          var pages = webpages();
//          var dir = __dirname + '/' + test;
//          var init = require(dir);
//          init(pages); 
//          pages.on('bundled', function() {
//            runner.use(pages.app);
//            done();
//          });
//        },
//        done
//      );
//    });
//
//    before(function(done) {
//      var i = -1;
//      var results = [];
//      runner.get('/', function(req, res) {
//        var result = req.query.result;
//        var nextTest;
//        if (result) {
//          nextTest = tests[++i];
//          results.push(result);
//        }
//        else {
//          i = 0;
//          nextTest = tests[i];
//          results = [];
//        }
//        res.send(
//          '<html><body>' +
//          '<ul>' +
//          results.map(function(result, index) {
//            return '<li>' + tests[index] + ': ' + result + '</li>';
//          }).join('') +
//          '</ul>' +
//          (
//            nextTest ?
//            '<script>document.location = "/' + nextTest + '";</script>' :
//            ''
//          ) +
//          '</body></html>'
//        );
//      });
//
//      server = http.createServer(runner);
//      server.listen(host.port, done);
//    });
//
//    /**
//     *  Test stuff.
//     */
//
//    it('should complete browser tests', function(done) {
//      this.timeout(0);
//      console.log('Browser to http://localhost:3333. Ctrl-C to finish.');
//      process.on('SIGINT', function() {
//        console.log('Stopping server...');
//        server && server.close();
//        process.exit();
//      });
//    });
//  });
});
