var Member = require('../support/member')
var json = require('../fixtures/word')

var member = new Member()

var ids = json.word.map(function(word){
	return word._id;
})
var noneIDs = [-1];

describe('Word Get', function() {
	before(function(done){
	  member.auth(done)
	})
	it('should success get all with ids', function(done) {
		member.get('/words?ids='+ids.join(), function(res){
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('word').with.lengthOf(ids.length)
			done()
		})
	})	
	it('should not get any with ids', function(done){
		member.get('/words?ids='+noneIDs.join(), function(res){
			res.statusCode.should.equal(204)
			done()
		})
	})
	it('should success get partial with ids', function(done) {
		var ids2 = ids.concat(noneIDs)
		member.get('/words?ids='+ids2.join(), function(res){
			res.statusCode.should.equal(206)
			res.should.be.json
			res.body.should.have.property('word')
			res.body.word.length.should.below(ids2.length)
			done()
		})
	})		
	it('should success get 10 without ids', function(done){
		member.get('/words?start=1&&end=10', function(res){
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('word').with.lengthOf(10)
			done()
		})
	})
})