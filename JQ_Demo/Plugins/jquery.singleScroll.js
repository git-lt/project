/**
 * jquery.singleScroll.js v1.0.0
 * Copyright 2014 LT, Inc.
 * 单张播放插件
 * DOM 结构：div>ul>li*n
 * div:大小固定,overflow:hidden
 * 横向或纵向的样式要先写好
 * 可选配置说明：
 *  auto:true,		//自动播放，默认为 true 自动
	position:'X',	//X: 水平	  Y: 垂直
	direction:1,	//1: 正向运动 -1: 反向运动
	speed:2,		//播放的速度 1-3(秒)
	prevSelector:'.prev',	//上一张按钮的选择器
	nextSelector:'.next'	//下一张探钮的选择器
	
	初始化方式：
	JS初始化：div#wrap1>ul>li*4
	$('#wrap1').singleScroll({
		auto:true,		//自动播放，默认为 true 自动
		position:'Y',	//X: 水平	  Y: 垂直
		direction:1,	//1: 正向运动 -1: 反向运动
		speed:1,		//播放的速度 1-3(秒)
		prevSelector:'#prev4',	//上一张按钮的选择器
		nextSelector:'#next4'	//下一张探钮的选择器
	});
 */
   ;(function($,window,document,undefined){'use strct';

	//SingleScroll CLASS DIFINITION
	//=============================
	var SingleScroll=function(element,options){
		this.$element=$(element);
		this.options=options;
		this.$element.timer=null;
		this.init();
	};
	SingleScroll.prototype={
		constructor:SingleScroll,
		init:function(){
			var $divBox = this.$element,
				$ulBox = $divBox.find('ul'),
				$liItems = $ulBox.find('li'),
				$itemWidth = $liItems.outerWidth(true),
				$itemHeight = $liItems.outerHeight(true),
				othis=this;
			
			var $ulBox=$ulBox,
				distance=0,		//移动的距离
				moveDirec=null;	//移动的方向 上：-9 、下：9、左：-8、右：8
			
			if(this.options.position.toUpperCase()=='X'){
					distance=$itemWidth;
					moveDirec=this.options.direction===1?8:-8;
			}else{
					distance=$itemHeight;
					moveDirec=this.options.direction===1?9:-9;
			}
			
			//自动播放
			if(this.options.auto){
				othis.play($ulBox,distance,moveDirec)
			}
			
			//注册上一张和下一张的按钮点击事件

			if(this.options.prevSelector){
				var $prevDom=$(this.options.prevSelector);
				$prevDom.off('click').on('click',function(){
					moveDirec=-Math.abs(moveDirec);
					othis.play($ulBox,distance,moveDirec);
				});
			}
			if(this.options.nextSelector){
				var $nextDom=$(this.options.nextSelector);
				$nextDom.off('click').on('click',function(){
					moveDirec=Math.abs(moveDirec);
					othis.play($ulBox,distance,moveDirec);
				});
			}
		},
		hoverFn:function($ulBox,distance,moveDirec){
			var $this=this.$element,othis=this;
			$ulBox.hover(function(){
				clearInterval($this.timer);
			},function(){
				othis.play($ulBox,distance,moveDirec);
			});
		},
		prev:function($ulBox,distance,moveDirec){
			this.distance=-distance;
			this.play($ulBox,distance,moveDirec);
		},
		next:function(){
			this.distance=-distance;
			this.play($ulBox,distance,moveDirec);
		},
		move:function($ulBox,distance,direc,marginStr,isLast){
			this.$element.timer=setInterval(function(){
				var data={};
				data[marginStr]=distance*direc+'px';
				$ulBox.animate(data,500,function(){
			    	$ulBox.css(marginStr,0);
			    	if(isLast){
			    		$ulBox.find('li:last').hide().prependTo($ulBox).fadeIn();
			    	}else{
			    		$ulBox.find('li:first').hide().appendTo($ulBox).fadeIn();
			    	}
			    });
			},this.options.speed*1000);
		},
		play:function($ulBox,distance,moveDirec){
			clearInterval(this.$element.timer);
			switch(moveDirec){//运动方向
				case -9: 	//上
					this.move($ulBox,distance,-1,'margin-top',false);
				break;
				case 9:		//下
					this.move($ulBox,distance,1,'margin-top',true);
				break;
				case -8:	//左
					this.move($ulBox,distance,-1,'margin-left',false);
				break;
				case 8:		//右
					this.move($ulBox,distance,1,'margin-left',true);
				break;
			}
			this.hoverFn($ulBox,distance,moveDirec);
		}
	};
	
	//SingleScroll PLUGIN DIFINITION
	//=============================
	var old = $.fn.singleScroll;
	
	$.fn.singleScroll=function(option){
		return this.each(function(){
			var $this=$(this);
			var data = $this.data('singleScroll');
			var options = $.extend({},$.fn.singleScroll.defaults,option);
			if(!data) $this.data('singleScroll',(data=new SingleScroll(this,options)));
			if(typeof option == 'string') data[option]();
		});
	};
	$.fn.singleScroll.defaults={
		auto:true,		//自动播放，默认为 true 自动
		position:'X',	//X: 水平	  Y: 垂直
		direction:1,	//1: 正向运动 -1: 反向运动
		speed:2,		//播放的速度 1-3(秒)
		prevSelector:'.prev',	//上一张按钮的选择器
		nextSelector:'.next'	//下一张探钮的选择器
	};
	$.fn.singleScroll.Constructor=SingleScroll;
	
	
	//SingleScroll NO CONFICT
	//=======================
	$.fn.singleScroll.noConflict=function(){
		$.fn.singleScroll=old;
		return this;
	}
	
	//SingleScroll DATA-API
	//=====================
	$(window).on('load', function () {
	    $('[data-toggle="singleScroll"]').each(function () {
	       $.fn.singleScroll.call($(this));
	    })
	 })
	
	
})(jQuery,window,document);