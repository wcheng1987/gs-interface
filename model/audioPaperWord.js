var SimpleDO = require('../lib/simpleDO')

function AudioPaperWord() {
	this.options = {
		schema:'gs_audiopaperword',
		field:['wordid AS word_id', 'sort', 'paper_id'],	
		query: {},
		order: {
			paper_id:'ASC',
			wordid:'ASC',
			sort:'ASC'
		}
	}
	this.foreignkey = 'paper_id'
}

AudioPaperWord.prototype = new SimpleDO()

exports = module.exports = AudioPaperWord