var mysql = require('mysql');
var env = require('env.json');

var connection = connect();

process.env.TZ = env.mysql.timezone;
//connection.utc=true;

heartBeat();

function connect() {
    var connection = mysql.createConnection(env.mysql);

    connection.connect();
    connection.on('error', errorHandler);

    return connection;
}

// For reconnect automation
function heartBeat() {
    setTimeout(function() {
		connection.query("SELECT 1", function(err) {
	        if (err) {
	            console.log('MySQL error ' + err);
		        connection = connect();
	        }
		})
    }, 3000);
}

// Error handler for uncaught MySql errors.

function errorHandler(err) {

    console.log('MySQL error ' + err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('MySQL connection lost. Reconnecting.');
        connection = connect();
    } else if (err.code === 'ECONNREFUSED') {
        console.log('MySQL connection refused. Trying soon again.');
        setTimeout(function() {
            connection = connect();
        }, 3000);
    } else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
    	console.log('MySQL socket disconnect. Reconnecting.');
		connection = connect();
    }
}

// For general queries. Delegates to
// client.query.

function query(sql, params, cb) {
    var start = Date.now();
	if (typeof params === 'function') {
		cb = params;
	    params = undefined;
	} 
    connection.query(sql, params, function(err, data) {
        console.log(sql + ' ' + (Date.now() - start) + 'ms');
        if (err) {
            console.log('MySQL error ' + err);
        }
        cb(err, data);
    });
}

// Closes connection.

function close() {
    connection.end();
}

// Queries single row.

function findOne(sql, params, cb) {
	if (typeof params === 'function') {
		cb = params;
	    params = undefined;
	} 
    query(sql, params, function(err, results) {
        if (err) {
            cb(err);
        } else if (results.length === 0) {
            cb(null);
        } else {
            cb(null, results[0]);
        }
    });
}

// Helper method to execute aggregate queries
// such as SELECT COUNT(*).

function scalar(sql, params, cb) {
    single(sql, params, function(err, row) {
        if (err) {
            cb(err);
        } else if (row) {
            cb(null, row[Object.keys(row)[0]]);
        } else {
            cb(null);
        }
    });
}

exports.query = query;
exports.close = close;
exports.findOne = findOne;
exports.scalar = scalar;

exports.find = function(opt, cb) {
    var sql = "SELECT ";
    if(opt.field) {
        sql += opt.field.join();
    } else {
        sql += '*';
    }
    sql += ' FROM '+opt.schema+' WHERE 1';
    console.log(opt);
    for(var key in opt.query) {
        var value = opt.query[key];
        if(typeof value == 'string') {
            sql += ' AND '+key+' = "'+value+'"';
        } else if(typeof value == 'number') {
            sql += ' AND '+key+' = '+value;
        } else if(typeof value == 'object') {
            for(var op in value) {
                if(op === '$in') {
                    sql += ' AND '+key+' IN ('+value[op]+')';
                } else {
                    sql += ' AND '+key+' '+op+' '+value[op];
                }
            }
        }
    }
    if(opt.order) {
        sql += ' ORDER BY'
        for(var f in opt.order) {
            sql += ' '+f+' '+opt.order[f];
        }
    }
    query(sql, cb);
}

//TODO: refactory following code
exports.errorHandle = function(err, rs, cb) {
	var ret = true;
	if(err) {
		cb({status:500});
		ret = false;
	}
	else if(rs.length == 0 && !rs.allowNull) {
		console.log("can not find record");
		cb({status:204});
		ret = false;
	}	
	return ret;
}

