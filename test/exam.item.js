var request = require('./support/http');

describe('examination items', function() {
    it('#should success return item list of #17 paper', function(done) {
        request(true)
        .get('/exampapers/17')
        .expect(200, done);
    })
})