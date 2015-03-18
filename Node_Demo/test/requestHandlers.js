var querystring = require('querystring'),
	fs = require('fs'),
	formidable = require('formidable');

function start(response){
	console.log('request handler "start" was called');

	var body = '<html><body>';
		body += '<form action="/upload" method="post" enctype="multipart/form-data">';
		body += '<input type="file" name="upload"/><input type="submit" value="upload file">';
		body += '</body></html>';

	response.writeHead(200,{'Content-Type':'text/html'});
	response.write(body);
	response.end();
}

function upload (response,postData){
	console.log('request handler "upload" was called');

	var form = new formidable.IncomingForm();
	form.parse(request,function(error,fields,files){
		fs.renameSync(file.upload.path,'/tmp/test.png');
		response.writeHead(200,{'Content-Type':'text/html'});
		response.write('image:<br/><image src="/show" />');
		response.end();
	});
}

function show(response,postData){
	console.log('request handler "show" was called');

	fs.readFile('/tmp/test.png','binary',function(error,file){
		if(error){
			response.writeHead(500,{'Content-Type':'image/png'});
			response.write(file,'binary');
			response.end();
		}else{
			response.writeHead(200,{'Content-Type':'image/png'});
			response.write(file,'binary');
			response.end();
		}
	});
}

exports.start = start;
exports.upload = upload;
exports.show = show;