/**
 * [对jQuery的一些扩展]
 * $.supportTransition	检测是否支持transition动画
 * $.supportAnimation	检测是否支持animation动画
 * $('div').redraw		强制重绘
 * $('div').transition({},duration,effectName,delay,callback)  执行transition动画
 */
;(function (root, factory) {
  if (typeof define === 'function' && ( define.amd || define.cmd )) { //requireJs & seaJs
	define(['jquery'], function(require, exports, module){
		return factory($); 
	});
  } else if ( typeof exports === 'object' ) {	// CommonJS
    module.exports = factory(require('jquery'));
  }else {
   	factory(window.$);
  }
})(window, function ($) {

	jQuery.easing['jswing'] = jQuery.easing['swing'];
	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) {
			return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInQuart: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInSine: function (x, t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		}
	});

	jQuery.supportTransition= function(){
		var bodySty = (document.body || document.documentElement).style;
		var names =['transition','webkitTransition','oTransition','MSTransition'] ;
		for(var i in names){
			if(bodySty[names[i]]!== undefined)
				return [
					names[i],
					names[i]+(names[i].indexOf('T')>0?'End':'end')
				];
		}
		return false;
	}

	jQuery.supportAnimation = function(){
		var bodySty = (document.body || document.documentElement).style;
		var names =['animation','webkitAnimation','oAnimation','msAnimation'] ;
		for(var i in names){
			if(bodySty[names[i]]!== undefined)
				return [
					names[i],
					names[i]+(names[i].indexOf('A')>0?'End':'end')
				];
		}
		return false;
	}

	jQuery.fn.redraw = function() {
	  $(this).each(function() {
	    var redraw = this.offsetHeight;
	  });
	  return this;
	};

	/**
	 * [transition JQ动画函数CSS3扩展]
	 * @param  {[Json]} propsJson  	 	[属性json对象]
	 * @param  {[number]} duration   	[持续时间，单位(s)]
	 * @param  {[string]} type       	[动画效果: ease | linear | ease-in | ease-out | ease-in-out]
	 * @param  {[number]} delay      	[延迟，单位(s)]
	 * @param  {[function]} callbackFn 	[完成后的回调]
	 * @return {[$obj]}            		[返回$()对象]
	 */
	jQuery.fn.transition = function(propsJson, duration, type, delay, callbackFn){
		 return this.each(function(){
		 	var $this = jQuery(this), transition=jQuery.supportTransition();
		 	
		 	var effects = {
		 		'ease':'easeOutSine',
		 		'linear':'linear',
		 		'ease-in':'easeInQuart',
		 		'ease-out':'easeOutQuart',
		 		'ease-in-out':'easeInOutQuart',
		 		'swing':'swing'
		 	};
		 	// 优先使用css3动画，否则使用jQuery的animate动画
		 	if(transition && type!='swing'){
		 		var t = ' '+duration + 's '+  (type || 'ease')+ ' '+ (delay||'0') +'s,', 
		 			cssStr='',
		 			called = false;
		 		$this.endTimmer = null;
		 		for(var i in propsJson)
		 			cssStr += i + t;
		 		cssStr = cssStr.substring(0,cssStr.length-1);

		 		propsJson[transition[0]]=cssStr;

		 		// 设置样式
		 		$this.css(propsJson);

		 		// 动画执行完成后，执行回调
		 		$this.one(transition[1], function(){
		 			callbackFn && callbackFn();
		 			called = true;
		 		});

		 		// 确保 transitionend 执行
		 		$this.endTimmer = setTimeout(callback, duration*1000);
		 		function callback() {
		 		  !called && $(this).trigger(transition[1]);
		 		  $this.endTimmer = undefined;
		 		};
		 	}else{
		 		if(!effects[type])
		 			console && console.error('暂不支持 '+ type +' 动画！');
		 		$this.delay(delay*1000).animate(propsJson, duration*1000,effects[type],callbackFn)
		 	}
		 });
	};

});