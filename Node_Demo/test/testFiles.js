var fs = require('fs');


//异步读取文件内容
// fs.readFile('test.txt','utf-8',function(err,data){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(data);
// 	}
// });


//同步文件读取
// var data = fs.readFileSync('test.txt','utf-8');
// console.log(data);


fs.open('test.txt','r',function(err,fd){
	if(err){
		console.error(err);
		return;
	}
	var buf = new Buffer(8);

	fs.read(fd,buf,0,8,null,function(err,bytesRead,buffer){
		if(err){
			console.error(err);
			return;
		}
		console.log('bytesRead:'+bytesRead);
		console.log(buffer);
	});
});

