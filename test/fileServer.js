var Member = require('./support/member');
var file = require('./support/http.file');

var member = new Member();
var host = process.env.SERVER_HOST||'127.0.0.1'
var objectURL = 'http://'+host+':1339/files/audio/spend a lot of time with sb..mp3';
// var objectURL = 'http://'+host+':1339/files/audio/look the same.mp3';
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
