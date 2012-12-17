
var get = exports.get = function(session, member, done) {
  session.get('/members/'+member._id+'/audio_paper', function(res) {
		res.statusCode.should.be.below(300);
		if(res.statusCode === 200) {
			res.should.be.json;
			res.body.should.have.property('member');
			member.member = res.body.member;
			member.words = res.body.word||[];
		}
		done()
  });
}
