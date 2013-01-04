var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var config = require('config.js').config;
var logger = require('log4js').getLogger('AudioPaper');

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
	    exports.findWordByIDs(wordIDs, ep, next);
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

/*
Output Event: words_done
*/
exports.findWordByIDs = function(wordIDs, ep2, next) {
    var ep = new EventProxy();
    var sql = '';
		logger.debug("word count:"+wordIDs.length);
		if(!wordIDs || wordIDs.length === 0) {
			logger.info("The audio paper has no any words!!!");
			return ep2.trigger('words_done', []);
		}
		
    ep.assign('words', 'part_of_speech', function(words, partOfSpeeches) {
			logger.info('make up words and part of Speeches')
			words.forEach(function(word) {
          word.audio = "http://"+config.host+":"+config.port+config.files.audio.base+word.audio;
          word.partOfSpeech = [];
          partOfSpeeches.some(function(partOfSpeech, index, arr) {//filter the part of speech for this word
              if(partOfSpeech.word_id === word._id) {
                  delete partOfSpeech.word_id;
                  //for fix sick database 
                  partOfSpeech._id = partOfSpeech.id;
                  delete partOfSpeech.id;
                  word.partOfSpeech.push(partOfSpeech);
                  //words and part of speech are all sort by word_id, so this operation can decrease loop times.
                  delete arr[index];
                  return false;
              } else { //no more part of speech for this word
                  return true;
              }
          });
      });
      ep2.trigger('words_done', words);
    });
    
    sql = 'SELECT DISTINCT * FROM `gs_word` WHERE `_id` IN ('+wordIDs+') ORDER BY `_id` ASC';
    db.query(sql, function(err, words) {
        if(err) return next(err);
        ep.trigger('words', words);            
    });
    sql = 'SELECT * FROM `gs_partofspeech` WHERE `word_id` IN ('+wordIDs+') ORDER BY `word_id` ASC, `sort` ASC';
    db.query(sql, function(err, partOfSpeeches) {
      if(err) return next(err);
      ep.trigger('part_of_speech', partOfSpeeches);
    });
};

exports.publicTimeLine = function(req, res, next) {
	var timeline = req.headers['if-modified-since']|| '1970-1-1 12:12:12';
	var opt = {
		query: {
			createtime: {'>': "'"+timeline+"'"},
			site_id: {IS:'NOT NULL'}
		},
		order: {
			createtime: 'DESC'
		},
		limit: {
			start: req.query.start || 1,
			end: req.query.end || 10
		}
	};
	
	findPaperAndWords(opt, function(err, aps, wordIDs) {
    if(err) return next(err);
		if(aps.length > 0) {
			findSiteByAudioPaper(aps, function(err, audioPaperArr) {
				return res.json({audioPaper:audioPaperArr})
			});
		} else {
			return res.send(304)
		}
	})
};
