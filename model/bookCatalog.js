var SimpleDO = require('../lib/simpleDO')
var config = require('config.js').config
var logger = require('log4js').getLogger('BookCatalog Model')

var stack = 0
, maxStack = 5
function BookCatalog() {
	this.options = {
		schema:'gs_bookcatalog',
		field:['_id', 'name', 'wordcount AS wordCount', 'createtime AS createTime', 'coverImage', 'parent_id', 'level', 'leaf'],
		order:{parent_id:'ASC'},
		query:{}
	}
	this.relations = ++stack < maxStack? [new BookCatalog()]:[]
	this.foreignkey = 'parent_id'
}

BookCatalog.prototype = new SimpleDO()
BookCatalog.prototype.find = function(opt, next) {
	if(typeof opt === 'object' && opt.query && opt.query.level) {
		this.relations = []
	}
	SimpleDO.prototype.find.apply(this, arguments)
}
BookCatalog.prototype.makeup = function(catalog, next) {
	this.recordset = this.recordset.concat(catalog);
	// console.log('==',this.recordset, "\r\n==", arguments)
	next(null, this.recordset);
}

exports = module.exports = BookCatalog