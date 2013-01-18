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

exports.publicTimeLine = function(req, res, next) {
	var now = util.getNow()
	var timeline = req.headers['if-modified-since']||now
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
	, key = 'AudioPaperPublicTimeLine'+timeline
	
	var send = function(apArr){
		var aps = apArr.slice(start, stop)
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

	var cache = function(aps) {
		/*
		var args = [key].concat(aps.map(function(ap){
			return JSON.stringify(ap)
		}))
		args.push(function(err, reply){
			if(err) return next(err)
			redisClient.expire(key, kvCache.maxAge, function(err, reply){
				if(err) return next(err)
				send(aps.slice(start, stop))
			})
		})
		redisClient.rpush.apply(redisClient, args)*/
		redisClient.multi()
		.set(key, JSON.stringify(aps))
		.expire(key, kvCache.maxAge)
		.exec(function(err, replies){
			if(err) return next(err)
			send(aps)
		})
	}

	var query = function(){
		var ap = new AudioPaper()
		ap.find(opt, function(err, aps) {
	    if(err) return next(err)
			if(opt.limit.start === 1 && opt.limit.end === kvCache.size) {
				cache(aps)
			} else {
				send(aps);
			}
		})
	}

	logger.trace('gbo===', start, stop, kvCache, now)
	if(stop > kvCache.size) {
		query()
	} else {
		redisClient.ttl(key, function(err, reply){
			if(err) return next(err)
			if(reply === -1) {
				opt.limit.start = 1
				opt.limit.end = kvCache.size
				query()
			} else {
				if(start === 0) return send([]);
				redisClient.get(key, function(err, reply){
					if(err) return err
					var aps = JSON.parse(reply)
					// logger.trace(aps)
					send(aps)
				})
			}
		})
	}
};
