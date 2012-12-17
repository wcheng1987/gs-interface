var fileServer = (../lib/fileServer);

describe('#File Server Unit Test', function(){
	describe('##GET test', function() {
		it('Should success get binary data', function(done) {
			fileServer.get(req, res, function() {
				done();
			});
		})
	})
})
