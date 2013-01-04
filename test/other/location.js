var request = require('./support/http');

describe('location', function() {
    it('#should got the list', function(done) {
        request(true)
        .get('/locations/')
        .end(function(res) {
            res.should.have.status(200)
            res.body.should.have.property('location')
            done();
        })
    })
})