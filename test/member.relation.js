var member = require('./member.lib.js');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');

describe('#Member Relationship Test', function() {
    it('Should Login as member', function(done) {
        member.afterLogin(function(sid, theMember) {
            getFriends(sid, theMember);
            done();
        });
    })
})

function getFriends(sid, theMember) {
    describe('#Member Friend', function() {
        it('Should GET friends info of '+theMember.username, function(done) {
            member.get('/members/'+theMember._id+'/friends', sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.should.have.property('member');
                res.body.member.friendgroup.forEach(function(group) {
                    group.friend.forEach(function(friend) {
                        getAudioPaper(sid, friend);
                    });
                });
                done();
            });
        })
    })
}

function getAudioPaper(sid, theMember) {
    describe('#Member, Audio paper', function() {
        it('Should GET audio paper of '+theMember.username+' friend', function(done) {
            member.get('/members/'+theMember._id+'/audio_paper', sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.should.have.property('member');
                if(undefined != res.body.member.audioPaper) {
                    postListeningRecords(sid, res.body.member.audioPaper);
                }
                if(undefined != res.body.word) {
                    getAudioFiles(sid, res.body.word);
                }
                done();
            });
        })
    })
}

function getAudioFiles(sid, words) {
    var cookie = request.cookie(sid);
    var j = request.jar();
    j.add(cookie);
    var r = request.defaults({jar:j});
    describe('#Member, Audio Files of paper', function() {
        words.forEach(function(word) {
            it('Should GET audio file:'+word.word, function(done) {
                var pathname = url.parse(word.audio).pathname;
                var basename = path.basename(pathname);
                pathname = __dirname+'/words/'+basename;
                var ws = fs.createWriteStream(pathname);
                r(word.audio, function(err, res, body) {
                    res.statusCode.should.equal(200);
                    res.should.have.header('content-length');
                    var ct = parseInt(res.headers['content-length']);
                    fs.stat(pathname, function(ferr, stats) {
                        stats.size.should.equal(ct);
                        done();
                    });
                })
                .pipe(fs.createWriteStream(pathname));
            });
        });
    });
}

function generateRecord(audioPaper) {
    var site = audioPaper.englishSite;
    var duration = site.replayCount*site.interval;
    var writeRecord = {
        paper_id:audioPaper._id,
        beginTime:member.getNow(),
        endTime:member.getNow(duration),
        item:[]
    };
    audioPaper.wordQuestion.forEach(function(word) {
        var item = {
            word_id:word.word_id,
            right:0,
            answer:'test',
            sort:word.sort
        };
        writeRecord.item.push(item);
    });
    //console.log(JSON.stringify(writeRecord));
    return writeRecord;
}


function postListeningRecords(sid, audioPaper) {
    describe('#Member, Listening records', function() {
        audioPaper.forEach(function(ap) {
            it('Should Success Add new record of listening of Audio Paper:'+ap.name, function(done) {
                var writeRecord = generateRecord(ap);
                member.post('/write_records', writeRecord, sid)
                .end(function(res) {
                    res.statusCode.should.equal(201);
                    res.body.should.have.property('created');
                    done();
                });
            });
        });    
    });
}

exports.generateRecord = generateRecord;
