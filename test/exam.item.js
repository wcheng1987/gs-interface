var request = require('./support/http');

describe('examination items', function() {
    it('#should success return item list of #1 paper', function(done) {
        request(true)
        .get('/exampapers/1')
        .expect(200, done);
    })
})