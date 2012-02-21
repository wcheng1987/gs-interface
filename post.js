var fs = require('fs');
var http = require('http');

var port = 1339;
var path = '/api/exam_records/';
if(process.argv[3]) port = process.argv[3];
if(process.argv[4]) port = process.argv[4];
var options = {
  host: '127.0.0.1',
  port: port,
  path: path,
  method: 'POST',
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

//var json = fs.readFileSync(postFile);
//req.end(json);
req.end(fs.readFileSync(postFile));
