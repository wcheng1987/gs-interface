var request = require('../support/http');

var url = '/book_catalogs'
var catalog = "初中"

describe('Book Catalog', function(){
  it('should success get 30 top level catalog', function(done){
    request()
		.get(url+'?level=0')
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
		.get(url+'?grade='+catalog)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			res.body.bookCatalog[0].should.have.property('name', catalog)
			done()
		})
  })
})