define(function(require, exports, module){
	require('jquery');
	
	var Mask = function(){
		this.inited = false;
		this.isShow = false;
		this.$el = $(Mask.DEFAUTS.tpl);

		this.init();
	};

	Mask.DEFAUTS={
		selector:'[data-ui-mask]',
		tpl:'<div class="ui mask hide" data-ui-mask></div>'
	}

	Mask.prototype={
		constructor:Mask,
		init:function(){
			if(!this.inited && !this.isShow){
				$('body').append(this.$el);
				this.inited = true;
			}
		},
		show:function(opacity){
			var self = this;
			if(!this.isShow){
				if(opacity) self.$el.css('background-color','rgba(0,0,0,'+opacity+')');
				setTimeout(function(){self.$el.show();},0);
				this.$el.addClass('animated fadeIn');
				this.isShow = true;
			}
		},
		hide:function(isDestroy){
			if(this.isShow){
				this.$el.removeClass('fadeIn').addClass('fadeOut');
				this.isShow = false;
				this.$el.one('webkitAnimationEnd',function(){
					$(this).removeClass('animated fadeOut').hide();
					isDestroy===true && $(this).off().remove();
				});
			}
		}
	};

	var mask = new Mask();

	$.mask = mask;
});