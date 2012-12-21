var Member = require('./support/member');
var file = require('./support/http.file');

var member = new Member();

var objectURL = 'http://www.jszx100.com:1339/files/audio/spend a lot of time with sb..mp3';
// var objectURL = 'http://www.jszx100.com:1339/files/audio/look the same.mp3';
describe('File Server Unit Test', function(){
	before(function(done){
	  member.auth(done)
	})
	describe('#GET ', function() {
		it('should success get binary data', function(done) {
			file.get(member.session.sid, objectURL, function() {
				done();
			});
		})
	})
})
