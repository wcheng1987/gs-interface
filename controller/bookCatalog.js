var model = require('../model')
var BookCatalog = model.BookCatalog
var logger = require('log4js').getLogger('BookCatalog Controller')

exports.get = function(req, res, next) {
	logger.debug('Get Request Query:',req.query)
	var opt = {query:{}}
	if(req.query.name) opt.query.name = req.query.name
	if(req.query.level) opt.query.level = req.query.level
	if(req.query.parent_id) opt.query.parent_id = parseInt(req.query.parent_id)
	opt.limit = {
		start:req.query.start||1,
		end:req.query.end||30
	}
	
	var bookCatalog = new BookCatalog()
	
	bookCatalog.find(opt, function(err, bookCatalogs){
		if(err) return next(err)

		var bookCatalogsLen = bookCatalogs.length;
		if(bookCatalogsLen === 0) {
			if(opt.limit.start == 1) {
				return res.send(304)
			} else {
				return res.send(204)
			}
		}
		else {
			return res.json({bookCatalog:bookCatalogs})
		}
	})
}