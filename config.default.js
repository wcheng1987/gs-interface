/**
 * config
 */

exports.config = {
	name: 'gs-interface',
	description: 'goldstone mobile service',
	version: '1.1.1',

	evn:'development',
	host: process.env.SERVER_HOST||'127.0.0.1', 
	port: 1339,

  mysql: {
		host: process.env.DB_HOST||"127.0.0.1",
		user: process.env.DB_USER||"root",
    password: process.env.DB_PASSWORD||"",
    database: process.env.DB_NAME||"goldstone"
  },
	session_secret: 'goldstone',
  session_cookie: { 
	  maxAge: 2592000
  },
  redis: {
		port: process.env.REDIS_PORT||6379,
		host: process.env.REDIS_HOST||"127.0.0.1"
  },
	log:{
		level:{
			development:'TRACE',
			test:'ERROR',
			production:'ERROR'
		}
	},
	
  imageBaseURL: "http://127.0.0.1:8080/gs_ctrl_web",
  files: {
		audio:{
			base:"/files/audio/",
			root:"/home/deploy/runtime/fileServer/audio/word/"
		}
	}
};