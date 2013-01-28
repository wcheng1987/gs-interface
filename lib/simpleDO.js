var db = require('./db')
var EventProxy = require("eventproxy").EventProxy;
var logger = require('log4js').getLogger('Simple Data Object')
var util = require('./util')

function SimpleDO() {
	this.options = {
		schema:'',
		field:'*',
		// order:{},
		// limit:{},
		query:{}
	}
	this.relations = []
	this.recordset = []
	this.foreignkey = ''
}

/**
	查询一批数据对象
	opt：查询条件以对象形式出现，例如：{query:{_id:123, field: { $lt: value }}, order:{_id:'ASC'}}
	next：回调函数，在查询完成后异步执行返回结果。
*/
SimpleDO.prototype.find = function(opt, next) {
	var self = this;
	if(typeof opt === 'function') {
		next = opt
		opt = this.options
	}
	else {
		util.deepCopy(this.options, opt)
	}
	// console.log(self.options)
	db.find(opt, function(err, rs) {
		if(err) return next(err)
		self.recordset = rs
		if(!self.relation && self.relations.length === 0) return next(err,rs)
		self.findRelations(next)
	})
}

/**
	查询与之关联数据对象，补充其数据完整性，例如：{name:'tom', school:{name:'MIT', country:'USA'}}
	recordset:当前对象数据的集合
*/
SimpleDO.prototype.findRelations = function(next) {
	if(this.recordset.length === 0) {
		return next(null, this.recordset)
	}
	
	var self = this
	var ep = new EventProxy()
	var ids = self.recordset.map(function(item) {
		return item._id
	})
	var args = self.relations.map(function(r) {
		return r.options.schema
	})
	args.push(function(data1, data2) {
		var args = Array.prototype.slice.apply(arguments)
		args.push(next)
		self.makeup.apply(self, args)
		// logger.trace(JSON.stringify(self.recordset))
		// logger.trace(self.recordset)
	})

	ep.assign.apply(ep, args)
	self.relations.forEach(function(r){
		r.options.query[r.foreignkey] = {$in:ids}
		r.find(function(err, rs){
			if(err) return next(err)
			ep.trigger(r.options.schema, rs)
		})
	})
}

/**
	关联对象数据和主对象组装的原型，用于子类覆盖
*/
SimpleDO.prototype.makeup = function(data1, data2, next) {
}

/**
    查询一个数据对象
    opt：查询条件以对象形式出现，例如：{query:{_id:123}}
    cb：回调函数，在查询完成后异步执行返回结果。
*/
SimpleDO.prototype.findOne = function(opt, next) {
	if(typeof opt === 'function') {
		next = opt
		opt = {}
	}
	opt.limit = {start:1, end:1}
	this.find(opt, function(err, rs){
		next(err, rs[0])
	})
}

/**
 * 根据条件获得数据的行数
 * @param opt 查询条件
 * @param cb 回调
 
SimpleDO.prototype.count = function(opt, cb) {
    var sql = "SELECT COUNT(*) AS count FROM "+
        this.schema+" where 1=1 "+opt.where;
    if(opt.bt) sql += " and create_time >= '"+ opt.bt + "' ";
    if(opt.et) sql += " and create_time <= '"+ opt.et + "' ";

    mysql.query(sql, function(err, rs) {
        if(err) return cb(err);
        if(!rs.length) return cb(err);
        cb(err, rs[0]);
    });
};

/**
 * 更新
 * @param fields 更新数据对象
 * @param cb 回调
 
SimpleDO.prototype.update = function(fields, cb) {
    var opt = {
        table: this.schema,
        fields: fields
    };
    mysql.update(opt, function(err, info) {
        if(err) return next(err);
        return cb(err, info);
    });
};

/**
 * 创建
 * @param body 提交数据对象
 * @param cb 回调
 
SimpleDO.prototype.create = function(fields, cb) {
    var opt = {
        table: this.schema,
        fields: fields
    };
    mysql.insert(opt, function(err, info) {
        if(err) return next(err);
        return cb(err, info);
    });
};

/**
 * **********   暂时不用，以后可删除   ************
 * 删除一批数据
 * @param _ids 序号(由,分隔，例如：01,02,03)
 * @param cb 回调
 
SimpleDO.prototype.deleteByIds = function(_ids, cb) {
    var sql = " delete from "
        +this.schema
        +" where _id in("+_ids+") ";
    mysql.query(sql, function(err, rs) {
        if(err) return cb(err);
        cb(err, rs);
    });
};

/**
 * 删除指定ID数据
 * @param _id 序号(由,分隔，例如：01,02,03)
 * @param cb 回调
 
SimpleDO.prototype.delete = function(_id, cb) {
    var sql = "";
    if(_id.toString().indexOf(",") == -1){
        sql = " delete from "
            +this.schema
            +" where _id ="+_id;
    }else{
        sql = " delete from "
            +this.schema
            +" where _id in("+_id+") ";
    }
    mysql.query(sql, function(err, rs) {
        if(err) return cb(err);
        cb(err, rs);
    });
};
*/
exports = module.exports = SimpleDO;