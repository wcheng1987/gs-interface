var should = require('should')
var AudioPaper = require('../model/audioPaper')
var util = require('../lib/util')
var json = require('./fixtures/audioPaper').audioPaper[0]

var ap = new AudioPaper()
var validRecord = function(record) {
	record.should.be.a('object')
	for(var key in json) {
		record.should.have.property(key)
	}
}

describe('AudioPaper', function(){
	it('should success find one', function(done){
		ap.findOne(function(err, record) {
			should.not.exist(err)
			validRecord(record)
			done()
		})
	})
	it('should success find 10 by creator id:'+json.creator_id, function(done){
		var opt = {
			query: {
				creator_id:json.creator_id
			},
			limit: {
				start:1,
				end:10
			}	
		}
    ap.find(opt, function(err, data) {
			should.not.exist(err)
			data.should.be.an.instanceOf(Array)
			data.length.should.above(0)
			data.forEach(validRecord)
			done()
    })
	})
	it('should succeed find by book_id:'+json.book_id, function(done){
	  ap.find({query:{book_id:json.book_id}}, function(err, data){
			should.not.exist(err)
			data.should.be.an.instanceOf(Array)
			data.length.should.above(0)
			data.forEach(validRecord)
			done()
	  })
	})
})
