// var EventEmitter = require('events').EventEmitter;

// var ev = new EventEmitter();

// ev.on('myEv',function(){
// 	console.log('自定义的事件！');
// });

// setTimeout(function(){
// 	ev.emit('myEv');
// },2000);

var events = require('events');
var emitter = new events.EventEmitter();

emitter.on('firstEvent',function(arg1,arg2){
	console.log('第1个事件,传过来的参数是：'+arg1+','+arg2);
});
emitter.on('firstEvent',function(arg1,arg2){
	console.log('第2个事件,传过来的参数是：'+arg1+','+arg2);
});

var i=1;
emitter.once('eventOnce',function(){
	console.log('我是第次'+i+'被调用');
	i++;
});

emitter.emit('firstEvent','jack',15);

emitter.emit('eventOnce');
emitter.emit('eventOnce');
emitter.emit('eventOnce');


