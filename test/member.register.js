var request = require('./support/http');
var crypto = require('crypto');

var Md5=function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function register(data) {
    return  request()
            .post('/members/')
            .set('content-type', 'application/json')
            .write(JSON.stringify(data));
}

describe('member', function() {
    var cookie;
    describe('#register user', function() {
        it('#should be success register with phone', function(done) {
            var phoneNumber = 18912345672;
            register({
                    register: {
                        username:phoneNumber.toString(),
                        password:Md5("123456"),
                        phone:phoneNumber
                    }
            })
            .expect(201, done);
        })
    })
})