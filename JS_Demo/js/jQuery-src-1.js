// 版本：jQuery JavaScript Library v2.0.3
// jQuery源码分析一：
// 闭包：匿名函数自执行()();
// 对外接口：window.jQuery = window.$ = jQuery
// 
// 
(function(window,undefined){
	// 21 - 94	定义变量和函数
	var jQuery = function(){ return new jQuery.fn.init();};

	// 96 - 283	JQ实例方法：扩展的 方法 和 属性
	jQuery.fn = jQuery.prototype = {};
	jQuery.fn.init.prototype = jQuery.fn=jQuery.prototype;

	// 285 - 347 JQ的extend方法定义
	jQuery.extend=jQuery.fn.extend=function(){};

	// 349 - 817 jQ的静态方法：扩展的工具方法
	jQuery.extend({});

	// 877 - 2856 Sizzle: 复杂选择器的实现
	(function(window,undefined){function Sizzle(){};})();


	// 2880 - 3042 Callbacks: 回调对象（函数的统一管理）
	jQuery.Callbacks = function() {};

	// 3043 - 3183 Deferred: 延迟对象 （对异步的统一管理）
	jQuery.extend({Defferred:function(){}});

	// 3184 - 3295 support: 浏览功能检测 （浏览器兼容性检测）
	jQuery.support = (function( ){})();

	// 3308 - 3652 Data: 数据缓存
	function Data(){};

	// 3653 - 3797 queue: 队列管理
	jQuery.extend({queue:function(){},dequeue:function(){}});

	// 3803 -  4299 attr() prop() val() 等：对元素属性操作

	// 4300 - 5128 trigger(): 事件操作的相关方法
	
	// 5140 - 6057 DOM相关操作： 添加 删除 获取 包装 筛选
	
	// 6058 - 6620 CSS相关操作

	// 6621 - 7854 ajax相关操作：ajax() load() getJson()
	
	// 7855 - 8584 animate: 动画相关操作
	
	// 8585 - 8792 offset： 位置和尺寸的相关操作

	// 8804 - 8821 对模块化的支持操作

	// 8826		对外提供调用接口
	window.jQuery = window.$ = jQuery;
})(window);

// $.exend();
// 	扩展工具方法
// 	合并对象
	