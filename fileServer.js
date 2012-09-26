var url = require('url');
var env = require('env.json');

exports.get = function(req, res, next) {
    var type = req.params.type;
    var path = url.parse(req.url).pathname;
    var file = env.files[type];
    var ranges = req.get('Range', 'bytes').split('-', 2);
    var start = ranges[0] ? parseInt(ranges[0]):0;
    var end = ranges[1] ? parseInt(ranges[1]) : 0;
    
    path = path.replace(file.base, file.root);
    path = decodeURI(path);
//    console.log(path, start, end);
    
    res.sendfile(path, {start:start, end:end});
};

//curl --header "Range:bytes=500-" http://192.168.0.7:1339/files/audio/hosts