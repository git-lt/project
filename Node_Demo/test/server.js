var http = require('http');
var url = require('url');

function serverStart(route,handle){
	http.createServer(function(req,res){
		var pathName = url.parse(req.url).pathname;
		console.log('http request for '+pathname+' recieved');

		route(route,handle,res,req);
	}).listen(3000,'127.0.0.1');

	console.log('http server start on port 3000');
};

exports.serverStart = serverStart;