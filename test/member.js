var member = require('./member.lib.js');

function rand(l, u) {
    return Math.floor((Math.random() * (u-l+1))+l);
}

function queryInfo(phoneNumber, kID, sid) {
    describe('#Member query info of user', function() {
        it('should query info of user', function(done) {
            member.query(kID, sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.member.should.be.a('object').and.have.property('_id', kID);
                res.body.member.should.have.property('username', phoneNumber.toString());
                res.body.member.should.have.property('phone', phoneNumber.toString());
                done();
            })
        })
    })
}

function registerDone(phoneNumber) {
    describe('#Member login after register', function() {
        it('should success login', function(done) {
            member.auth({
                identification: {
                    username:phoneNumber.toString(),
                    password:"e10adc3949ba59abbe56e057f20f883e"
                }
            })
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.headers.should.have.property('set-cookie');
                res.body.should.have.property('member');
                var kID = res.body.member._id;
                var sid = member.getSID(res);
                queryInfo(phoneNumber, kID, sid);
                describe('#Member update info of user', function() {
                    it('should update info of user', function(done) {
                        res.body.member.email = phoneNumber+"@gste.com";
                        member.update(kID, res.body, sid)
                        .end(function(res) {
                            res.statusCode.should.equal(200);
                            queryInfo(phoneNumber, kID, sid);
                            done();
                        })
                    })
                })
                done();
            })
        })
    })
    
}

function register(done) {
    var phoneNumber = rand(10000000000, 99999999999);
    member.register({
            register: {
                username:phoneNumber.toString(),
                password:member.MD5("123456"),
                phone:phoneNumber
            }
    })
    .end(function(res) {
         if(409 == res.statusCode) {
            console.log(phoneNumber+" has exist, try another!");
            register(done);
         }
         else {
            res.statusCode.should.equal(201);
            res.headers.should.have.property('set-cookie');
            res.body.should.have.property('member');
            
            registerDone(phoneNumber);
            done();
        }
    })
}

describe('#Member', function() {
    it('should have success register new user with phone', function(done) {
        register(done);
    })    
})