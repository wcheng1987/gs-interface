var request = require('../support/http');
var util = require('../../lib/util');

var url = '/audio_paper/public_timeline'

describe('AudioPaper public time line', function(){
	var lastModified = null;
	before(function(done){
    request()
		.get(url)
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('audioPaper')
			res.body.audioPaper.length.should.be.above(0)
			res.headers.should.have.property('last-modified')
			console.log('Last-Modified',res.headers['last-modified'])
			lastModified = res.headers['last-modified']
			done()
	  })
	})
	describe('#After succeed got Audio Paper public time line', function(){
		describe('##Then refresh', function(){
		  it('should get already update', function(done){
		    request()
				.get(url)
				.set('if-modified-since', lastModified)
				.expect(304, done)
		  })
		})
		describe('##Then got more data ', function(){
			it('should get next 10 data', function(done){
		    request()
				.get(url+'?start=11&end=20')
				.set('if-modified-since', lastModified)
				.expect(200, done)
				// .end(function(res){
				// 	console.log(res.body.audioPaper[0])
				// 	done()
				// })
			})
		  it('should get nothing when out of scope', function(done){
		    request()
				.get(url+'?start=9999901&end=9999910')
				.set('if-modified-since', lastModified)
				.expect(204, done)
		  })
		})
	})
})