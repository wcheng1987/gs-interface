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
    describe('#GET examClass: '+examClass.name, function() {
        examClass.examSubject.forEach(function(es) {
        it('#should get the list of papers from /exampapers/?examsubject_id='+es._id, function(done) {
            request()
            .get('/exampapers/?examsubject_id='+es._id)
            .end(function(res) {
                if(res.statusCode == 200) {
                    res.body.should.have.property('examPaper');
//                    res.body.examPaper.forEach(getExampaper);
                }
                else res.should.have.status(204);
                done();
            });            
        })
        })
    })
}

describe('industry', function(){
    describe('#GET /industries/', function(){
        it('#should get the list of industry and class', function(done){
            request(true)
            .get('/industries/')
            .end(function(res){
                res.should.be.json;
                res.body.should.have.property('industry');
                res.body.industry.should.not.be.empty;
                done();
        
                describe('#traverse examclass of industries', function() {
                    res.body.industry.forEach(function(industry) {
                        if(industry.examClass)
                            industry.examClass.forEach(getExampaperList);
                    })
                })
            })
        })
    })
})
