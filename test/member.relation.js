var member = require('./member.lib.js');

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
        it('Should GET friends info of member', function(done) {
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
    describe('#Audio paper of member', function() {
        it('Should GET audio paper of member friend', function(done) {
            member.get('/members/'+theMember._id+'/audio_paper', sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.should.have.property('member');
                done();
            });
        })
    })
}