var request = require('../support/http');
var util = require('../../lib/util');

describe('AudioPaper public time line', function(){
  it('should success get last 10', function(done){
    request()
		.get('/audio_paper/public_timeline')
		.end(function(res) {
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('audioPaper')
			res.body.audioPaper.length.should.be.above(0)
			done()
		})
  })
  it('should not get data', function(done){
    request()
		.get('/audio_paper/public_timeline')
		.set('if-modified-since', util.addMonthFromNow(0))
		.end(function(res) {
			res.statusCode.should.equal(304)
			done()
		})
  })
})