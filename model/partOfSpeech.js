var SimpleDO = require('../lib/simpleDO')

function PartOfSpeech() {
	this.options = {
		schema:'gs_partofspeech',
		query:{},
		order: {
			word_id:'ASC',
			sort:'ASC'
		}
	}
	this.foreignkey = 'word_id'
}

PartOfSpeech.prototype = new SimpleDO()

exports = module.exports = PartOfSpeech