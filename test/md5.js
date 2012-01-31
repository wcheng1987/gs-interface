var crypto=require('crypto');

var Md5=function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
}

var a='qw12er34';
console.log(Md5(a));

