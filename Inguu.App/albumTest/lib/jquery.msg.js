define(function(require, exports, module){
	require('jquery');
	require('jquery.mask');

	$.msg ={};

	var MsgTip = function(ele, txt, timeout, color){
		this.$ele = $(ele);
		this.txt = txt || '';
		this.timeout = timeout || 3000;
		this.colorName = color || 'blue';
		this.timmer = null;
		this.isShow = false;

		this.addEvents();
		this.show();
	};

	MsgTip.prototype={
		constructor:MsgTip,
		show:function(){
			var self = this;
			this.$ele.show().find('.con').text(this.txt);

			this.$ele.addClass('animated fadeInRight '+ this.colorName).one('webkitAnimationEnd',function(){
				$(this).removeClass('animated fadeInRight');
			});
			self.isShown = true;
			this.timmer = setTimeout(function(){
				self.hide();
			}, self.timeout);
		},
		hide:function(){
			var that = this;
			clearTimeout(this.timmer);
			that.$ele.addClass('animated fadeOutRight').one('webkitAnimationEnd', function(){
				$(this).hide().removeClass('animated fadeOutRight');
			});
			this.isShown = false;
		},
		addEvents:function(){
			var self = this;
			self.$ele.find('.close').on('click',function(){
				self.hide();
			});
		},
		refresh:function(txt, timeout, color){
			var self = this;
			if(this.isShown){
				this.$ele.find('.con').removeClass('animated flash').animate().delay(300).addClass('animated flash');
			}else{
				this.txt = txt || '';
				this.timeout = timeout || 3000;
				this.colorName = color || 'blue';
				clearTimeout(this.timmer);
				this.show();
			}
		}
	};

	var Plugin = function(txt, timeout, color){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('msg-tip');

			if(!data){
				$this.data('msg-tip',(data = new MsgTip(this, txt, timeout, color)));
			}else{
				data.refresh(txt, timeout, color);
			}
		});
	};

	$.fn.msgTip = Plugin;


	var promptInstance;
	var MsgPrompt = function(options){
		this.o = $.extend({},MsgPrompt.DEFAUTS,typeof options == 'object' && options);
		this.inited = false;
		this.isShown = false;

		this.init();
	};
	MsgPrompt.DEFAUTS={
		title:'',
		content:'',
		isModal:true,
		defaultVal:'',
		onCancel:function($ipt){},
		onConfirm:function($ipt){},
		closeable:false,
		selectors:{
			promptBox:'#promptBox',
			header:'.prompt-hd',
			body:'.prompt-bd',
			footer:'.prompt-ft',
			input:'.prompt-ipt',
			btnCancel:'.btn-cancel',
			btnConfirm:'.btn-confirm',
			btnClose:'.close'
		},
		tpl:'<section class="ui msg prompt" style="display:none;" id="promptBox">'+
            	'<div class="inner"><div class="prompt-hd"><h4 class="title">修改旺旺名称</h4><i class="iconfont close">&times;</i></div>'+
                '<div class="prompt-bd">'+
                    '<div>'+
                        '<label class="prompt-lab">旺旺名：</label>'+
                        '<input type="text" name="taobao" class="prompt-ipt" id="txt_editTB"/>'+
                    '</div>'+
                '</div>'+
                '<div class="prompt-ft">'+
                    '<span class="col-6 prompt-btn btn-cancel">返回</span><span class="col-6 prompt-btn btn-confirm">确认</span>'+
                '</div></div>'+
            '</section>'
	};
	MsgPrompt.prototype={
		constructor:MsgPrompt,
		init:function(){
			if(!this.inited && !$(this.o.selectors.promptBox).length){
				$('body').append(this.o.tpl);
				this.inited = true;
			}
			this.$box = $(this.o.selectors.promptBox);
			this.$header = this.$box.find(this.o.selectors.header);
			this.$body = this.$box.find(this.o.selectors.body);
			this.$footer = this.$box.find(this.o.selectors.footer);
			this.$btnCancel = this.$footer.find(this.o.selectors.btnCancel);
			this.$btnConfirm = this.$footer.find(this.o.selectors.btnConfirm);
			this.$input = this.$body.find(this.o.selectors.input);
			this.$btnClose = this.$header.find(this.o.selectors.btnClose);

			if(this.o.defaultVal) this.$input.val(this.o.defaultVal);

			this.addEvents();
		},
		show:function(){
			var self = this;
			if(!this.isShown){
				this.o.isModal && $.mask.show(0.4);
				setTimeout(function(){self.$box.show()},0);
				this.$box.addClass('animated zoomIn');
				this.isShown = true;
			}
		},
		hide:function(){
			var self = this;
			if(this.isShown){
				this.o.isModal && $.mask.hide();
				this.$box.removeClass('zoomIn').addClass('zoomOut');
				this.$box.one('webkitAnimationEnd',function(){
					$(this).removeClass('animated zoomOut').off().remove();
					promptInstance = undefined;
				});
			}
		},
		addEvents:function(){
			var self = this;
			self.$btnCancel.on('click',function(){
				self.o.onCancel(self.$input, self);
				self.hide();
			});

			self.$btnConfirm.on('click',function(){
				self.o.onConfirm(self.$input, self);
			});

			self.$btnClose.on('click',function(){
				self.hide();
			});
		}
	}

	$.msg.prompt =function(options){
		if(!promptInstance){
			promptInstance = new MsgPrompt(options);
		}
		return promptInstance;
	};

});
