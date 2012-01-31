var express = require('express');
var app = module.exports = express.createServer();
//var query = require('./querymember.js');
var news = require('./news.js');
//var examclass = require('./examclass.js');
//var exampaper = require('./exampaper.js');
var examitem = require('./examitem.js');
var login = require('./login.js');
var registration = require('./registration.js');
var modifyMember = require('./modifyMember.js');
//var submit = require('./submit.js');
var email= require('./email.js');
var password= require('./password.js');

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
global="http://192.168.0.25:8080/gs_ctrl_web/UploadFiles";


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
                                     response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
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
                                     response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
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

app.get("/api/exampaper/:id",function (request, response) {
                      examitem.select(request,function(result){
                           // response.send(result.reson,result.status);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                            else
                                 response.send(result.status);
                      });
});

/*
app.get("/api/exampaper",function (request, response) {
                      exampaper.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                            else
                                 response.send(result.status);
                      });
});


app.get("/api/industry/",function (request, response) {
                      examclass.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                            else
                                 response.send(result.status);
                      });
});

*/
app.get("/api/newss/",function (request, response) {
                      news.select(request,function(result){
                            //response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                            else
                                 response.send(result.status);
                      });
});

app.get("/api/newss/:id",function (request, response) {
                      console.log("aaaaa");
                      news.selectNews(request,function(result){
                            //response.writeHead(result.status,result.reson, result.headers);
                            if(result.body)
                                 response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                            else
                                 response.send(result.status);
                      });
});

/*
app.get("/api/member",function (request, response) {
                                console.log(request.headers);
                                console.log('member:'+JSON.stringify(request.headers));
                                if(request.session){
                                   console.log("abcde",request.session.user);
                                }
                                query.query(request,function(result){
                                      //response.writeHead(result.status,result.reson,result.headers);
                                      if(result.body)
                                           response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
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
                                      response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                                 else
                                      response.send(result.status);
                            });
                      });
});
*/

app.get("/api/member/getpassword",function (request, response) {
                      var body = '';
                      request.on('data',function(chunk){
                             body += chunk;
                      });
                      console.log(request.body);
                      console.log("xxxx");
                      console.log(body);
                      request.on('end',function(){
                            console.log("xxxx1");
                            email.email(request,body,function(result){
                                 console.log(result.status);
                            //response.writeHead(result.status,result.reson, result.headers);
                                 if(result.body)
                                      response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                                 else
                                      response.send(result.status);
                            });
                      });
});

app.get("/api/member/forgot/password",function (request, response) {
                      password.getPassWord(request,function(result){
                              console.log(result.status);
                              if(result.status===200)
                                   response.render('password',{layout: false});
                              else
                                   response.send(result.status);
                            /*response.writeHead(result.status,result.reson, result.headers);
                              if(result.body)
                                   response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                              else
                                   response.send(result.status);*/
                      });
});

app.post("/api/member/forgot",function (request, response) {
                      modifyMember.changePW(request,function(result){
                            if(result.status===200)
                                    response.render('success',{layout: false});
                            else{
                                    response.redirect('back');
                                    response.send(result.status);
                            }
                            /*response.writeHead(result.status,result.reson, result.headers);
                              if(result.body)
                                   response.send(result.body,{ 'Content-Type': 'text/plain' },result.status);
                              else
                                   response.send(result.status);*/
                      });
});



app.listen(1341);

console.log('Server running at http://127.0.0.1:1341/');

