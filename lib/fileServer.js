var url = require('url');
var path = require('path');
var config = require('config.js').config;
var logger = require('log4js').getLogger('FileServer');

exports.get = function(req, res, next) {
  var type = req.params.type;
  var basename = path.basename(url.parse(req.url).pathname);
  var file = config.files[type];
  var ranges = req.get('Range', 'bytes').split('-', 2);
	var options = {};
  options.start = ranges[0] ? parseInt(ranges[0]):0;
  options.end = ranges[1] ? parseInt(ranges[1]) : 0;
	options.root = file.root;

  basename = decodeURI(basename);
	logger.trace(basename, options);
	
  res.sendfile(basename, options, function(err) {
		if(err) logger.error(err)  	
  });
};

//curl --header "Range:bytes=500-" http://192.168.0.7:1339/files/audio/hosts