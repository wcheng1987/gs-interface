var fs = require('fs');
var http = require('http');

//var host = '127.0.0.1'
var host = '192.168.0.115'
var port = 1339;
//var path = '/api/members/619';
var path = '/api/exam_records/';
//var path = '/api/login';
if(process.argv[3]) path = process.argv[3];
if(process.argv[4]) port = process.argv[4];
var options = {
  host: host,
  port: port,
  path: path,
  method: 'PUT',
  headers: {'Content-Type': 'application/json'}
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

var postFile = process.argv[2];
if(undefined === process.argv[2]) postFile = './json/record.json';

req.end(fs.readFileSync(postFile));
