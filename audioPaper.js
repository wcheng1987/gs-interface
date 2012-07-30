var db = require('./db.js');
var EventProxy = require("eventproxy").EventProxy;
var env = require('env.json');

/*
Output Event: member, word_id
*/
exports.findByMember = function(id, ep2, next) {
    var wordIDs = [0];
    var ep = new EventProxy();
    var sql = '';
    
    ep.assign('site', 'audio_paper', function(sites, audioPaper) {
        var aps = [];
        sites.forEach(function(site) {
            audioPaper.some(function(ap, _i, _array) {
                var matched = site.paper_id === ap._id;
                if(matched) {
                    delete site.paper_id;
                    ap.englishSite = site;
                    aps.push(ap);
                }                
                delete _array[_i];//for decrease loop times
                return matched;
            });
        });
        ep2.trigger('member', {_id:id, audioPaper:aps});
    });
    
    sql = "SELECT `_id`,`begintime` AS beginTime,`endtime` AS endTime,"+
          "`replaycount` AS replayCount,`interval`, `paper_id` "+
          "FROM `gs_englishsite` WHERE `creator_id`="+id+" ORDER BY `paper_id` ASC";
    db.query(sql, function(err, sites) {
        if(err) return next(err);        
        ep.trigger('site', sites);
    });
    
    sql = "SELECT _id, description, name, count, createtime AS createTime, wordcount AS wordCount,"+
          "phresecount AS phraseCount, random, randomwordcount AS randomWordCount, randomphresecount AS randomPhraseCount "+
          "FROM `gs_audiopaper` WHERE `creator_id`="+id+" ORDER BY `_id` ASC";;
    db.query(sql, function(err, audioPaper) {
        if(err) return next(err);        
        ep.after('word_question', audioPaper.length, function(data) {
            ep2.trigger('word_id', wordIDs);
            ep.trigger('audio_paper', audioPaper);
        });
        audioPaper.forEach(makeupAudioPaper);
    });
    
    function makeupAudioPaper(ap) {
        sql = "SELECT `wordid` AS word_id, `sort` FROM `gs_audiopaperword` WHERE `paper_id`="+ap._id;
        db.query(sql, function(err, wordQuestions) {
            if(err) return next(err);
            ap.wordQuestion = wordQuestions
            var ids = wordQuestions.map(function(wq) {
                return wq.word_id;
            });
            wordIDs = wordIDs.concat(ids);
            ep.trigger('word_question', ap);
        });
    }
};

/*
Output Event: words_done
*/
exports.findWordByIDs = function(wordIDs, ep2, next) {
    var ep = new EventProxy();
    var sql = '';
    
    ep.assign('words', 'part_of_speech', function(words, partOfSpeeches) {
        words.forEach(function(word) {
            word.audio = env.hostURL + env.files.audio.base+word.audio;
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