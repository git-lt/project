/**
 * [ ui.notice.js v1.0.1 ]
 * deps: jquery2.0+, animate.css
 * @usage:  
 *  $.notice({content:'这是一个通知！01',position:'top', textAlign:'center',color:'red'}); //show
 *  $.notice('hide'); //hide
 *  $.notice('hide',true) //destroy
 * @email: 935486956@qq.com
 *
 * 优化修改：
 * 2015年1月10日 17:13:27
 * ======================
 * 调用方式优化：
 * 调用方式：$.notice(content,color); or $.notice({content:'',color:'',position:'',textAlign:''});
 * 关闭：$.notice(); 内部调用toggle()切换
 */

;(function (root, factory) {
  if (typeof define === 'function' && ( define.amd || define.cmd )) { //requireJs & seaJs
	define(['jquery'],function(require, exports, module){ 
		return factory($) 
	});
  } else if ( typeof exports === 'object' ) {	// CommonJS
    module.exports = factory(require('jquery'));
  }else {
   	factory(window.jQuery);
  }
})(this, function ($) {

	var Notice = function(options){
	      this.option =  $.extend({}, Notice.DEFAULTS, typeof options == 'object' && options);;
	      this.isShown = false;
	      this.timmer = undefined;
	      this.animation = false;
	      this.$el = $(Notice.DEFAULTS.clsNotice);
	      this.$el.length == 0 && $('body').append(this.option.tpl);
	      this.$el = $(Notice.DEFAULTS.clsNotice);
	      this.bindEvents();
	      this.show();
	  };

	  Notice.instance = undefined;
	  Notice.DEFAULTS={
	    content:'', 			//通知内容
	    hasClose:true,			//是否有关闭按钮
	    position:'top', 		//定位：top/bottom/center
	    timeout:3500,			//延时关闭时间
	    color:'blue',			//背景颜色
	    clsIn:'fadeInRight',	//进入动画
	    clsOut:'fadeOutRight',	//退出动画
	    textAlign:'left', 		//文本对齐：left/center
	    clsNotice:'[data-ui-notice]',	//选择器
	    cacheInstance:true,				//是否缓存实例
	    tpl:'<div class="ui-notice" data-ui-notice>'+
	           '<span class="con animated flash">这是一个通知！</span>'+
	           '<a href="javascript:void(0)" class="close">&times;</a>'+
	         '</div>'
	  };
	  
	  Notice.prototype={
	    constructor:Notice,
	    show:function(options){
	      if(this.isShown) return this;
	      clearTimeout(this.timmer);
	      options && (this.option = $.extend({}, this.option, options))//更新配置项;
	      var self = this, o =this.option;

	      this.preShow();
	      this.$el.addClass('animated '+ o.clsIn);
	      this.isShown = true;
	      this.timmer = setTimeout($.proxy(self.hide, self),o.timeout);

	      return this;
	    },
	    hide:function(isDestroy){
	     if(!this.isShown) return this;

		  clearTimeout(this.timmer);
	      var self = this, o =this.option;
	      this.$el.removeClass(o.clsIn).addClass(o.clsOut);
	      this.$el.one('webkitAnimationEnd',function(){
	      	self.isShown = false;
	        self.$el.removeClass('animated '+o.clsOut).hide();
	        $('body').removeClass('no-scroll');

	        if(isDestroy === true || !o.cacheInstance){
	        	self.$el.remove();
	        	Notice.instance = undefined;
	        }
	      });

	      return this;
	    },
	    preShow:function(){
	      var o = this.option, $el = this.$el;
	      switch(o.position){
	        case 'top':
	        	$el.attr('style','display:block; top:0; left:0; right:0; margin-top:0; bottom:auto;');
	          	break;
	        case 'bottom':
	        	$el.attr('style','display:block; top:auto; left:0; right:0; margin-top:0; bottom:0;');
	          	break;
	        case 'center':
	        	$el.attr('style','display:block; top:50%; left:10%; right:10%; margin-top:-'+$el.height()/2+'px; bottom:auto;');
	          break;
	      }
	      
	      $el.attr('class','ui-notice').addClass(o.color).find('.con').css('text-align',o.textAlign).text(o.content);
	      $('body').addClass('no-scroll');

	      !o.hasClose && $el.find('.close').hide().end().find('.con').css('padding-right','10px');
	    },
	    toggle:function(options){
	      var self = this;

	      if(self.isShown){
	        self.hide.call(self);
	      }else{
	        self.show.call(self, options);
	      }
	      return self;
	    },
	    bindEvents:function(){
	      var self = this;
	      this.$el.find('.close').on('click',function(){ self.hide();});
	    }
	  }

		var notice =  function(content,color){
			var options = {
				content: content || '',
				color: color || 'blue'
			};
			if($.isPlainObject(content)) options = content;

		if(Notice.instance){
			Notice.instance.toggle.call(Notice.instance, options);
		}else{
			Notice.instance = new Notice(options);
		}
		return Notice.instance;
		}

	$.notice = notice;
 });

// var options = {
// 	content: content || '',
// 	width: width || 200,
// 	cacheIns:true,
// 	maskOpacity:0.4,
// 	maskColor:'white'
// }
// if(isJson(arguments)) options = arguments;

// if(!loadIns){
// 	$('body').append(tpls.loading);
// 	var $el = $('[data-ui-msg-loading]');
// 	loadIns = new Msg($el, options);
// }else{
// 	loadIns.toggle.call(loadIns,options);
// }
// return loadIns;