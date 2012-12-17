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
		self.member.friendgroup = res.body.member.friendgroup;
		if(done) done();
  })
	return this;
}

Member.prototype.getAudioPaper = function(user, done) {
	var self = this;
	var member = user;
	if(undefined == this.member._id) throw new Error('Session had not been auth!!')
  this.session.get('/members/'+member._id+'/audio_paper', function(res) {
		res.statusCode.should.be.below(300);
		if(res.statusCode === 200) {
			res.should.be.json;
			res.body.should.have.property('member')
			// console.log('222 '+res.body.member, member._id)
			res.body.member.should.have.property('_id')
			// res.body.member._id.eql(member._id)
			self.member.audioPaper = res.body.member.audioPaper;
			self.words = res.body.word||[];
		}
		if(done) done();
  })
	return this;
}
