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

describe('Word Of Audio find', function(){
  it('should success find one', function(done){
    word.findOne({}, function(err, record){
			should.not.exist(err)
			validRecord(record)
			done()
    })
  })
  it('should success find ten', function(done){
    word.find({limit:{start:1,end:10}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
  })
})