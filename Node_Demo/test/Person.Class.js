//模块的定义(类似于C# 中类的定义 Person就是一个类)

function Person(){
	var name;
	this.setName=function(myname){
		name=myname;
	}
	this.sayHello = function(){
		console.log('Hello '+name);
	}
}
module.exports = Person;//等价于 exports.Person=function(){}


// exports.world = function(){
// 	console.log('这是一个新添加的模块');
// }
