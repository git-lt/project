var http = require('http');
var url = require('url');
var util = require('util');

var querystring = require('querystring');

//GET请求中参数的处理：
// http.createServer(function(req,res){
// 	res.writeHead(200,{'Content-Type':'text/plain'});
// 	res.write(util.inspect(url.parse(req.url,true)));
// 	res.end(util.inspect(url.parse(req.url,true).query));
// }).listen(3000);
// console.log('server starting');


//POST请求体的内容处理
http.createServer(function(req,res){
	var data= '';
	req.on('data',function(chunk){
		data+=chunk
	});
	req.on('end',function(){
		data= querystring.parse(data);
		res.end(util.inspect(data));
	});

}).listen(3000);





// { protocol: null,
//   slashes: null,
//   auth: null,
//   host: null,
//   port: null,
//   hostname: null,
//   hash: null,
//   search: '?name=w3c&email=w3c@w3cschool.cc',
//   query: { name: 'w3c', email: 'w3c@w3cschool.cc' },
//   pathname: '/user',
//   path: '/user?name=w3c&email=w3c@w3cschool.cc',
//   href: '/user?name=w3c&email=w3c@w3cschool.cc' }
// { name: 'w3c', email: 'w3c@w3cschool.cc' }



