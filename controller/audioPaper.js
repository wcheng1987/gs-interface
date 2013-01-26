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
};
