var should = require('should')
var BookCatalog = require('../model/bookCatalog')
var json = require('./fixtures/bookCatalog')

var bookCatalog = new BookCatalog()
var validRecord = function(record) {
	record.should.be.a('object')
	for(var key in json.bookCatalog[0]) {
		record.should.have.property(key)
	}
}

describe('BookCatalog Of Audio find', function(){
  it('should success find one', function(done){
    bookCatalog.findOne({query:{name:"初中"}}, function(err, record){
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
    bookCatalog.find({query:{level:0}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			done()
    })
	})
	it('should succeed find all by parent catalog', function(done){
    bookCatalog.find({query:{parent_id:1}}, function(err, rs){
			should.not.exist(err)
			rs.every(validRecord)
			console.log(rs)
			done()
    })
	})
})