var Member = require('../support/member');
var file = require('../support/http.file');

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
			member.member.friendgroup.forEach(function(group) {
				var friends = group.friend ||[]
				friends.forEach(getAudioPaper)
			})
	  })
	})
}

function getAudioPaper(user) {
	describe('##Audio Paper of Friends of '+user.username, function(){
		before(function(done){
			member.getAudioPaper(user, done)
		})
	  it('should success get audio paper of '+user.realname, function() {
			// console.log('222', user)
			user.words.forEach(getAudioFile)
			user.audioPaper.forEach(postRecord)
	  })
		it('should success post listen record', function(){
		  
		})
	})
}

function getAudioFile(word) {
	describe('###Audio file : '+word.word, function(){
	  it('should success download '+word.audio, function(done){
			file.get(member.sid, word.audio, done)
	  })
	})
}

function postRecord(audioPaper) {
	describe('###Record of '+audioPaper.name+' ID:'+audioPaper._id, function(){
	  
	})
}

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