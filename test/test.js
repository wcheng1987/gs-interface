var a={ host: '192.168.0.115:8002',
  'user-agent': 'FMCG/1.0 CFNetwork/548.0.3 Darwin/10.8.0',
  'content-length': '243172',
  accept: '*/*',
  user: '18912345678',
  password: '123456',
  'content-type': 'image/jpg',
  'accept-language': 'zh-cn',
  'accept-encoding': 'gzip, deflate',
  connection: 'keep-alive' };
var b=a['content-type'];
console.log(b)
var s=a.'content-type'.split("/");
console.log(s);
