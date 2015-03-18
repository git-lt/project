// util.inherits(constructor, superConstructor)是一个实现对象间原型继承 的函数。

var util =require('util');

//继承
var Person = function(){
	this.name='人类';
	this.sayHello=function(){
		console.log(this.name);
	}
}

Person.prototype.showName=function(){
	console.log('Hello ,我的名字是'+this.name);
}

function Chinese(){
	this.name='中国人';
}

util.inherits(Chinese,Person);//只能继承父类原型中的方法

var p1 = new Person();
p1.sayHello();
p1.showName();

var c1 = new Chinese();
c1.showName();