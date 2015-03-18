//模块引用
var http = require('http');
var url = require('url');
var util = require('util');
var querystring = require('querystring');


var server = http.createServer(function(req,res){

	//获取请求路径：
	var pathName=url.parse(req.url).pathname;
	if(!pathName.indexOf('/favicon.ico')){ return;}

	util.log('\n\r\n\r=========== BEGIN ===========>>>');

	req.setEncoding('utf-8');
	var method = req.method,
		reqData='';

	util.log('请求地址：\r\n'+pathName+'\r\n');
	util.log('请求类型: '+method+'\r\n');

	//处理GET或POST请求
	if(method==='GET'){
		reqData=url.parse(req.url,true).query;
		util.log('接收到的参数为： \r\n'+util.inspect(reqData)+'\r\n');

		var resStr = JSON.stringify(reqData);
		util.log('返回的内容：\r\n'+resStr+'\r\n');

		res.writeHead(200,{'Content-Type':'text/plain'});
		res.end(resStr);

	}else if(method==='POST'){
		req.on('data',function(chunk){
			reqData += chunk;
		});

		//输出接收到的参数
		req.on('end',function(){

			reqData=querystring.parse(reqData);
			util.debug('接收到的参数为： \r\n'+util.inspect(reqData)+'\r\n');

			var resStr = JSON.stringify(reqData);
			util.log('返回的内容：\r\n'+resStr+'\r\n');

			res.writeHead(200,{'Content-Type':'text/plain'});
			res.end(resStr);
		});
	}
});
server.listen(8585);

server.on('connection',function(arg){
    // console.log('新增的一个连接！');
});
console.log('【=== Server Running At 127.0.0.1:8585 ===】');



