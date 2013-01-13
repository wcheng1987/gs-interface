var config = require('config.js').config;
var logger = require('log4js').getLogger('AudioPaper Controller')
var model = require('../model')
var AudioPaper = model.AudioPaper

exports.publicTimeLine = function(req, res, next) {
	var timeline = req.headers['if-modified-since']|| '1970-1-1 12:12:12';
	var opt = {
		query: {
			createtime: {'>': "'"+timeline+"'"},
		},
		order: {
			createtime: 'DESC'
		},
		limit: {
			start: req.query.start || 1,
			end: req.query.end || 10
		}
	};
	
	var ap = new AudioPaper()
	
	ap.find(opt, function(err, aps) {
    if(err) return next(err);
		if(aps.length > 0) {
			return res.json({audioPaper:aps}, {'Last-Modified': new Date()})
		} else {
			return res.send(304)
		}
	})
}

exports.get = function(req, res, next){
	logger.debug('Get Request Query:',req.query)
	var opt = {
		query:{},
		limit:{
			start:req.query.start||1,
			end:req.query.end||10
		}
	}
	if(req.query.book_id) opt.query.book_id = req.query.book_id
	if(req.query.creator_id) opt.query.creator_id = req.query.creator_id

	var ap = new AudioPaper()
	ap.find(opt, function(err, aps) {
    if(err) return next(err);
		if(aps.length > 0) {
			return res.json({audioPaper:aps})
		} else {
			return res.send(204)
		}
	})
}