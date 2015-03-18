var http = require('http');
var url = require('url');

function serverStart(route,handler){
	http.createServer(function(req,res){
		var pathName = url.parse(req.url).pathname;
		console.log('Request URL: '+pathName);

		route(handler,pathName,req,res);
	}).listen(3000,'127.0.0.1');

	console.log('http server start on 127.0.0.1:3000');
}


exports.serverStart = serverStart;