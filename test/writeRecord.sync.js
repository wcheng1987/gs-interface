var member = require('./member.lib.js');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');

describe('#Write Record Sync Test', function() {
    it('Should Login as member', function(done) {
        member.afterLogin(function(sid, theMember) {
            sync(sid, theMember);
            done();
        });
    })
});

function sync(sid, theMember) {
    describe('#Sync write records', function() {
        it('Should success sync WITHOUT any upload write records of '+theMember.username, function(done) {
            member.put('/write_records', '', sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.should.not.have.property('commitedResp');
                done();
            });
        })
    })
}