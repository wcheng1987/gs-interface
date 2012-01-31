var url = require('url');
var qs = require('querystring');
var db = require('./db.js');

var selectModifyUser=function(user,i,cb){
       var options = {
                table: "admin",
                fields: {
                         _id:user
                },
                cbParam:i,
                column:"username"
        }
        console.log(i);
        db.select1(options, function(re,i) {
                cb(re,i);
        });
}

var selectCreateUser=function(user,cb){
       var options = {
                table: "admin",
                fields: {
                         _id:user
                },
                column:"username"
        }
        db.select1(options, function(re) {
                cb(re);
        });
}

var selectModifyUser1=function(user,cb){
       var options = {
                table: "admin",
                fields: {
                         _id:user
                },
                column:"username"
        }
        db.select1(options, function(re) {
                cb(re);
        });
}

exports.select=function(request,cb){
         var obj=url.parse(request.url);
         var o=qs.parse(obj.query);
         var result = {status:404, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   reson:"Not Found",body:""};
         console.log(o);
         console.log(obj.pathname);
         newss={};
         if(o.start){
              start=parseInt(o.start);
              o.start=parseInt(o.start)-1;
         }
         else{
              start=1;
              o.start=0;
         }
         if(o.end){
              end=parseInt(o.end);
              o.end=parseInt(o.end)-1;
         }
         else{
              end=5;
              o.end=4;
         }
         o.end=o.end-o.start+1;
         console.log(o);
         o.high=1;
         o.table="gs_news";
         o.fields=' _id,title,modifytime,modifyuser,imageurl ';
         db.select2(o,function(rsp){
            if(start)
               newss.start=start;
            if(end)
               newss.end=end;
            newss.news=rsp;
            console.log(newss);
            console.log(result);
            done=0;
            for(var i=0,len=rsp.length;i<len;i++){
                console.log(rsp[i]._id);
                newss.news[i].url=global+rsp[i]._id;
                newss.news[i].imageurl=goble+newss.news[i].imageurl;//"http://192.168.0.25:8080/gs_ctrl_web/UploadFiles//image//1325911677031//7.jpg";//goble+newss.news[i].imageurl;
                var reg=new RegExp("\\\\","g");
                newss.news[i].imageurl=newss.news[i].imageurl.replace(reg,"\/");     
                delete newss.news[i]._id;
                selectModifyUser(rsp[i].modifyuser,i,function(set,j){
                                 newss.news[j].modifyuser=set[0].username;
				 console.log("News Done:",done,len);
                                 if(++done >= len){
                                         if(newss){
                                            result.status=200;
                                            result.reson='OK';
                                            if(newss.news.length<o.end)
                                                   newss.end=newss.start+newss.news.length-1;
                                            result.body=JSON.stringify(newss);
                                            cb(result);
                                         }
                                         else {
                                            result.status=204;
                                            result.reson='Not Content';
                                            cb(result);
                                         }                                               
                                 }
                              
                });
            }
         });
}

exports.selectNews=function(request,cb){
         var result = {status:404, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                 body:'',reson:"Not Found"};
         var id=parseInt(request.params.id);
         var options = {
                table: "gs_news",
                fields: {
                         _id:id
                },
                column:" _id,title,content,createtime,modifytime,createuser,modifyuser,imageurl "
         }
         db.select1(options, function(re) {
                re[0].imageurl=goble+re[0].imageurl;
                var reg=new RegExp("\\\\","g");
                re[0].imageurl=re[0].imageurl.replace(reg,"\/");
                selectModifyUser1(re[0].modifyuser,function(set){
                        re[0].modifyuser=set[0].username;
                        selectCreateUser(re[0].createuser,function(se){
                                 re[0].createuser=se[0].username;
                                 result.status=200;
                                 result.reson="OK";
                                 result.body=JSON.stringify(re[0]);
                                 cb(result);
                        });
                });
         });                    
}

