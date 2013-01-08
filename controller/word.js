var model = require('../model')
var Word = model.Word
var logger = require('log4js').getLogger('Word Controller')

exports.get = function(req, res, next) {
	logger.debug('Get Request Query:',req.query)
	var ids = req.query.ids?req.query.ids.split(','):[]
	var opt = {query:{}}
	if(ids.length > 0) opt.query._id = {$in:ids}
	if(req.query.start && req.query.end) {
		opt.limit = {
			start:req.query.start,
			end:req.query.end
		}
	} 
	
	var word = new Word()
	
	word.find(opt, function(err, words){
		if(err) return next(err)

		var wordsLen = words.length;
		if(wordsLen === 0) {
			return res.send(204)
		}
		else if(wordsLen > 0) {
			if(ids.length > wordsLen) {
				return res.json({word:words}, 206)
			}
			else {
				return res.json({word:words})
			}
		}
	})
}