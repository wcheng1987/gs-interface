var fs = require('fs');
var http = require('http');

var port = 1339;
var path = '/api/login';
if(process.argv[3]) port = process.argv[3];
if(process.argv[4]) port = process.argv[4];
var options = {
  host: '192.168.0.115',
  port: port,
  path: path,
  method: 'POST'
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
  res.on('end', function() {
	var str =res.headers['set-cookie'][0].split(";",1)[0];
console.log(str);
	var opt = {
  	host: '192.168.0.115',
	port: port,
	path: '/api/member',
  	method: 'GET',
	headers: {'cookie': str}
	};
	//options.headers: options.headers || {};
	console.log(JSON.stringify(opt));
  	//options.headers['set-cookie'] = res.headers['set-cookie'];
	//console.log(JSON.stringify(opt.headers));
        var req1 = http.request(opt, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  	});
        req1.end();
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

var postFile = process.argv[2];
if(undefined === process.argv[2]) postFile = './json/synchronize.json';

req.end(fs.readFileSync(postFile));

