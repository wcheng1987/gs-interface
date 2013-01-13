var should = require('should')
var AudioPaper = require('../model/audioPaper')
var util = require('../lib/util')
var json = require('./fixtures/audioPaper')

var ap = new AudioPaper()
var validRecord = function(record) {
	record.should.be.a('object')
	for(var key in json.audioPaper[0]) {
		record.should.have.property(key)
	}
}

describe('AudioPaper find', function(){
	it('should success find one', function(done){
		ap.findOne({}, function(err, record) {
			should.not.exist(err)
			validRecord(record)
			done()
		})
	})
	it('should success find 10', function(done){
		var opt = {
			query: {
				creator_id:4
			},
			limit: {
				start:1,
				end:10
			}	
		}
    ap.find(opt, function(err, rs) {
			should.not.exist(err)
			rs.should.be.an.instanceOf(Array)
			rs.length.should.above(0)
			rs.forEach(validRecord)
			done()
    })
	})
	var bookID = 4
	it('should success find by book '+bookID, function(done){
	  ap.find({query:{book_id:bookID}}, function(err, rs){
	  	should.not.exist(err)
			// console.log(rs)
			rs.should.be.an.instanceOf(Array)
			rs.length.should.above(0)
			rs.forEach(validRecord)
			done()
	  })
	})
})
