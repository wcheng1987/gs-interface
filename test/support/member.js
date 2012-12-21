var Session = require('./session');
// var fs = require('../support/session.fs');
// var audioPaper = require('./audioPaper');
var users = require('../json/users');

module.exports = Member

function Member() {
	this.member = {}
	this.session = new Session()
}

// Friend.prototype.__proto__ = Session.prototype;
Member.prototype.auth = function(user, done) {
	if(typeof user === 'function') {
		done = user
		user = users.gaojun
	}
	
	var self = this;
  this.session.post('/login', user, function(res) {
    res.statusCode.should.equal(200);
    res.should.be.json;
    res.body.should.have.property('member');
		self.member = res.body.member;
		if(done) done();
  })
}

Member.prototype.getFriends = function(done) {
	var self = this;
	var member = this.member;
	if(undefined == this.member._id) throw new Error('Session had not been auth!!')
  this.session.get('/members/'+member._id+'/friends', function(res) {
    res.statusCode.should.equal(200);
    res.should.be.json;
    res.body.should.have.property('member');
		self.member.friendgroup = res.body.member.friendgroup || [];
		if(done) done();
  })
	return this;
}

Member.prototype.getAudioPaper = function(user, done) {
	if(undefined == this.member._id) throw new Error('Session had not been auth!!')
  this.session.get('/members/'+user._id+'/audio_paper', function(res) {
		res.statusCode.should.be.below(300);
		user.audioPaper = []
		user.words = []
		if(res.statusCode === 200) {
			res.should.be.json;
			res.body.should.have.property('member')
			res.body.member.should.have.property('_id')
			user.audioPaper = res.body.member.audioPaper;
			user.words = res.body.word;
		}
		// console.log('111', res.statusCode, user)
		if(done) done();
  })
	return this;
}
