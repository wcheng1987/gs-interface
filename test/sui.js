exports.random=function(){
   var c="";
 for(i=0;i<9;i++)
{ 
   var iNum=Math.ceil(Math.random()*9);//产生0-9的随即数字
   var sChar1=String.fromCharCode(Math.ceil(25*Math.random()+65));//产生A-Z的字符，其对应ASC十进制为65-95
   var sChar2=String.fromCharCode(Math.ceil(25*Math.random()+97));//产生a-z的字符，其对应ASC十进制为97-122
   var sSring="";
   var sChar="";
   var a=Math.round(Math.random());
  
   a==0?sChar=sChar1:sChar=sChar2;
   b=iNum+sChar;
   c+=b;
}
return c;
}
