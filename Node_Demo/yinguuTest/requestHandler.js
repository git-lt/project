var url = require('url'),
	fs = require('fs'),
	formidable = require('formidable'),
	util = require('util');

function start(res){
	console.log('request handler start was called');

	res.writeHead(200,{'Content-Type':'text/html'});
	res.write('<head><meta charset="utf-8"/></head>');  
	res.end(
	 		'<form action="/upload?aa=1" enctype="multipart/form-data" method="post">'+  
	            '<input type="text" name="title"><br>'+  
	            '<input type="file" name="upload" multiple="multiple"><br>'+  
	            '<input type="submit" value="上传">'+  
            '</form>' 
     ); 
}

function upload(res,req){
	console.log('request handler upload was called');
	// console.log(req.url)
	var url_pms =url.parse(req.url, true).query
	// console.log(url_pms);
	var form = new formidable.IncomingForm();
	form.uploadDir = 'E:/'
	form.parse(req,function(error,fields,files){
		// var pms = util.inspect({fields:fields,files:files});
		// { 
			// fields: { title: 'asdfasdf' }, 
			// files: { 
				// upload: { 
				// domain: null, 
				// _events: {}, 
				// _maxListeners: 10, 
				// size: 259203, 
				// path: 'E:\\aba8d8b518aa84da8ecdb68c2cc54505', 
				// name: 'Gift_back.jpg', 
				// type: 'image/jpeg', } 
				// } 
		// }

		fs.rename(files.upload.path, 'E:/test.jpg', function(err) {
	      if (err) {
	      	console.log('error in');
	        fs.unlink('E:/test.jpg');
	        fs.rename(files.upload.path, 'E:/test.jpg');
	      }
	    });  

		res.writeHead(200,{'Content-Type':'text/html'});
		res.write("image:</br>");
	   	res.write("<image src='/show'/>");
	   	res.end();
	})
}

function show(response){
	console.log('request handler show was called');

	fs.readFile('E:/test.jpg','binary',function(error,file){
		if(error){
			response.writeHead(500,{"Content-Type":"text/plain"});
			response.write(error+"\n");
			response.end();
	      }else{
			response.writeHead(200,{"Content-Type":"image/jpeg"});
			response.write(file,"binary");
			response.end();
	      }
	});
}

exports.start = start;
exports.upload = upload;
exports.show = show;