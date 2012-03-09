var db = require('./db.js');


var errorHandle = function(err, rs, cb) {
	var ret = true;
	if(err) {
		//throw err;
		console.log(err.stack);
		cb({status:500});
		ret = false;
	}
	else if(rs.length == 0 && !rs.allowNull) {
		console.log("Recordset is null, the paper contents are incorrect!!!");
		cb({status:404});
		ret = false;
	}	
	return ret;
}

var packDone = function(param, cb) {
	result = { 
		status:200
		,body:param.json
	}
	cb(result);
	console.log(JSON.stringify(param.json));
}

var queryMultistem = function(param, cb) {
	if(param.msArr.length > 0) {
		param.rs = param.msItemArr;
		param.sql = "select _id, parent_id, type, content, answer, analysis, score, number from gs_examitem where `parent_id` in ("+param.msArr+") order by parent_id, number";
		param.allowNull = true;
		queryItems(param, cb);
	}
	else {
		packDone(param, cb);
	};
}

var queryOptions = function(param, cb) {
	var sql = "SELECT _id, item_id, text, rightanswer, number FROM `gs_examoption` WHERE `item_id` in ("+param.optArr+") order by item_id, number";

	db.query(sql, function(err, result, fields) {
		if(!errorHandle(err, result, cb)) return;
		console.log(result);
		var item = {_id:0};
		result.map(function(set) {
			if(item._id != set.item_id) {
				//delete item._id;
				param.optItemArr.some(function(row) {
					item = row;
					return (item._id == set.item_id);
				});
				item.option = []; 
			}
			delete set.item_id;
			if(item.type == 1 || 4 == item.type) {
				delete set.rightanswer;
				item.option.push(set);
			}
			else if(item.type == 2) {
				item.option.push(set);
			}
			console.log(set);
		});
		queryMultistem(param, cb);	
	});
}

function someThing(item, arr, _id) {
	if(item._id != _id) {
		arr.some(function(row) {
			item = row;
			return (item._id == _id);
		});
	}
	return item;
}

var queryItems = function(param, cb) {
	db.query(param.sql, function(err, result, fields) {
		if(param.allowNull) {
			result.allowNull = param.allowNull;
			delete param.allowNull;//clear status
		}
		if(!errorHandle(err, result, cb)) return;
		if(0 == result.length) {
			packDone(param, cb);
			return;
		}
		param.optArr = [];
		param.optItemArr = [];
		param.msArr = []; //multistem question
		param.msItemArr = [];
		var item = param.rs[0];
		result.map(function(set) {
			if(null != set.itemtype_id) {
				item = someThing(item, param.rs, set.itemtype_id);
				item.examItem.push(set);
		//		delete item._id;
				delete set.itemtype_id;
			}
			else if(null != set.parent_id) {//for multistem question
				item = someThing(item, param.rs, set.parent_id);
				item.question.push(set);
				delete set.parent_id;
			}
			if(3 > set.type || 4 == set.type) {
				param.optArr.push(set._id);
				param.optItemArr.push(set);
			}
			if(6 == set.type) {
				param.msArr.push(set._id); 
				set.question = [];
				param.msItemArr.push(set);
			} 
		});
		param.rs = result;
		queryOptions(param, cb);
	});
}

function packItems(param, cb) {
	db.query(param.sql, function(err, result, fields) {
		if(!errorHandle(err, result, cb)) return;
		if(!param.hasOwnProperty('json')) {
			param.json = {examItemType:result};
		}
		param.rs = result;
		typeArr = param.rs.map(function(set) {
			var _id = set._id;
			set.examItem = [];
			return _id;
		});
		param.sql = "select _id, itemtype_id, type, content, answer, analysis, score, number from gs_examitem where itemtype_id in ("+typeArr+") order by `itemtype_id`, number";
		queryItems(param, cb);
	});
}

exports.packData = function(req, cb) {
	var param = {};
	param.sql = "SELECT t1._id, title, t2.basetype type FROM gs_examitemtype t1, gs_itemtypemark t2 WHERE t1.type = t2._id AND paper_id ="+req.params.id+" order by t1._id";
	packItems(param, cb);
}
/*
var req = {
	params: {
		id:1
	}
}
exports.packData(req, null);
*/
