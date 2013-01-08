var SimpleDO = require('../lib/simpleDO')

function EnglishSite() {
	this.options = {
		schema:'gs_englishsite',
		field:['`_id`','`begintime` AS beginTime','`endtime` AS endTime','`replaycount` AS replayCount','`interval`', '`paper_id`'],			
		query:{},
		order:{
			paper_id:'ASC'
		}
	}
	this.foreignkey = 'paper_id'
}

EnglishSite.prototype = new SimpleDO()

exports = module.exports = EnglishSite