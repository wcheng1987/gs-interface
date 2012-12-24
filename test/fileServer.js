var Member = require('./support/member');
var file = require('./support/http.file');
var config = require('config.js').config;

var member = new Member();
var objectURL = 'http://'+config.host+':1339/files/audio/fat.mp3';
// var objectURL = 'http://'+config.host+':1339/files/audio/spend a lot of time with sb..mp3';
describe('File Server Unit Test', function(){
	before(function(done) {
	  member.auth(done)
	})
	describe('#GET binary data', function() {
		it('should success get '+objectURL, function(done) {
			file.get(member.session.sid, objectURL, function() {
				done();
			});
		})
	})
})
