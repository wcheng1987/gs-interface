var request = require('./support/http');

describe('paperlist', function() {
    describe('GET /exampapers/3', function() {
        it('should get the list of papers', function(done) {
            request()
            .get('/exampapers/?examclass_id=3')
            .expect(200, done);
        })
    })
})

describe('industry', function(){
  describe('Check /industries/', function(){
    it('should get the list of industry and class', function(done){
      request()
      .get('/industries/')
      .end(function(res){
//        console.log(res.headers);
        done();
      })
    })
    
    it('should can found', function(done) {
        request()
        .put('/industries/')
        .expect(404, done);
    })
  })
})
