var request = require('../support/http')
var file = require('../support/http.file')
var EventProxy = require("eventproxy").EventProxy

var words = []
var brokenWords = []

describe('Word Resouce Check', function(){
	this.timeout(1800000)
	before(function(done){
		console.info('GET All Word...')
	  request()
		.get('/words')
		.end(function(res){
			res.statusCode.should.equal(200)
			res.should.be.json
			res.body.should.have.property('word')
			words = res.body.word;
			console.info('Start Check %d words', words.length)
			done()
		})
	})
	
	it('should download ALL Words', function(done){
		var ep = new EventProxy()
		ep.after('word_done', words.length, function(){
			done()
		})
		
		words.forEach(function(word){
			file.get('', word.audio, function(statusCode){
				if(statusCode != 200) {
					// console.info(encodeURI(word.audio))
					// console.info(word.audio)
					brokenWords.push(word._id+'|'+word.word+':'+word.audio+' status='+statusCode);
				}
				ep.trigger('word_done', statusCode)
			})
		})
	})
	
	after(function(){
	  console.info('#Check Completed')
		console.info('Pass:', words.length-brokenWords.length)
		if(brokenWords.length > 0) {
			console.error('Broken:', brokenWords.length)
			console.info('Broken Detail:')
			console.error(brokenWords.join("\n"))
		}
	})
})