var express = require('express');
var RedisStore = require('connect-redis')(express);
var app = module.exports = express.createServer();

var config = require('config.js').config;
var log4js = require('log4js');
var logger = log4js.getLogger('APP');
log4js.setGlobalLogLevel(config.log.level[process.env.NODE_ENV]);

var routes = require('./routes.js');

log4js.replaceConsole();


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser())
  // app.use(express.session({ secret: 'keyboard cat'}))
  app.use(express.session({
	  store: new RedisStore(config.redis),
	  secret: config.session_secret,
	  cookie: config.session_cookie
  }));
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

routes(app);

app.listen(config.port);

logger.info("GSTE server listening on port %d in %s mode", app.address().port, app.settings.env);

