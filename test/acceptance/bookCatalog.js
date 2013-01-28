var request = require('../support/http');
var json = require('../fixtures/bookCatalog').bookCatalog[0]

var url = '/book_catalogs'

describe('Book Catalog', function(){
  it('should success get 30 catalog which level: '+json.level, function(done){
    request()
		.get(url+'?level='+json.level)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			done()
		})
  })
  it('should success get catalog: '+json.name, function(done){
    request()
		.get(url+'?name='+json.name)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			res.body.bookCatalog[0].should.have.property('name', json.name)
			done()
		})
  })
	it('should success get catalog which parent id:'+json.parent_id, function(done){
		request()
		.get(url+'?parent_id='+json.parent_id)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('bookCatalog')
			res.body.bookCatalog.length.should.be.above(0)
			res.body.bookCatalog[0].should.have.property('parent_id', ''+json.parent_id)
			done()
		})
	})
})