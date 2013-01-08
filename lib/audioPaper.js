var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var config = require('config.js').config;
var logger = require('log4js').getLogger('AudioPaper')
var model = require('../model')
var Word = model.Word

var findPaper = function(opt, cb) {
  opt.schema = 'gs_audiopaper';
  opt.field = ['_id', 'creator_id','description', 'name', 'count', 'createtime AS createTime', 'wordcount AS wordCount',
                'phresecount AS phraseCount', 'random', 'randomwordcount AS randomWordCount', 'randomphresecount AS randomPhraseCount'];
  db.find(opt, cb);
};

var findPaperAndWords = function(opt, cb) {
  var wordIDs = [];
  var ep = new EventProxy();

	findPaper(opt, function(err, aps) {
    if(err) return cb(err);
    ep.after('word_question', aps.length, function(data) {
			cb(err, aps, wordIDs);
    });
    aps.forEach(makeupAudioPaper);
	})

	function makeupAudioPaper(ap) {
    var sql = "SELECT `wordid` AS word_id, `sort` FROM `gs_audiopaperword` WHERE `paper_id`="+ap._id;
    db.query(sql, function(err, wordQuestions) {
      if(err) return cb(err);
      ap.wordQuestion = wordQuestions
      var ids = wordQuestions.map(function(wq) {
        return wq.word_id;
      });
      wordIDs = wordIDs.concat(ids);
      ep.trigger('word_question', ap);
    });
	}
}

var findSites = function(opt, cb) {
  opt.schema = '`gs_englishsite`';
  opt.field = ['`_id`','`begintime` AS beginTime','`endtime` AS endTime','`replaycount` AS replayCount','`interval`', '`paper_id`'];
  db.find(opt, cb);
};

function findSiteByAudioPaper(aps, next) {
	var paperIDs = aps.map(function(audioPaper){
		return audioPaper._id;
	})			
  findSites({query:{paper_id:{$in:paperIDs}}, order:{paper_id:'ASC'}}, function(err, sites) {
    if(err) return next(err);
		next(err, makeupAudioPaperWithSite(sites, aps));
  });
};

function makeupAudioPaperWithSite(sites, audioPaper) {
  var aps = [];
  sites.forEach(function(site) {
    audioPaper.some(function(ap, _i, _array) {
      var matched = site.paper_id === ap._id;
      if(matched) {
        delete site.paper_id;
        delete ap.creator_id;
        ap.englishSite = site;
        aps.push(ap);
      }                
      return matched;
    });
  });
	return aps;
};

exports.find = function(options, cb, next) {
  var ep = new EventProxy();
	var opt = options || {query:{}};
  
  ep.assign('member', 'words_done', function(member, words) {
    return cb({member:member, word:words});
  });
        
	opt.query.site_id = {IS:'NOT NULL'};
	opt.order = {_id:'ASC'};
  findPaperAndWords(opt, function(err, aps, wordIDs) {
    if(err) return next(err);
		if(aps.length > 0) {
			var word = new Word()
			word.find({query:{_id:{$in:wordIDs}}}, function(err, words){
				if(err) return next(err);
				ep.trigger('words_done', words)
			})
	    // exports.findWordByIDs(wordIDs, ep, next);
			findSiteByAudioPaper(aps, function(err, audioPaperArr) {
				if(err) return next(err);
			  ep.trigger('member', {_id:opt.query.creator_id, audioPaper:audioPaperArr});				
			});
		} else {
			ep.trigger('member', {_id:opt.query.creator_id, audioPaper:[]});
			ep.trigger('words_done', []);
		}
  });
};
