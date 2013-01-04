var member = require('./member.lib.js');

function syncRecord(sid, done) {
    var json = {uncommit:[], commited:[]};
    member.put('/exam_records/', json, sid)
    .end(function(res) {
        res.statusCode.should.equal(200);
        res.should.be.json;
        console.log(JSON.stringify(res.body));
        done();
    });
};

describe('## Query data record of examinations', function() {
    it('#Should Login success and Query Data', function(done) {
        member.auth({
                identification: {
                    username:"123@",
                    password:"e10adc3949ba59abbe56e057f20f883e"
//                    username:"18912345678",
//                    password:"e10adc3949ba59abbe56e057f20f883e"
//                    username:"gaojun",
//                    password:"a85327a74b957ae06c652294934cc59a"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            var sid = member.getSID(res);
            syncRecord(sid, done);
            //done();
        })
    });
});