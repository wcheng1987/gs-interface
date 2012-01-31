var http = require('http');
var db = require('./db.js');
var router = require('router').create();

var select=function(request,cb){
         var result = {status:201, headers: {'Content-Type': 'text/plain; charset=utf-8'},
                                   ,body:""};
         var obj={};
         var options = {
                table: "",
                column:"ID,name"
         }
         db.select(options,function(re){
                obj.articleCategory=re;
                result.status=200;
                result.reson='OK';
                result.body=JSON.stringify(obj);
                cb(result);
         });
}
                                 
router.get("/api/articleCategory/",function (request, response) {
                      select(request,function(result){
                            response.writeHead(result.status,result.reson,result.headers);
                            if(result.body)
                                 response.end(result.body);
                            else
                                 response.end();
                      });
});
router.listen(1338);

console.log('Server running at http://127.0.0.1:8124/');

