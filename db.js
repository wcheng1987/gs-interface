var mysql = require('mysql');
var env = require('env.json');
var client = mysql.createClient(env.mysql);

process.env.TZ = env.mysql.timezone;
client.utc=true;

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

exports.query = function(sql, cb) { 
    console.log(sql);
    return client.query(sql, function(err, rs, fields) {
        if(err) console.log(err.stack);
        cb(err, rs, fields);
    });
}

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
    exports.query(sql, cb);
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
        client.query(sql,  function(err, result, fields) {
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
//                                        client.end();
                                 }
                          
                          }
                     });
                }
                else
                      cb(result);
//              client.end();
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
        client.query(sql,  function(err, result, fields) {
                if(err) throw err;
                console.log(result);
                cb(result);
//              client.end();
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
        client.query(sql, function(err,result) {
                if(err) throw err;
//                client.end();
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
        client.query(sql, values, function(err, info) {
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
        client.query(sql, values, function(err, info) {
                if(err) throw err;
                var a=options.b;
                cb(a);
        });
};

