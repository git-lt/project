/**
 * [ ui.mask.js v1.0.0 ]
 * @deps：jQuery2.0+, animate.css
 * @useage:
 * 	$.mask.show(0.5, 'white'); - 参数：透明度，颜色
 * 	$.mask.show(); 
 * 	$.mask.hide();
 * 	$.mask.hide(true); - 参数：是否销毁
 * 	$.mask.$el; // current mask $Dom
 * @email: 935486956@qq.com
 * PS：单例模式，第一次调用show时初始化
 * 	
 */

;(function (root, factory) {
  if (typeof define === 'function' && ( define.amd || define.cmd )) { //requireJs & seaJs
	define(['lib/jquery'], function(require, exports, module){
		return factory($); 
	});
  } else if ( typeof exports === 'object' ) {	// CommonJS
    module.exports = factory(require('lib/jquery'));
  }else {
   	factory(window.$);
  }
})(window, function ($) {

	"use strict";
	
	$.fn.emulateTransitionEnd = function(duration) {
	  var called = false;
	  var $el = this;

	  $(this).one('webkitTransitionEnd', function() {
	    called = true;
	  });

	  var callback = function() {
	    if (!called) {
	      $($el).trigger('webkitTransitionEnd');
	    }
	    $el.transitionEndTimmer = undefined;
	  };
	  this.transitionEndTimmer = setTimeout(callback, duration);
	  return this;
	};

	var Mask = function(option){
		this.inited = false;
		this.isShow = false;
		this.$el = null;
		this.o = option;
		this.init();
	};

	Mask.DEFAUTS={
		selector:'[data-ui-mask]',
		opacity:0.4,
		color:'black',
		parentId:'body',
		tpl:'<div class="ui-mask" data-ui-mask></div>'
	}

	Mask.prototype={
		constructor:Mask,
		init:function(){
			if(!this.inited && !this.isShow){
				$('body').append(this.o.tpl);
				this.$el = $(Mask.DEFAUTS.selector);
				this.inited = true;
			}
		},
		show:function(option){
			if(option) this.o = option;
			if(!this.isShow){
				this._initStyle();
				this.$el.addClass('active')
				this.isShow = true;
			}
		},
		hide:function(){
			if(this.isShow){
				this.$el.removeClass('active').one('webkitTransitionEnd',function(){ 
					$(this).hide(); 
					$('body').removeClass('no-scroll'); 
				});
				this.$el.emulateTransitionEnd(150);
				this.isShow = false;
			}
		},
		_initStyle:function(){
			//set dimmer style
			var rgba = this.o.color === 'white' ? 'rgba(255,255,255,'+this.o.opacity+')' : 'rgba(0,0,0,'+this.o.opacity+')';
			if(this.o.parentId != 'body'){
				var oParent = document.getElementById(this.o.parentId),
					posi = oParent.getBoundingClientRect(),
					oParentW = posi.right - posi.left, 
					oParentH = posi.bottom - posi.top;
				this.$el.css({
					'width':oParentW,
					'height':oParentH,
					'left':posi.left,
					'top':posi.top,
					'backgroundColor':rgba,
					'display':'block'
				});
			}else{
				$('body').addClass('no-scroll');
				this.$el.css({'width':'100%','height':'100%','left':0,'top':0,'backgroundColor':rgba,'display':'block'});
			}
		}
	};

	Mask.INSTANCE = null;

	$.mask ={
		$el:null,
		instance:null,
		show:function(opacity,color,parentId){
			var options = {
				opacity:opacity || 0.4,
				color:color|| 'black',
				parentId: parentId || 'body'
			};

			var option = $.extend({}, Mask.DEFAUTS,options);
			if($.isPlainObject(opacity)) option = opacity;

			!Mask.INSTANCE && (Mask.INSTANCE = new Mask(option));
			
			this.$el = Mask.INSTANCE.$el;
			this.instance = Mask.INSTANCE;

			Mask.INSTANCE.show.call(Mask.INSTANCE,option);
			return Mask.INSTANCE;
		},
		hide:function(){
			Mask.INSTANCE.hide.call(Mask.INSTANCE);
			return Mask.INSTANCE;
		}
	};

	return $.mask;
});





