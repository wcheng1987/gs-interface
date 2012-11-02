# GSInterface 金石教育移动服务接口
[![Build Status](https://secure.travis-ci.org/guanbo/gs-interface.png?branch=master)](http://travis-ci.org/guanbo/gs-interface)

金石教育平台面向移动服务提供的Webservcie接口。

## 介绍

gs-interface 是基于 [**Node.js**](http://nodejs.org) 和 **MySQL** 开发。

## 安装部署

```bash
//clone expro future project
git clone git://github.com/guanbo/gs-interface.git  
cd gs-interface
npm install ./
// modify the env file as yours
mysql -uroot -p123456 goldstone < seed.sql
node app.js
```
