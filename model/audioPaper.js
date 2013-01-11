var SimpleDO = require('../lib/simpleDO')
var config = require('config.js').config
var logger = require('log4js').getLogger('AudioPaper Model')
var AudioPaperWord = require('./audioPaperWord')
var EnglishSite = require('./englishSite')

function AudioPaper() {
	this.options.schema = 'gs_audiopaper'
	this.options.field = ['_id', 'creator_id', 'book_id', 'description', 'name', 'count', 
		'createtime AS createTime', 'wordcount AS wordCount', 'phresecount AS phraseCount', 
		'random', 'randomwordcount AS randomWordCount', 'randomphresecount AS randomPhraseCount'];
	this.relations = [new AudioPaperWord(), new EnglishSite()]
}

AudioPaper.prototype = new SimpleDO()
AudioPaper.prototype.find = function(opt, next) {
	this.options.query.site_id = {IS:'NOT NULL'}
	this.options.order = {_id:'ASC'}
	SimpleDO.prototype.find.apply(this, arguments)
}
AudioPaper.prototype.makeup = function(wordQuestions, sites, next) {
	this.recordset.forEach(function(audioPaper) {
		var index = null
		audioPaper.wordQuestion = wordQuestions.filter(function(wq, idx){
			var found = (wq.paper_id === audioPaper._id)
			if(found) {
				if(!index) index = idx
				delete wq.paper_id
			}
			return found
		})
		wordQuestions.splice(index, audioPaper.wordQuestion.length)
		
		index = null
		sites.some(function(site, idx){
			var found = (site.paper_id === audioPaper._id)
			if(found) {
				if(!index) index = idx
				delete site.paper_id
				audioPaper.englishSite = site
			}
			return found
		})
		sites.splice(index, 1)
	})
	next(null, this.recordset)
}

exports = module.exports = AudioPaper