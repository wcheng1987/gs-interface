var config = require('config.js').config;
var Member = require('./support/member');
var file = require('./support/http.file');
var files = require('./fixtures/files.json');

var member = new Member();
describe('File Server Unit Test', function(){
	before(function(done) {
	  member.auth(done)
	})
	describe('#GET binary data', function() {
		files.locals.forEach(function(filename) {
			var objectURL = 'http://'+config.host+':1339/files/audio/'+filename;
			it('should success get '+objectURL, function(done) {
				file.get(member.sid, objectURL, function() {
					done();
				});
			})
		})
	})
})
