var moment = require('moment');

exports.getCreatedAt = function (d) {
    return moment(d).format('YYYY-MM-DD');
};

exports.format_date = function(date,friendly) {
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	
	if(friendly){
		var now = new Date();
		var mseconds = -(date.getTime()-now.getTime());
		var time_std = [1000,60*1000,60*60*1000,24*60*60*1000];
		if(mseconds < time_std[3]) {
			if(mseconds > 0 && mseconds < time_std[1]) {
				return Math.floor(mseconds/time_std[0]).toString() + ' 秒前';
			}
			if(mseconds > time_std[1] && mseconds < time_std[2]) {
				return Math.floor(mseconds/time_std[1]).toString() + ' 分钟前';
			}
			if(mseconds > time_std[2]) {
				return Math.floor(mseconds/time_std[2]).toString() + ' 小时前';
			}
		}
	}
	
	//month = ((month < 10) ? '0' : '') + month;
	//day = ((day < 10) ? '0' : '') + day;
	hour = ((hour < 10) ? '0' : '') +hour;
	minute = ((minute < 10) ? '0' : '') + minute;
	second = ((second < 10) ? '0': '') +second;
	
	return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
};

exports.getNow = function(){
    var now = new Date();
    var year = now.getFullYear();
    return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
};

exports.addMonthFromNow = function(num){
    var now = new Date();
    now.setMonth(now.getMonth()+parseInt(num)+1);
    var year = now.getFullYear();
    return (year+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+
        now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());
};

function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

function deepCopy(src, dest) {
	for(var key in src) {
		if(dest[key] !== undefined && dest[key] !== null && is('Object', src[key])) {
			deepCopy(src[key], dest[key])
		}
		else {
			dest[key] = src[key]
		}
	}
}

exports.is = is
exports.deepCopy = deepCopy
