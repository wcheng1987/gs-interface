var express = require('express');
var app = module.exports = express.createServer();
var query = require('./querymember.js');
var news = require('./news.js');
var examclass = require('./examclass.js');
var exampaper = require('./exampaper.js');
var examitem = require('./examitem.js');
var login = require('./login.js');
var registration = require('./registration.js');
var modifyMember = require('./modifyMember.js');
var submit = require('./submit.js');


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

goble="http://192.168.0.115:8082/gs_ctrl_web";
global="http://192.168.0.115:1339/api/newss/";

app.put("/api/member",function (request, response) {
                      if(request.session){
                         console.log("abcde",request.session.user);
                      }
                      var body = '';
                      request.on('data',function(chunk){
                             body += chunk;
                      });
                      request.on('end',function(){
                            modifyMember.modify(request,body,function(result){
                                //response.writeHead(result.status,result.reson,result.headers);
                                if(result.body)
                                     response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                                else
                                     response.send(result.status);
                            });
                      });
});


app.post("/api/member",function (request, response) {
                      var body = '';
                      request.on('data',function(chunk){
                             body += chunk;
                      });
                      request.on('end',function(){
                            registration.add(request,body,function(result){
                                //response.writeHead(result.status,result.reson,result.headers);
                                if(result.body)
                                     response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                                else
                                     response.send(result.status);
                            });
                      });
});

app.post("/api/login",function (request, response) {
                      var body = '';
                      request.on('data',function(chunk){
                             body += chunk;
                      });
                      request.on('end',function(){
                            login.auth(request,body,function(result,rs){
                                if(rs){
                                    request.session.user=rs;
                                }
                                console.log(response.headers);
                                //response.writeHead(result.status,result.reson,result.headers);
                                if(request.session)console.log("ok",request.session);
                                if(result.body)
					response.json(result.body);
                                     //response.end(result.body);
                                else
                                     response.send(result.status);
                            });
                      });
});

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


app.get("/api/exampapers/",function (request, response) {
                      exampaper.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
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


app.get("/api/member",function (request, response) {
                                console.log(request.headers);
                                console.log('member:'+JSON.stringify(request.headers));
                                if(request.session){
                                   console.log("abcde",request.session.user);
                                }
                                query.query(request,function(result){
                                      //response.writeHead(result.status,result.reson,result.headers);
                                      if(result.body)
                                           response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                                      else
                                           response.send(result.status);
                                });
});

app.post("/api/answers/:id",function (request, response) {
                      var body = '';
                      request.on('data',function(chunk){
                             body += chunk;
                      });
                      request.on('end',function(){
                            submit.submit(request,body,function(result){
                                 console.log(result.status);
                            //response.writeHead(result.status,result.reson, result.headers);
                                 if(result.body)
                                      response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
                                 else
                                      response.send(result.status);
                            });
                      });
});

app.listen(1339);

console.log('Server running at http://127.0.0.1:1339/');

