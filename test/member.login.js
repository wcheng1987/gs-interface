var request = require('./support/http');

function getCookie(res) {
  return res.headers['set-cookie'][0].split(';')[0];
}

function auth(theID) {
    return  request()
            .post('/login')
            .set('content-type', 'application/json')
            .write(JSON.stringify(theID));
}

describe('member', function() {
    var cookie;
    describe('#login', function() {
        it('should can not authenticate for wrong username', function(done) {
            var theID = {
                    identification: {
                        username:"do_not_exist@gste.com",
                        password:"e10adc3949ba59abbe56e057f20f883e"
                    }
            }
            request()
            .post('/login')
            .set('content-type', 'application/json')
            .write(JSON.stringify(theID))
            .expect(404, done);
        })

        it('should can not authenticate for wrong password', function(done) {
            auth({
                    identification: {
                        username:"gbo@gste.com",
                        password:"123456"
                    }
            }).expect(401, done);
        })

        it('should authenticate', function(done) {
            var theID = {
                    identification: {
                        username:"gbo@gste.com",
                        password:"e10adc3949ba59abbe56e057f20f883e"
                    }
            }
            request()
            .post('/login')
            .set('content-type', 'application/json')
            .write(JSON.stringify(theID))
            .end(function(res) {
                res.statusCode.should.equal(200);
                cookie = getCookie(res);
                console.log(cookie);
                res.should.be.json;
                res.body.should.include("张三");
                done();
            })
        })
    })
})