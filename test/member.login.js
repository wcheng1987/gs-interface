var member = require('./member.lib.js');

var getNow=function(){
    var now = new Date();
    return now.toString();
}

describe('##Member Login', function() {
    var cookie;
    it('#should can not authenticate for wrong password', function(done) {
        member.auth({
                identification: {
                    username:"gbo@gste.com",
                    password:"this is wrong password"
                }
        })
        .expect(401, done);
    })

    it('#should can not authenticate for forbidden', function(done) {
        member.auth({
                identification: {
                    username:"forbiddenUser",
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
        })
        .expect(403, done);
    })

    it('#should authenticate with nickname', function(done) {
        member.auth({
                identification: {
                    username:"caohao",
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            done();
        })
    })
    
    it('#should authenticate with email', function(done) {
        member.auth({
                identification: {
                    username:"gbo@gste.com",
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            done();
        })
    })
    
    it('#should authenticate with phone', function(done) {
        member.auth({
                identification: {
                    username:"18912345678",
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(200);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            done();
        })
    })
    
    it('#should register and login with new account', function(done) {
        var user = "user"+getNow();
        //console.log(user);
        member.auth({
                identification: {
                    username:user,
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
        })
        .end(function(res) {
            res.statusCode.should.equal(201);
            res.should.be.json;
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            done();
        })
    });
})