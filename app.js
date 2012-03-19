var express = require('express');
var app = module.exports = express.createServer();

var news = require('./news.js');
var examclass = require('./examclass.js');
var exampaper = require('./exampaper.js');
var examitem = require('./examitem.js');
var examRecord = require('./examRecord.js');
var member = require('./member.js');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser())
  app.use(express.session({ secret: 'keyboard cat'}))
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function andRestrictAuth(req, res, next) {
    if(req.session.member) next();
    else res.send(401);
        //next(new Error('Unauthorized'));
}

function andRestrictToSelf(req, res, next) {
    if(req.session.member &&
       req.session.member._id == req.param.id) next();
    else res.send(401);
    //next(new Error('Unauthorized'));
}


goble="http://192.168.0.115:8082/gs_ctrl_web";
global="http://192.168.0.115:1339/api/newss/";

var fs = require('fs');
app.get("/api", function(req, res) { fs.readFile("non.log", function(err) { if(err) throw err;})});  
app.post("/api/members/", member.add);
app.post("/api/login", member.login);
app.get("/api/members/:id", andRestrictToSelf, member.query);
app.put("/api/members/:id", andRestrictToSelf, member.update);

app.get("/api/exampapers/", exampaper.query);

app.post("/api/exam_records/", andRestrictAuth, examRecord.add);
app.put("/api/exam_records/", andRestrictAuth, examRecord.sync);
//app.put("/api/exam_records/", examRecord.sync);

app.get("/api/exampapers/:id",function (request, response) {
                      examitem.packData(request,function(result){
                      //examitem.select(request,function(result){
                           // response.send(result.reson,result.status);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                            else
                                 response.send(result.status);
                      });
});

app.get("/api/industries/",function (request, response) {
                      examclass.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                            else
                                 response.send(result.status);
                      });
});


app.get("/api/newss/",function (request, response) {
                      news.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                            else
                                 response.send(result.status);
                      });
});

app.get("/api/newss/:id",function (request, response) {
                      console.log("aaaaa");
                      news.selectNews(request,function(result){
                            //response.writeHead(result.status,result.reson, result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                            else
                                 response.send(result.status);
                      });
});


app.listen(1339);

console.log("GSTE server listening on port %d in %s mode", 
                app.address().port, app.settings.env);

