/**
 * [ ui.msg.js v1.0.1 ]
 * @deps：jQuery2.0+, animate.css, ui.mask.js
 * @useage:
 * 	$.msg.alert(title, content, width); - 参数：标题，内容，宽度
 * 	$.msg.loading(txt, width); - 参数：提示文本，宽度
 * 	$.msg.confirm(title, content, onCancel, onConfirm, width) - 参数：标题，内容，确认回调，取消回调，宽度
 * 	$.msg.prompt(title, labelTxt, onCancel, onConfirm, defaultVal, width) - 参数：标题，提示文本，确认事件，取消事件，默认值，宽度
 * 	$.msg.popup(title, content); - 参数：标题，内容
 * 	$.msg.actions(content, onOpened, position, clsIn, clsOut); - 参数：内容，显示后的回调，位置，进入动画，关闭动画
 * 	or
 * 	$.msg.alert({title:'...',content:'...', width:200});
 * @example: 
 * 	$.msg.alert('这里是标题','这里是内容');
 *  $.msg.loading('加载中...', 200);
 *  $.msg.confirm('警告','是否确认删除！？');
 *  $.msg.prompt('名称');
 *  $.msg.popup('popup标题','这里是内容区域');
 *  $.msg.actions('这里是actions的内容区域');
 *  
 * @email: 935486956@qq.com
 *
 * ## bug修改：
 * #### 2015年1月10日 17:09:59
 * ======================
 * - 1.修正了toggle 的逻辑,并添加了刷新配置数据
 * - 2.修正了loading因没有添加动画执行时间而导致手机端无法关闭的bug
 * - 3.参数中调换了取消和确认回调函数的配置顺序，添加了取消回调的默认配置
 * [小结：调用更加方便]
 */

