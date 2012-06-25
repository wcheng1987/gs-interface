var member = require('./member.lib.js');

function uploadRecord(json, sid, done) {
//    var json = JSON.parse(require('fs').readFileSync('./json/record.json'));
    member.post('/exam_records/', json, sid)
    .end(function(res) {
        res.statusCode.should.equal(201);
        res.should.be.json;
        console.log(res.body);
        done();
    });
};

function generateRecord(pid, sid, done) {
    member.get('/exampapers/'+pid, sid)
    .end(function(res) {
        res.statusCode.should.equal(200);
        res.should.be.json;
        res.body.should.have.property('examItemType');
        var record = {
               lid:133,
               paper_id:pid,
               useTime:100,
               beginTime:member.getNow(),
               endTime:member.getNow(),
               objectScore:0,
               itemRecord:[]
         };
         res.body.examItemType.forEach(function(it) {
             var irs = it.examItem.map(function(item) {
                 var ir = {item_id:item._id, score:0};
                 if(item.type == 1 || item.type == 3) ir.answer = 1;
                 if(item.type == 2) 
                     ir.answers = [
                         {option_id:item.option[0]._id},
                         {option_id:item.option[2]._id}
                     ];
                 return ir;
             });
             record.itemRecord = record.itemRecord.concat(irs);
         });
         console.log(record);
         uploadRecord(record, sid, done);
    });
}

describe('## Upload data record of examinations', function() {
    it('#Should Login success', function(done) {
        member.auth({
                identification: {
                    username:"gaojun",
                    password:"a85327a74b957ae06c652294934cc59a"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            var sid = member.getSID(res);
            generateRecord(17, sid, done);
            //done();
        })
    });
});