var config = require('config.js').config;
var logger = require('log4js').getLogger('AudioPaper Controller')
var model = require('../model')
var AudioPaper = model.AudioPaper
var util = require('../lib/util')
var redis = require('redis')
var redisClient = redis.createClient(config.redis.port, config.redis.host)

var kvCache = {
	size:100,
	maxAge:60
}
var key = 'AudioPaperPublicTimeLine'
var lastModified = null
var updatePublicTimeLine = function(next){
	var opt = {
		order: {
			createtime: 'DESC'
		},
		limit: {
			start: 1,
			end: kvCache.size
		}
	}
	var ap = new AudioPaper()
	ap.find(opt, function(err, aps) {
    if(err) return logger.error('Interval find public time line', err)
		lastModified = util.format_date(aps[0].createTime)
		redisClient.hmset(key, 'lastModified', lastModified, 'cache', JSON.stringify(aps), function(err, reply){
			if(err) return logger.error('Interval update public time line cache', err)
			if(next) next()
		})
	})
}
setInterval(updatePublicTimeLine, kvCache.maxAge*1000)
updatePublicTimeLine()

/*
	lcoal 
*/
var send = function(aps, res){
	if(aps.length > 0) {
		return res.json({audioPaper:aps}, {'last-modified': lastModified})
	} else {
		if(res.start === 0) {
			return res.send(304)
		} else {
			return res.send(204)				
		}
	}
}

var query = function(opt, res, next){
	var ap = new AudioPaper()
	ap.find(opt, function(err, aps) {
    if(err) return next(err)
		send(aps, res)
	})
}

/*
	module expors
*/
exports.publicTimeLine = function(req, res, next) {
	var now = util.getNow()
	var timeline = req.headers['if-modified-since']
	var opt = {
		query: {},
		order: {
			createtime: 'DESC'
		},
		limit: {
			start: req.query.start || 1,
			end: req.query.end || 10
		}
	}
	logger.debug('AudioPaper PublicTimeLine Last-Modified', timeline)
	res.start = opt.limit.start-1
	res.stop = parseInt(opt.limit.end)
	
	var getCache = function(){
		redisClient.hgetall(key, function(err, reply){
			if(err) return next(err)
			if(!reply) {
				logger.warn('AudioPaper Public TimeLine has not been ready')
				return updatePublicTimeLine(getCache)
			}
			if(!lastModified) lastModified = reply.lastModified
			if(res.start === 0 && timeline === reply.lastModified) {
				return send([], res)
			}
			var aps = JSON.parse(reply.cache)
			send(aps.slice(res.start, res.stop), res)
		})
	}
	
	if(res.stop > kvCache.size) {
		timeline = now;
		logger.debug("Out of cache scope")
		query(opt, res, next)
	} else {
		getCache()
	}
}

exports.get = function(req, res, next) {
	logger.debug('Get Request Query:',req.query)
	var opt = {
		query:{},
		limit:{
			start:req.query.start||1,
			end:req.query.end||10
		}
	}
	if(req.query.book_id) opt.query.book_id = parseInt(req.query.book_id)
	if(req.query.creator_id) opt.query.creator_id = parseInt(req.query.creator_id)

	res.start = opt.limit.start-1
	res.stop = parseInt(opt.limit.end)
	query(opt, res, next)
}

