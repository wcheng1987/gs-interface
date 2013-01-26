/*
  routes.js
	Copyright (c) 2012 guanbo <gbo@extensivepro.com>
*/

var news = require('./lib/news.js');
var examclass = require('./lib/examclass.js');
var exampaper = require('./lib/exampaper.js');
// var examitem = require('./lib/examitem.js');
var examRecord = require('./lib/examRecord.js');
var member = require('./lib/member.js');
var location = require('./lib/location.js');
var listeningRecord = require('./lib/listeningRecord.js');
var listeningErrorRedoRecord = require('./lib/listeningErrorRedoRecord.js');

var fs = require('./lib/fileServer.js');
var audioPaper = require('./controller/audioPaper')
var word = require('./controller/word')
var bookCatalog = require('./controller/bookCatalog')

function andRestrictAuth(req, res, next) {
  if(req.session.member) next();
  else {
		res.send(401);
	}
      //next(new Error('Unauthorized'));
}

function andRestrictToSelf(req, res, next) {
    if(req.session.member &&
       req.session.member._id == req.params.id) next();
    else res.send(401);
    //next(new Error('Unauthorized'));
}

exports = module.exports = function(app) {
	app.get("/api/newss/", news.list);
	app.get("/api/newss/:id", news.query);

	app.post("/api/members/", member.add);
	app.post("/api/login", member.login);
	app.get("/api/members/:id", andRestrictToSelf, member.query);
	app.put("/api/members/:id", andRestrictToSelf, member.update);
	app.get("/api/members/:id/friends", andRestrictToSelf, member.friends);
	app.get("/api/members/:id/audio_paper", andRestrictAuth, member.audioPaper);

	app.get("/api/exampapers/", exampaper.query);

	app.post("/api/exam_records/", andRestrictAuth, examRecord.add);
	app.put("/api/exam_records/", andRestrictAuth, examRecord.sync);

	// app.get("/api/exampapers/:id",function (request, response) {
	//                       examitem.packData(request,function(result){
	//                             if(result.body)
	//                                  response.send(result.body,{ 'Content-Type': 'application/json' },result.status);
	//                             else
	//                                  response.send(result.status);
	//                       });
	// });
	app.get("/api/industries/", examclass.getIndustry);
	app.get('/api/locations/', location.index);

	app.post('/api/write_records', andRestrictAuth,listeningRecord.add);
	app.put('/api/write_records', andRestrictAuth, listeningRecord.sync);
	app.post('/api/error_write_records', andRestrictAuth,listeningErrorRedoRecord.add);
	
	app.get('/files/:type?/*', fs.get);
	
	app.get('/api/audio_paper', audioPaper.get)
	app.get('/api/audio_paper/public_timeline', audioPaper.publicTimeLine)
	app.get('/api/words', word.get)
	app.get('/api/book_catalogs', bookCatalog.get)
};