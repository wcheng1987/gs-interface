var Member = require('../support/member');
// var fs = require('../support/session.fs');
// var audioPaper = require('./audioPaper');


var member = new Member();

describe('Member Acceptance Test', function() {
	before(function(done){
	  member.auth(done)
	})
	it('should success auth', function() {
		getFriends();
	})	
})

function getFriends() {
	describe('#Friends of '+member.member.username, function() {
		before(function(done){
			member.getFriends(done)
		})
	  it('should success get friends info', function() {
			eachGroup()
	  })
	})
}

function eachGroup() {
	member.member.friendgroup.forEach(function(group) {
    var friends = group.friend || []
		friends.forEach(getAudioPaper)
	})
}

function getAudioPaper(user) {
	// console.log('222', user)
	describe('##Audio Paper of Friends of '+user.username, function(){
	  it('should success get audio paper of '+user.realname, function(done) {
			member.getAudioPaper(user, done)
	  })
	})
}

function getAudioPaper1(sid, theMember) {
    describe('#Member, Audio paper', function() {
        it('Should GET audio paper of '+theMember.username+' friend', function(done) {
            member.get('/members/'+theMember._id+'/audio_paper', sid)
            .end(function(res) {
							res.statusCode.should.be.below(300);
							if(res.statusCode === 200) {
								res.should.be.json;
								res.body.should.have.property('member');
							}
							done();
/*                if(undefined != res.body.member.audioPaper) {
                    postListeningRecords(sid, res.body.member.audioPaper);
                }
                if(undefined != res.body.word) {
                    getAudioFiles(sid, res.body.word);
                }
                // res.body.member.should.have.property('audioPaper');
                // console.log("audioPapers:");
                // res.body.member.audioPaper.forEach(function(ap) {
                //     if(ap._id === 175) ap.name.should.be.equal('bbb');
                //     if(ap._id === 190) ap.name.should.be.equal('12333');
                //     console.log(ap._id, ap.name, ap.englishSite._id);
                // });
/*                res.body.member.should.have.property('_id');
                if(res.body.member._id === 4) {
                    res.body.member.should.have.property('audioPaper').with.lengthOf(2);
                }*/
            });
        })
    })
}
/*
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
				pathname = __dirname+'/words/';
				if (!fs.existsSync(pathname)) fs.mkdirSync(pathname);
				pathname += basename;
				if (fs.existsSync(pathname)) return done();
                var ws = fs.createWriteStream(pathname);
                r(encodeURI(word.audio), function(err, res, body) {
                    res.statusCode.should.equal(200);
                    res.should.have.header('content-length');
                    var ct = parseInt(res.headers['content-length']);
                    fs.stat(pathname, function(ferr, stats) {
                        stats.size.should.equal(ct);
                        done();
                    });
                })
                .pipe(ws);
            });
        });
    });
}*/

function generateRecord(audioPaper) {
    var site = audioPaper.englishSite;
    var duration = site.replayCount*site.interval*audioPaper.wordQuestion.length;
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
        if(item.word_id%2 === 0) {
            item.right = 1;
            item.answer = word.word;
        }
        writeRecord.item.push(item);
    });
    //console.log(JSON.stringify(writeRecord));
    return writeRecord;
}

function generateErrorRedoRecord(writeRecord) {
    var duration = 500;
    var errorRedoRecord = {
        record_id:writeRecord._id,
        beginTime:member.getNow(),
        endTime:member.getNow(duration),
        item:[]
    };
    writeRecord.item.forEach(function(recordItem) {
        if(recordItem.right === 0) {
            var item = {
                word_id:recordItem.word_id,
                right:0,
                answer:'test',
                sort:recordItem.sort
            };
            if(item.word_id%3 === 0) {
                item.right = 1;
                item.answer = 'test error right';
            }
            errorRedoRecord.item.push(item);
        }
    });
    //console.log(JSON.stringify(errorRedoRecord));
    return errorRedoRecord;
}

function postErrorRedoRecord(sid, writeRecord) {
    describe('#Member, Listening Error Redo records', function() {
        var errorRedoRecord = generateErrorRedoRecord(writeRecord);
        it('Should Success add error redo record of listening record of ID:'+writeRecord._id, function(done) {
            member.post('/error_write_records', errorRedoRecord, sid)
            .end(function(res) {
                res.statusCode.should.equal(201);
                res.body.should.have.property('created');
                done();
            });
        });
    });
}

function postListeningRecords(sid, audioPaper) {
    describe('#Member, Listening records', function() {
        audioPaper.forEach(function(ap) {
            var writeRecord = generateRecord(ap);
            it('Should Success Add new record of listening of Audio Paper:'+ap.name, function(done) {
                member.post('/write_records', writeRecord, sid)
                .end(function(res) {
                    res.statusCode.should.equal(201);
                    res.body.should.have.property('created');
                    writeRecord._id = res.body.created._id;
                    postErrorRedoRecord(sid, writeRecord);
                    done();
                });
            });
        });    
    });
}

exports.generateRecord = generateRecord;