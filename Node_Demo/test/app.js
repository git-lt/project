//引用模块
var http = require('http');
var Person = require('./Person.Class');

//添加解析url的模块：url(原生自带) 和 querystring(需要安装)
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req,res){
	//http://127.0.0.1:8585/login?id=1&name=aaa
	console.log(req.url);//   /login?id=1&name=aaa
	var path = url.parse(req.url).pathname;
	var pms = url.parse(req.url).query;

	// var p1 = querystring(req.url)['id'];
	// var p2 = querystring(req.url)['name'];

	console.log(path);
	console.log(pms);
	console.log(querystring);
	// console.log(p2);

	//调用模块中的方法：
	var person1= new Person();
	 person1.setName('jack');
	 person1.sayHello();
	 console.log('==========End');


	//发到前台的消息 
	res.writeHead(200,{'Content-Type':'text/plain'});
	res.write('Hello world!\r\n');
	res.end('结束输出了');

});
server.listen(8585);

server.on('connection',function(arg){
console.log('新增一个新的连接！');
});


console.log('server running at 127.0.0.1:8585');



