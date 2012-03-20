var request = require('./support/http');
var url = require('url');
//var qs = require('querystring');

function getImage(news) {
    it('#should get NO.'+news._id+' image URL:'+news.imageurl, function(done) {
        var req = request().get('/');
        var imageurl = url.parse(news.imageurl);
        req.addr.port = imageurl.port
        req.addr.address = imageurl.hostname
        req.path = imageurl.pathname;
        req.end(function(res) {
//            console.log(res.headers);
            res.should.have.status(200)
//            res.should.have.header('Content-Length').with.above(0)
            done()
        })
    })
}

function getNews(news) {
    describe('#get News detail', function() {
        it('#should get NO.'+news._id+' news detail', function(done) {
            request()
            .get('/newss/'+news._id)
            .expect(200,done)
        })
        if(news.imageurl) getImage(news);
    })
}

describe('news', function() {
    describe('#news list', function() {
        it('#should got the last 5 news', function(done) {
            request(true)
            .get('/newss/?start=1&&end=100')
            .end(function(res) {
                res.should.have.status(200)

                var newss = JSON.parse(res.body)
                newss.should.have.property('news')
                newss.news.forEach(getNews);

                done();
            })
        })
    })
})