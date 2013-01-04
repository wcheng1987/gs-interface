var request = require('./support/http');
var url = require('url');

function getImage(img) {
    it('#should get image from URL:'+img, function(done) {
        var req = request().get('/');
        var imageurl = url.parse(img);
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
    describe('#News detail', function() {
        it('#should get NO.'+news._id+' news detail', function(done) {
            request(true)
            .get('/newss/'+news._id)
            .expect(200,done)
        })
        //if(news.userimage) getImage(news.userimage);
        //if(news.imageurl) getImage(news.imageurl);
    })
}

describe('#News', function() {
    it('#should got the news list', function(done) {
        request(true)
        .get('/newss/?start=1&&end=100&examclass_id=3')
        .end(function(res) {
            res.should.have.status(200)

            res.body.should.have.property('news')
            res.body.news.forEach(getNews);

            done();
        })
    })
})