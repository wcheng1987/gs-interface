var request = require('./support/http');

function getExampaper(paper) {
    paper.should.be.a('object').and.have.property('_id');
    describe('#GET /exampapers/'+paper._id, function() {
        it('#should get item of paper', function(done) {
            request()
            .get('/exampapers/'+paper._id)
            .expect(200, done)
        })
    })
}

function getExampaperList(examClass) {
    examClass.should.be.a('object').and.have.property('_id');
    describe('#GET /exampapers/?examclass_id='+examClass._id, function() {
        it('#should get the list of papers', function(done) {
            request()
            .get('/exampapers/?examclass_id='+examClass._id)
            .end(function(res) {
                if(res.statusCode == 200) {
                    var json = JSON.parse(res.body);
                    json.should.have.property('examPaper');
                    json.examPaper.forEach(getExampaper);
                }
                else res.should.have.status(204);
                done();
            })
            
            
        })
    })
}

describe('industry', function(){
    describe('#GET /industries/', function(){
        it('#should get the list of industry and class', function(done){
            request()
            .get('/industries/')
            .end(function(res){
                res.should.be.json;
                var json = JSON.parse(res.body);
                console.log(res.body);
                json.should.have.property('industry');
                json.industry.should.not.be.empty;
                done();
        
//                describe('#traverse examclass of industries', function() {
//                    json.industry.forEach(function(industry) {
//                        industry.should.have.property('examClass');
//                        industry.examClass.forEach(getExampaperList);
//                    })
//                })
            })
        })
    })
})
