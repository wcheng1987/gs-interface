var db = require('./db.js');

exports.add = function(req, res) {
	console.log(req.body);
//add this record into examinfo
	var lid = req.body.lid;
	delete req.body.lid;
	var opt = {
		table:"gs_examinfo"
		,fields: req.body
	};
	db.insert(opt, function(gid) {
//add item records of this exam into itemAnswer 
		opt.table = "gs_examitemanswer";
		for(var k = 0, len = req.body.itemRecord.length; k < len; k++) {
			console.log("k=",k);
			(function () {
				var ir = req.body.itemRecord[k];
				ir.parent_id = gid;
		//		console.log(ir);
				opt.fields = ir; 
				db.insert(opt, function() {});
			}());
		}
		
		res.json({_id:gid, lid:lid});
	});
	//res.send(200);
	//var sql = 'insert into examinfo set lid'
}
