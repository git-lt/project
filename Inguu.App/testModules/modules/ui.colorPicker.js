/**
 * [ ui.dragsort.js v1.0.0 ]
 * @deps：jQuery2.0+
 * @useage(见demo)
 * @email: 935486956@qq.com
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

	var ColorPicker = function(ele,option){
	    this.$el = $(ele);
	    this.o = option;
	    this.$title = this.$el.find('.title');
	    this.$canvas = this.$el.find('.cav_picker');
	    this.$cancel = this.$el.find('.cancel');
	    this.$confirm = this.$el.find('.confirm');

	    this.cRGB = '';
	    this.c16 = '';

	    this.init();
	}
	ColorPicker.DEFAULTS={
	    colorBgSrc:'/images/colorwheel.png',
	    selectors:{
	        title:'.title',
	        canvas:'.cav_picker',
	        btnCancel:'.cancel',
	        btnCancel:'.confirm'
	    },
	    isShown:false,
	    currColor:'#000000',
	    onCancel:function(cVal){},
	    onConfirm:function(cVal){}
	};
	ColorPicker.prototype={
	    constructor:ColorPicker,
	    init:function(){
	        this.$title.css({'color':this.o.currColor, 'border-color':this.o.currColor});

	        var self = this;
	        var ctx = this.$canvas[0].getContext('2d');

	        var img = new Image();
	        img.src = this.o.colorBgSrc;
	        img.onload = function(){
	            ctx.drawImage(img, 0, 0, 200, 200);
	        };

	        this.addEvents(ctx);

	        this.$el.fadeIn();

	        this.o.isShown = true;
	    },
	    hide:function(){
	        this.$el.hide();
	        this.o.isShown = false;
	    },
	    show:function(){
	        this.$el.fadeIn();
	    },
	    _changeColor:function(e,ctx){
	        e.preventDefault();
	        var pX,pY;
	        pX = e.touches[0].pageX;
	        pY = e.touches[0].pageY;

	        //get coordinates 
	        var canvasOffset = this.$canvas.offset();
	        var canvasX = Math.floor(pX - canvasOffset.left);
	        var canvasY = Math.floor(pY - canvasOffset.top);

	        //get pixel
	        var imgData = ctx.getImageData(canvasX, canvasY, 1, 1);
	        var pixel = imgData.data;

	        //get color value
	        var pixeColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
	        var pixeColor16 = '#' + ('0000' + (pixel[2] + 256 * pixel[1] + 65536 * pixel[0]).toString(16)).substr(-6);

	        this.$title.css({'color':pixeColor16, 'border-color':pixeColor16});

	        this.$canvas.data('val',pixeColor16);
	        this.cRGB = pixeColor;
	        this.c16 = pixeColor16;
	        this.o.currColor = pixeColor16;
	    },
	    addEvents:function(ctx){
	        var self = this;

	        this.$canvas[0].addEventListener('touchmove',function(e){
	            self._changeColor.bind(self,e,ctx)();
	        },false);

	        this.$cancel.on('click',function(){
	            self.$el.hide();
	            self.o.onCancel &&　self.o.onCancel(self.o.currColor);
	        });

	        this.$confirm.on('click',function(){
	            self.$el.hide();
	            self.o.onConfirm &&　self.o.onConfirm(self.o.currColor);
	        });
	    }
	};
	$.fn.colorPicker=function(options){
	    this.each(function(){
	        var $this = $(this);
	        var option = $.extend({},ColorPicker.DEFAULTS,typeof options == 'object' && options);
	        var data = $this.data('color-picker');

	        if(!data) $this.data('color-picker',(data = new ColorPicker(this,option)));

	        if (typeof options == 'string'){
	            data[options]();
	        }else if(!option.isShown){
	             data.show();
	        }

	    });
	};
});
