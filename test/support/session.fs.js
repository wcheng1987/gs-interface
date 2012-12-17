var should = require('should');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');

exports.get = function(sid, objectURL, done) {
  var cookie = request.cookie(sid);
  var j = request.jar();
  j.add(cookie);
  var r = request.defaults({jar:j});
	
  var pathname = url.parse(objectURL).pathname;
  var basename = path.basename(pathname);
	pathname = __dirname+'/tmp/';
	if (!fs.existsSync(pathname)) fs.mkdirSync(pathname);
	pathname += basename;
	if (fs.existsSync(pathname)) return done();
  var ws = fs.createWriteStream(pathname);

  r(encodeURI(objectURL), function(err, res, body) {
		should.not.exist(err);
    res.statusCode.should.equal(200);
    res.should.have.header('content-length');
    var ct = parseInt(res.headers['content-length']);
    fs.stat(pathname, function(ferr, stats) {
        stats.size.should.equal(ct);
        done();
    });
  })
  .pipe(ws);
};