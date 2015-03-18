// console.log(process.argv);// [ 'node', 'E:\\nodeEvn\\test\\global.js' ]

// E:\nodeEvn\test>node global.js parames1 parames2 parames3
// [ 'node',
//   'E:\\nodeEvn\\test\\global.js',
//   'parames1',
//   'parames2',
//   'parames3' ]

// process.stdout.write('更底层的输出接口');

// //从控制台打印输入的内容：
// process.stdin.resume();
// process.stdin.on('data',function(data){
// 	process.stdout.write('输出的是：'+data.toString());
// });


function compute(){
	setTimeout(function(){
		console.log('复杂耗时的计算2');
	},1000);
}
function doSth(){
	setTimeout(function(){
		console.log('复杂耗时的计算1');
	},3000);
}


function fun1(args, callback){
	doSth(args);
	// callback();
	process.nextTick(callback);
}
fun1('参数',function(){
	compute();
})

//使用process.nextTick();

