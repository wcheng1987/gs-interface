var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');

var findPaper = function(opt, cb) {
    var wordIDs = [0];
    var ep = new EventProxy();

    opt.schema = 'gs_audiopaper';
    opt.field = ['_id', 'creator_id','description', 'name', 'count', 'createtime AS createTime', 'wordcount AS wordCount',
                  'phresecount AS phraseCount', 'random', 'randomwordcount AS randomWordCount', 'randomphresecount AS randomPhraseCount'];
    db.find(opt,function(err, audioPaper) {
        if(err) return cb(err);        
        ep.after('word_question', audioPaper.length, function(data) {
            cb(err, audioPaper, wordIDs);
        });
        audioPaper.forEach(makeupAudioPaper);
    });
    
    function makeupAudioPaper(ap) {
        sql = "SELECT `wordid` AS word_id, `sort` FROM `gs_audiopaperword` WHERE `paper_id`="+ap._id;
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
};

var findSites = function(opt, cb) {
    opt.schema = '`gs_englishsite`';
    opt.field = ['`_id`','`begintime` AS beginTime','`endtime` AS endTime','`replaycount` AS replayCount','`interval`', '`paper_id`'];
    db.find(opt, cb);
};

exports.find = function(opt, cb, next) {
    var ep = new EventProxy();
    ep.assign('member', 'words_done', function(member, words) {
        return cb(member, words);
    });

    ep.assign('site', 'audio_paper', function(sites, audioPaper) {
        var _member = {};
        var members = [];
        audioPaper.forEach(function(ap) {
            var cid = ap.creatord_id+'';
            _member[cid] = _member[cid]||{_id:ap.creator_id,audioPaper:[]};
            _member[cid].audioPaper.push(ap);
            delete ap.creator_id;
            sites.some(function(site, _i, _array) {
                var matched = site.paper_id === ap._id;
                if(matched) {
                    delete site.paper_id;
                    ap.englishSite = site;
                    delete _array[_i];
                }                
                return matched;
            });
        });
        for(var key in _member) {
            members.push(_member[key]);
        }
        ep.trigger('member', members);
    });
    
    var opt2 = {query:{paper_id:opt.query._id}};
    findSites(opt2, function(err, sites) {
        if(err) return next(err);        
        ep.trigger('site', sites);    
    });
    
    findPaper(opt, function(err, audioPaper, wordIDs) {
        if(err) return next(err);
        exports.findWordByIDs(wordIDs, ep, next);
        ep.trigger('audio_paper', audioPaper);    
    });
};

exports.findByMember = function(id, cb, next) {
    var ep = new EventProxy();
    var sql = '';
    
    ep.assign('member', 'words_done', function(member, words) {
        return cb({member:member, word:words});
    });
        
    ep.assign('site', 'audio_paper', function(sites, audioPaper) {
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
                delete _array[_i];//for decrease loop times
                return matched;
            });
        });
        ep.trigger('member', {_id:id, audioPaper:aps});
    });
    
    findSites({query:{creator_id:id}, order:{paper_id:'ASC'}}, function(err, sites) {
        if(err) return next(err);        
        ep.trigger('site', sites);
    });
    
    findPaper({query:{creator_id:id, site_id:{IS:'NOT NULL'}},order:{_id:'ASC'}}, function(err, audioPaper, wordIDs) {
//    findPaper({query:{creator_id:id},order:{_id:'ASC'}}, function(err, audioPaper, wordIDs) {
        if(err) return next(err);
        exports.findWordByIDs(wordIDs, ep, next);
        ep.trigger('audio_paper', audioPaper);
    });
};

/*
Output Event: words_done
*/
exports.findWordByIDs = function(wordIDs, ep2, next) {
    var ep = new EventProxy();
    var sql = '';
    
    ep.assign('words', 'part_of_speech', function(words, partOfSpeeches) {
        words.forEach(function(word) {
            word.audio = "http://"+env.host+":"+env.port+files.audio.base+word.audio;
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