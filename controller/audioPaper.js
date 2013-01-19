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
		var lastModified = util.format_date(aps[0].createTime)
		redisClient.hmset(key, 'lastModified', lastModified, 'cache', JSON.stringify(aps), function(err, reply){
			if(err) return logger.error('Interval update public time line cache', err)
			if(next) next()
		})
	})
}
setInterval(updatePublicTimeLine, kvCache.maxAge*1000)
updatePublicTimeLine()

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
	var start = opt.limit.start-1
	, stop = parseInt(opt.limit.end)
	
	var send = function(aps){
		if(aps.length > 0) {
			return res.json({audioPaper:aps}, {'last-modified': timeline})
		} else {
			if(start === 0) {
				return res.send(304)
			} else {
				return res.send(204)				
			}
		}
	}

	var query = function(){
		var ap = new AudioPaper()
		ap.find(opt, function(err, aps) {
	    if(err) return next(err)
			send(aps)
		})
	}

	var getCache = function(){
		redisClient.hgetall(key, function(err, reply){
			if(err) return err
			if(!reply) {
				logger.warn('AudioPaper Public TimeLine has not been ready')
				return updatePublicTimeLine(getCache)
			}
			if(start === 0 && timeline === reply.lastModified) {
				return send([])
			}
			timeline = reply.lastModified
			var aps = JSON.parse(reply.cache)
			// logger.trace(aps)
			send(aps.slice(start, stop))
		})
	}
	
	logger.trace('AudiPaper Public Time Line', start, stop, kvCache, now)
	if(stop > kvCache.size) {
		timeline = now;
		logger.debug("Out of cache scope")
		query()
	} else {
		getCache()
	}
}