;(function (root, factory) {
  if (typeof define === 'function' && ( define.amd || define.cmd )) { //requireJs & seaJs
	define(['lib/jquery','modules/ui.mask'],function(require, exports, module){ 
		return factory($); 
	});
  } else if ( typeof exports === 'object' ) {	// CommonJS
    module.exports = factory(require('lib/jquery'),require('modules/ui.mask'));
  }else {
   	factory(window.$, window.$.mask);
  }
})(this, function ($) {
	"use strict";

	var Msg = function($el, options){
		this.o = $.extend({}, Msg.DEFAULTS, options || {});
		this.$el = $el;
		this.$header = this.$el.find('.ui-msg-hd');
		this.$footer = this.$el.find('.ui-msg-ft');
		this.$body = this.$el.find('.ui-msg-bd');
		this.$close = this.$header.find('.close');
		this.isShow = false;
		this.open();
		this.bindEvents();
	}

	Msg.DEFAULTS={
		title:'',  			//标题
		content:'',			//内容
		isModal:true,		//是否模态显示
		hasCloseBtn:true,	//是否有关闭按钮
		width:270,			//宽度
		cacheIns:false,		//是否缓存实例
		position:'center',	//定位：center/top/left/right/bottom
		closeByMask:false,	//是否可以点击遮罩层关闭
		maskOpacity:0.4,	//遮罩的透明度
		maskColor:'black',	//遮罩的颜色
		onOpened:$.noop, 	//弹出层显示后的回调
		onClosed:$.noop,	//弹出层关闭后的回调
		clsIn:'zoomIn',		//进入的动画名称
		clsOut:'zoomOut',	//关闭的动画名称
		
		buttons:[] 			//对话框中的按钮：{text:'确定',id:'alertConfirm',handler:funciton(oThis,val){}}
	};

	Msg.prototype={
		open:function(options,callback){
			if(options) this.o = $.extend({}, this.o, options); //更新配置项
			
			var self = this, o = this.o;
			this.addButtons();
			this.setPosition();
			o.isModal && $.mask(o.maskOpacity,o.maskColor);
			this.$el.show().addClass(o.clsIn);
			typeof callback === 'function' && (o.onOpened = callback);
			o.onOpened(self);
			this.isShow = true;
			return this;
		},
		close:function(isDestroy,callback){
			var self = this, o = this.o;
			this.$el.removeClass(o.clsIn).addClass(o.clsOut).one('animationend webkitAnimationEnd', function(){
				o.isModal && $.mask();
				self.$el.removeClass(o.clsOut).hide();
				(isDestroy === true || o.cacheIns===false) && self.$el.remove();
				typeof callback === 'function' && (o.onClosed = callback);
				o.onClosed(self);
				self.isShow = false;
			});
			return this;
		},
		toggle:function(options){
			if(this.isShow)
				this.close.call(this);
			else
				this.open.call(this,options);
			return this;
		},
		bindEvents:function(){
			var self = this, o = this.o, val=undefined;
			o.hasCloseBtn && this.$close.on('click', function(){ self.close(); });
			o.closeByMask && $.mask.$el.on('click', function(){ 
				self.close(); 
			});
			//buttons events
			for(var i in o.buttons){
				(function(i){
					$('#'+o.buttons[i].id).on('click',function(handler){
						if(o.hasInput) val = self.$el.find('input').val();
						o.buttons[i].handler(self, val);
					});
				})(i);
			}
		},
		addButtons:function(){
			var self = this, o = this.o;
			var len = o.buttons.length, btnHtml='';
			if(len){
				for(var i=0; i<len; i+=1){
					btnHtml += '<span class="msg-btn" id='+o.buttons[i].id+'>'+o.buttons[i].text+'</span>'
				}
				this.$footer.html(btnHtml);
			}else{
				this.$footer.remove()
			}
		},
		setPosition:function(){
			var self = this, o = this.o;
			var w = o.width, h = this.$el.height();

			if(!o.isPop){
				switch(o.position){
					case 'center':
						this.$el.attr('style','width:'+w+'px; left:50%; top:50%; margin-left:-'+w/2+'px; margin-top:-'+h/2+'px;');
						break;
					case 'top':
						this.$el.attr('style','width:'+w+'; left:0; top:0;');
						break;
					case 'left':
						this.$el.attr('style','width:'+w+'; left:0; top:0;');
						break;
					case 'right':
						this.$el.attr('style','width:'+w+'; top:0; right:0;');
						break;
					case 'bottom':
						this.$el.attr('style','width:'+w+'; left:0; bottom:0;');
						break;
				}
			}

			//[SETUP:title & content & close]
			if(o.title==='') {
				this.$header.remove();
			}else{
				this.$header.find('.title').html(o.title);
			}
			
			o.content && this.$body.html('').append(o.content);

			// this.$body.find(':text').focus();

			!o.hasCloseBtn && this.$close.remove();
		}
	};

	var msg = (function(){
		var alertIns, confIns, promIns, popIns, loadIns, actIns;
		var tpls = {
			common:'<div class="ui-msg" tabindex="-1"><div class="inner">'+
						'<div class="ui-msg-hd">'+
							'<h4 class="title"></h4><i class="close">&times;</i>'+
						'</div>'+
						'<div class="ui-msg-bd"></div><div class="ui-msg-ft"></div>'+
					'</div></div>',
			loading:'<div class="ui-msg-loading" data-ui-msg-loading><div class="inner">\
						<div class="ui-loading" id="loadingBox">\
							<div class="loading-bar-cir bar1"></div>\
							<div class="loading-bar-cir bar2"></div>\
							<div class="loading-bar-cir bar3"></div>\
							<div class="loading-bar-cir bar4"></div>\
							<div class="loading-bar-cir bar5"></div>\
							<div class="loading-bar-cir bar6"></div>\
							<div class="loading-bar-cir bar7"></div>\
							<div class="loading-bar-cir bar8"></div>\
						</div>\
						<span class="ui-msg-bd"></span>\
					</div></div>'
		};

		var createInstance = function(type, options){
			var $el;
			$(tpls.common).addClass('msg-'+type).appendTo('body').attr('data-ui-msg-'+type,'');
			$el = $('[data-ui-msg-'+type+']');
			return (new Msg($el, options));
		}
		return {
			alert:function(title, content, width){ /*参数：标题，内容，宽度*/
				var options = {
					title: title || '',
					content: content ||'',
					width: width || 270,
					cacheIns:true
				};
				if($.isPlainObject(title)) options = arguments;

				if(!alertIns){
					alertIns = createInstance('alert',options);
				}else{
					alertIns.toggle.call(alertIns,options);
				}
				return alertIns;
			},
			loading:function(content, width, color){ /*参数：提示文本，宽度*/
				var options = {
					content: content || '',
					width: width || 200,
					loadingColor: color ||'black',
					cacheIns: true,
					maskOpacity: 0.4,
					maskColor:'white'
				}
				if($.isPlainObject(content)) options = arguments;

				if(!loadIns){
					$('body').append(tpls.loading);
					var $el = $('[data-ui-msg-loading]');
					loadIns = new Msg($el, options);
				}else{
					loadIns.toggle.call(loadIns,options);
				}
				return loadIns;
			},
			confirm:function(title, content, onConfirm, onCancel, width){ /*参数：标题，内容，确认回调，取消回调，宽度*/
				var options = {
					title: title || '',
					content: content ||'',
					width: width || 270,
					cacheIns:false,
					hasCloseBtn:true,
					closeByMask:true,
					buttons: [
						{ text:'取消', id:'confBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
						{ text:'确定', id:'confBtnConfirm', handler:onConfirm }
					]
				};

				if($.isPlainObject(title)) options = arguments;

				confIns = createInstance('confirm',options);

				return confIns;
			},
			prompt:function(title, labelTxt, onConfirm, onCancel, defaultVal, width){ /*参数：标题，提示文本，确认事件，取消事件，默认值，宽度*/
				var options = {
					title: title || '',
					content: '<label class="msg-prompt-lbl">'+(labelTxt||'请输入：')+'</label>'+
							 '<input type="text" tabindex=1 class="msg-prompt-ipt" value="'+(defaultVal||'')+'"/>',
					width: width || 270,
					cacheIns:false,
					hasCloseBtn:true,
					closeByMask:true,
					hasInput:true,
					buttons: [
						{ text:'取消', id:'propBtnCancel', handler:onCancel || function(oThis, val){ oThis.close(); } },
						{ text:'确定', id:'propBtnConfirm', handler:onConfirm }
					]
				};

				if($.isPlainObject(title)) options = arguments;

				promIns = createInstance('prompt',options);

				return promIns;
			},
			popup:function(title, content){ /*参数：标题，内容*/
				var options = {
					title: title || '',
					content: content || '',
					cacheIns:false,
					hasCloseBtn:true,
					clsIn:'fadeInUp',
					clsOut:'fadeOutDown',
					isPop:true
				};

				if($.isPlainObject(title)) options = arguments;

				popIns = createInstance('popup',options);

				return popIns;
			},
			actions:function(content, onOpened, position, clsIn, clsOut){ /*参数：内容，显示后的回调，位置，进入动画，关闭动画*/
				var options = {
					content: content ||'',
					width: '100%', // 100%/auto
					position: position || 'top',
					hasCloseBtn: false,
					cacheIns: false,
					closeByMask: true,
					onOpened: onOpened || $.noop, //这里可以对actions box中元素进行的事件注册 参数：oThis 当前实例
					clsIn: clsIn || 'fadeInDown',
					clsOut: clsOut || 'fadeOutUp'
				};
				if($.isPlainObject(content)) options = arguments;

				actIns = createInstance('actions',options);

				return actIns;
			},
		};
	})();

	$.msg = msg;
	return msg;
});