exports.select2 = function(o, cb) {
        console.log("aaa");
        console.log(o);
        var sql = 'select '+o.fields+' from '+o.table;
        if(o.high)
                sql +=" where highlight=1 ";
        else 
                sql +=" where highlight is null ";        
        if(o.bdt)
                sql += " and modifytime>= '"+o.bdt+"'" ;
        if(o.edt)
                sql += " and modifytime<= '"+o.edt+"'";
        sql += " order by modifytime DESC ";        
        if(o.start || o.start===0){
                sql +=' limit '+o.start+','+o.end;
        }   
        console.log(sql);
        connection.query(sql,  function(err, result, fields) {
                if(err) throw err;
                console.log(result);
                len=result.length;
                if(len<o.end){
                     var b={
                           start:0,
                           end:o.end-len,
                           fields:' _id,title,modifytime,modifyuser,imageurl ',
                           table:"gs_news",
                           bdt:o.bdt,
                           edt:o.edt
                     }
                     select3(b,function(re){
                          if(re.length===0)
                                   cb(result);
                          done=0;
                          for(var i=0,lem=re.length;i<lem;i++){
                                 result[len+i]=re[i];
                                 if(++done >= lem){
                                        cb(result);
//                                        connection.end();
                                 }
                          
                          }
                     });
                }
                else
                      cb(result);
//              connection.end();
        });
};

var select3 = function(o, cb) {
        var sql = 'select '+o.fields+' from '+o.table;
        if(o.high)
                sql +=" where highlight=1 ";
        else
                sql +=" where highlight is null ";
        if(o.bdt)
                sql += " and modifytime>= '"+o.bdt+"'" ;
        if(o.edt)
                sql += " and modifytime<= '"+o.edt+"'";
        sql += " order by modifytime DESC ";
        if(o.start || o.start===0){
                sql +=' limit '+o.start+','+o.end;
        }
        console.log(sql);
        connection.query(sql,  function(err, result, fields) {
                if(err) throw err;
                console.log(result);
                cb(result);
//              connection.end();
        });
};

exports.select1 = function(options,cb) {
        var sql = 'select '+options.column+' from '+options.table+' where ';
        console.log(sql);
        for(var k in options.fields) {
                var value = options.fields[k];
                if(typeof value != 'object'){
                       if(value){
                             if(typeof value =='number')
                                   sql += options.table+'.'+k+'='+value+' and ';
                             else{
                                   if(value==="null")
                                      sql += options.table+'.'+k+" is null and ";
                                   else
                                      sql += options.table+'.'+k+"='"+value+"' and ";
                             }
                       }
                }
        }
        sql = sql.slice(0,-4);
        console.log(sql);
        connection.query(sql, function(err,result) {
                if(err) throw err;
//                connection.end();
                var a=options.cbParam;
                var b=options.cba;
                var c=options.cb;
                console.log(result);
                console.log('guanbo:'+a+':'+b,c);
                cb(result,a,b,c);

        });
};

exports.insert = function(options, cb) {
        var sql = 'insert into '+options.table+' set ';
        var values = [];
        var len = options.fields.length;
        for(var k in options.fields) {
                var value = options.fields[k];
                if(typeof value != 'object' &&
                   typeof value != 'array') {
                        sql += options.table+'.'+k+' = ?, ';
                        values.push(value);
                }
        }
        sql = sql.slice(0,-2);
        console.log(sql);
        console.log(values);
        connection.query(sql, values, function(err, info) {
            if(err) console.log(err.stack);
            var a=options.cbParam;
            cb(info.insertId,a);
        });
};

exports.update = function(options, cb) {
        var sql = 'update '+options.table+' set ';
        var values = [];
        if(typeof options.fields == 'object')
        {
        //var len = options.fields.length;
        for(var k in options.fields) {
                var value = options.fields[k];
                if(typeof value != 'object' &&
                   typeof value != 'array') {
                        sql += options.table+'.'+k+' = ?, ';
                        values.push(value);
                }
        }
        sql = sql.slice(0,-2);
        }
        else {
                sql += options.fields;
                values = options.values;
        }
        if(options.where) {
                sql += ' where '+options.where;
        }
        console.log(sql);
        console.log(values);
        connection.query(sql, values, function(err, info) {
                if(err) throw err;
                var a=options.b;
                cb(a);
        });
};

