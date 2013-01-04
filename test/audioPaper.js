var ap = require('../lib/audioPaper')
var util = require('../lib/util');

describe('AudioPaper find', function(){
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
    ap.find(opt, function(data) {
			// console.log(data.member.audioPaper)
			/*For date json and string same value but different format*/
			data.should.have.property('member')
			done()
    }, done)
	})
})

describe('AudioPaper publicTimeLine', function(){
	var req = {headers:{},query:{}}
	,	res = {
		send:function(code) {
			should.not.exist(code)
		}
	}
  it('should success get last 10 without update time', function(done) {
		res.json = function(json) {
			// console.log(json)
			json.should.have.property('audioPaper')
			json.audioPaper.length.should.be.above(0)
			done()
		}
    ap.publicTimeLine(req, res, done)
  })
	it('should not get data', function(done){
		req.headers = {
			'if-modified-since':util.getNow()
		}
		res.send = function(code) {
			// console.log(code)
			code.should.equal(304)
			done()
		}
	  ap.publicTimeLine(req, res, done)
	})
})