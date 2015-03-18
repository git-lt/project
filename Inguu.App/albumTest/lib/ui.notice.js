/**
 * [ ui.notice.js v1.0.0 ]
 * deps: jquery2.0+, animate.css
 * eg:
 *  $.notice({content:'这是一个通知！01',position:'top', textAlign:'center',color:'red'}); //show
 *  $.notice('hide'); //hide
 *  $.notice('hide',true) //destroy
 * Email:935486956@qq.com
 */
define(function(require, exports, module){
	require('jquery');
	
	var Notice = function(options){
	      this.option = options;
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
	    content:'aaaa',
	    hasClose:true,
	    position:'top', 		//top/bottom/center
	    timeout:4000,
	    color:'blue',
	    clsIn:'fadeInRight',
	    clsOut:'fadeOutRight',
	    textAlign:'left', 		//left/center
	    clsNotice:'[data-ui-notice]',
	    tpl:'<div class="ui-notice" data-ui-notice>'+
	           '<span class="con animated flash">这是一个通知！</span>'+
	           '<a href="javascript:void(0)" class="close">&times;</a>'+
	         '</div>'
	  };
	  
	  Notice.prototype={
	    constructor:Notice,
	    show:function(){
	      if(this.animation) return this;
	      clearTimeout(this.timmer);
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
	      this.animation = true;
	      self.isShown = false;
	      this.$el.one('webkitAnimationEnd',function(){
	      	self.animation = false;
	        self.$el.removeClass('animated '+o.clsOut).hide();
	        $('body').removeClass('no-scroll');

	        if(isDestroy === true){
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
	    refresh:function(option){
	      this.option = option;
	      if(this.isShown){
	        this.$el.find('.con').removeClass('animated flash').animate().delay(200).addClass('animated flash');
	      }else{
	        this.show();
	      }
	      return this;
	    },
	    bindEvents:function(){
	      var self = this;
	      this.$el.find('.close').on('click',function(){ self.hide();});
	    }
	  }

	 $.notice =  function(options){
	    var option = $.extend({}, Notice.DEFAULTS, typeof options == 'object' && options);
	    if(Notice.instance){
			if($.isPlainObject(options)){
				Notice.instance.refresh(option);
			}else{
				var fun = arguments[0], args =  Array.prototype.splice.call(arguments,1);
				typeof fun === 'string' && Notice.instance[fun].apply(Notice.instance,args);
			}
	    }else{
	       Notice.instance = new Notice(option);
	    }
	    return Notice.instance;
	  }

 });