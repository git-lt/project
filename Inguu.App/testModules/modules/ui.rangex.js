/**
 * deps: jQuery touch range.css
 * 
 */

// define(function(require, exports, module){
// 	require('jquery');
	// var touch=require('touch.min');

	var RangeX = function(ele, option){
		this.$ele = $(ele);
		this.o = option;
		this.$box = this.$ele;
		this.$handle =this.$box.find(option.selectors.handle);
		this.$quantity = this.$box.find(option.selectors.quantity);

		this.boxW = this.$box.width();
		this.handleW = this.$handle.width();

		this.leftMin = -this.handleW/2;
		this.leftMax = this.boxW-this.handleW/2;

		this.currLeft = 0;
		this.quantityLen =0;
		this.stepLen =0;

		this.init(option);
	};

	RangeX.DEFAULTS={
		maxVal:100,
		minVal:0,
		currVal:0,
		step:1,
		onChange:function(val){},
		selectors:{
			handle:'.range-handle',
			quantity:'.range-quantity'
		},
		tpl:'<div class="slider-wrapper" id="size-range"> <span class="range-bar"> <span class="range-handle"></span> <span class="range-quantity"></span> </span> </div>'
	};

	RangeX.prototype={
		constructor:RangeX,
		init:function(option){//初始化：步进值，起始位置，进度条长度
			this.stepLen = parseInt(this.o.step*this.boxW/(this.o.maxVal-this.o.minVal), 10); 
			
			var startLeft = parseInt((this.o.currVal-this.o.minVal)*this.boxW/(this.o.maxVal-this.o.minVal), 10);
			this.quantityLen = startLeft;
			this.currLeft= startLeft === 0 ? - this.handleW/2 : startLeft;

			this.$handle.css('left', this.currLeft);
			this.$quantity.css('width', this.quantityLen + this.handleW/2);

			this.bindEvents(option);
		},
		bindEvents:function(option){
			var self = this; o = option;
			touch.on(self.$box[0], 'touchstart', function(ev){
				ev.preventDefault();
			});
			touch.on(self.$box[0], 'drag', o.selectors.handle, function(ev){
				var movX  = 0;
				if(Math.abs(ev.x) > self.stepLen) 
					movX= Math.abs(parseInt(ev.x/self.stepLen, 10))*self.stepLen;

				if(ev.direction === 'right' && self.quantityLen < self.leftMax){
					var x =0;
					if((self.currLeft + movX) > o.leftMax){
						x = o.maxVal;
						self.currLeft = self.boxW- self.handleW/2;
					}else{
						x=self.currLeft + movX;
					}
					this.style.left = x + "px";

					self.$quantity.css('width',x +self.handleW/2);
					self.quantityLen = x;
				}else if(ev.direction==='left' && self.leftMin < self.quantityLen){
					var x = 0;
					if((self.currLeft - movX) < o.leftMin){
						self.currLeft = x = -self.handleW/2;
					}else{
						x = self.currLeft - movX;
					}
					this.style.left = x + "px";

					self.$quantity.css('width', x + self.handleW/2);
					self.quantityLen = x;
				}else{
					return false;
				}

				var p = parseInt(( self.quantityLen+self.handleW/2)/self.boxW*100, 10);
				// console.log(p+'%'+', '+ (o.minVal + parseInt(p/100*(o.maxVal-o.minVal), 10)));
				o.onChange(o.minVal + parseInt(p/100*(o.maxVal-o.minVal), 10));
			});
			touch.on(self.$box[0], 'dragend', o.selectors.handle, function(ev){
				self.currLeft = self.$box.find(o.selectors.quantity).width() - self.handleW/2;
				//如果超过了最大和最小，则还原
				if(self.currLeft>self.boxW) {
					self.currLeft = self.boxW;
					self.$handle.css('left', self.boxW - self.handleW/2);
					self.$quantity.css('width', self.boxW );
				};
				if(self.currLeft<0){
					self.currLeft = 0;
					self.$handle.css('left',-self.handleW/2);
					self.$quantity.css('width', 0);
				}
				console.log(self.currLeft);
			});
		},
		setVal:function(value){
			var self = this, o = this.o;

			if(!(o.minVal<= value <=o.maxVal)) return;

			var startLeft = parseInt((value - o.minVal)*this.boxW/( o.maxVal- o.minVal), 10);
			this.quantityLen = startLeft;
			this.currLeft= startLeft === 0 ? - this.handleW/2 : startLeft;

			this.$handle.css('left', this.currLeft);
			this.$quantity.css('width', this.quantityLen + this.handleW/2);
		},
		getVal:function(){
			var o = this.o,self = this;
			var p = parseInt(( self.quantityLen+self.handleW/2)/self.boxW*100, 10);
			return o.minVal + parseInt(p/100*(o.maxVal-o.minVal), 10);
		}
	}

	$.fn.rangeX = function(options){
		var $this = $(this);
        var option = $.extend({},RangeX.DEFAULTS,typeof options == 'object' && options);
        var data = $this.data('rangeX');
        if(!data) $this.data('rangeX',(data = new RangeX(this,option)));

        if (typeof options == 'string'){
        	var args = [].slice.call(arguments,1)[0];
            data[options](args);
        }
	}

// });