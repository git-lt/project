var fs = require('fs');
var url = require('url');
var path = require('path');

function route(handle,pathname,request,response){
	console.log(__filename);
	if(typeof handle[pathname] === 'function'){
		return handle[pathname](response,request);
	}else{
		path.exists(pathname,function(exists){
			if(exists){
				fs.readFile('.'+pathname,'binary',function(err,data){
							if(err){
								response.end('Error reading file!');
							}else{
								//获取后缀名：css js html
								var ext = pathname.match(/(\.[^.]+|)$/)[0];

								//匹配文档类型
								var contentType = {
									'.css':'text/css',
									'.js': 'application/javascript',
									'.html': 'text/html',
									'.jpg':'image/jpeg',
									".json": "application/json",
									".gif": "image/gif",
								    ".ico": "image/x-icon",
								    ".jpeg": "image/jpeg",
								    ".pdf": "application/pdf",
								    ".png": "image/png",
								    ".svg": "image/svg+xml",
								    ".swf": "application/x-shockwave-flash",
								    ".tiff": "image/tiff",
								    ".txt": "text/plain",
								    ".wav": "audio/x-wav",
								    ".wma": "audio/x-ms-wma",
								    ".wmv": "video/x-ms-wmv",
								    ".xml": "text/xml"
								}[ext];
								console.log('=>后缀：'+ext+'  文档类型：'+contentType);
								response.writeHead(200,{'Content-Type':contentType});
								response.write(data,'binary');
								response.end();
							}
				});
			}else{
				response.writeHead(404,{'Content-Type':'text/html'});
				response.write('<head><meta charset="utf-8"/></head>');
				response.write('请求地址：'+pathname);
				response.end('<br />404 not found!');
			}

		});
		
	}
}

exports.route = route;