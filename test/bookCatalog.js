var should = require('should')
var BookCatalog = require('../model/bookCatalog')
var json = require('./fixtures/bookCatalog').bookCatalog[0]

var bookCatalog = new BookCatalog()
var validRecord = function(record) {
	record.should.be.a('object')
	for(var key in json) {
		record.should.have.property(key)
	}
}

describe('BookCatalog', function(){
  it('should success find one', function(done){
    bookCatalog.findOne({query:{name:json.name}}, function(err, record){
			should.not.exist(err)
			validRecord(record)
			done()
    })
  })
  it('should success find thirty', function(done){
    bookCatalog.find({limit:{start:1,end:30}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
  })
  it('should success find all', function(done){
    bookCatalog.find(function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
  })
	it('should success find top level catalog', function(done){
    bookCatalog.find({query:{level:json.level}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
	})
	it('should succeed find all by parent catalog', function(done){
    bookCatalog.find({query:{parent_id:json.parent_id}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
	})
})