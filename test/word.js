var should = require('should')
var Word = require('../model/word')
var json = require('./fixtures/word')

var word = new Word()
var validRecord = function(record) {
	record.should.be.a('object')
	for(var key in json.word[0]) {
		record.should.have.property(key)
	}
	record.partOfSpeech.length.should.above(0)	
}

var ids = json.word.map(function(word){
	return word._id;
})
var opt = {query:{_id:{$in:ids}}}

describe('Word Of Audio find', function(){
	it('should success find one', function(done){
    word.findOne(opt, function(err, record){
			should.not.exist(err)
			validRecord(record)
			done()
    })
  })
  it('should success find 10', function(done){
		opt.limit = {start:1,end:10}
    word.find(opt, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
  })
})