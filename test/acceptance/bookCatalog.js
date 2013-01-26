var request = require('../support/http');

var url = '/book_catalogs'
var catalog = "初中"
var parentID = 1
var level = 0

describe('Book Catalog', function(){
  it('should success get 30 catalog which level: '+level, function(done){
    request()
		.get(url+'?level='+level)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			done()
		})
  })
  it('should success get catalog '+catalog, function(done){
    request()
		.get(url+'?name='+catalog)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			res.body.bookCatalog[0].should.have.property('name', catalog)
			done()
		})
  })
	it('should success get catalog which parent id:'+parentID, function(done){
		request()
		.get(url+'?parent_id='+parentID)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			res.body.bookCatalog[0].should.have.property('parent_id', ''+parentID)
			done()
		})
	})
})