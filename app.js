var express = require('express');
var app = module.exports = express.createServer();

var news = require('./news.js');
var examclass = require('./examclass.js');
var exampaper = require('./exampaper.js');
var examitem = require('./examitem.js');
var examRecord = require('./examRecord.js');
var member = require('./member.js');
var location = require('./location.js');


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
       req.session.member._id == req.params.id) next();
    else res.send(401);
    //next(new Error('Unauthorized'));
}

app.get("/api/newss/", news.list);
app.get("/api/newss/:id", news.query);

app.post("/api/members/", member.add);
app.post("/api/login", member.login);
app.get("/api/members/:id", andRestrictToSelf, member.query);
app.put("/api/members/:id", andRestrictToSelf, member.update);
app.get("/api/members/:id/friends", andRestrictToSelf, member.friends);

app.get("/api/exampapers/", exampaper.query);

app.post("/api/exam_records/", andRestrictAuth, examRecord.add);
app.put("/api/exam_records/", andRestrictAuth, examRecord.sync);

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

app.get("/api/industries/", examclass.getIndustry);

app.get('/api/locations/', location.index);

app.listen(1339);

console.log("GSTE server listening on port %d in %s mode", 
                app.address().port, app.settings.env);

