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
                r(word.audio, function(err, res, body) {
                    res.statusCode.should.equal(200);
                    res.should.have.header('content-length');
                    fs.stat(pathname, function(ferr, stats) {
                        stats.size.should.equal(parseInt(res.headers['content-length']));
                        done();
                    });
                })
                .pipe(fs.createWriteStream(pathname));
            });
        });
    });
}