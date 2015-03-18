define(function(require, exports, module) {
	require('jquery');
	require('iscroll-probe');

	var PullRefresh=function(ele,options){
		this.$ele = $(ele);
		this.options = options;
		this.$wrapper=this.$ele;
		this.$scroller = this.$wrapper.find(options.scrollerCls);
		this.$upEl = this.$wrapper.find(options.pullUpCls);
		this.$downEl = this.$wrapper.find(options.pullDownCls);
		this.$list = this.$wrapper.find(options.listBoxCls);
		this.iScrollObj=null;
		this.upNum=this.downNum=0;
		this.isPullUp=false;
		this.loadingStep=0;
		this.init();
	};
	PullRefresh.prototype={
		constructor:PullRefresh,
		init:function(){
			this.iScrollObj = new IScroll(this.$wrapper[0],{
				probeType:2,
				scrollbars:true,
				mouseWheel:true,
				fadeScrollbars:true,
				bounce:true,
				interactiveScrollbars:true,
				shrinkScrollbars:'scale',
				click:true,
				keyBindings:true,
				momentum:true
			});
			this.addEvents(this);
		},
		addEvents:function(oThis){
			oThis.iScrollObj.on('scroll',function(){
				oThis.scrollEvent.bind(this)(oThis);
			});
			oThis.iScrollObj.on('scrollEnd',function(){
				oThis.scrollEndEvent.bind(this)(oThis);
			});
		},
		scrollEvent:function(oThis){
			if(!oThis.loadingStep){
				//添加对是否有下拉或上拉配置的判断
				if(this.y>35 && oThis.options.canPullDown){
					//下拉刷新
					oThis.$downEl.html('<i class="iconfont f18">&#xe604;</i> 释放立即刷新').fadeIn();
					oThis.isPullUp = false;
					oThis.loadingStep = 1;
					oThis.iScrollObj.refresh();
				}else if(this.y < (this.maxScrollY-35) && oThis.options.canPullUp){
					//上拉刷新
					oThis.$upEl.html('<i class="iconfont f18">&#xe604;</i> 释放立即刷新').fadeIn();
					oThis.isPullUp = true;
					oThis.loadingStep = 1;
					oThis.iScrollObj.refresh();
				}
			}
		},
		scrollEndEvent:function(oThis){
			if(oThis.loadingStep===1){
				if(oThis.isPullUp &&  oThis.options.canPullUp){
					oThis.$upEl.html('<i class="iconfont f18 spin">&#xe603;</i> 正在加载').fadeIn();
					oThis.loadingStep=2;
					oThis.options.onPullUp(oThis);
				}else if(oThis.options.canPullDown){
					oThis.$downEl.html('<i class="iconfont f18 spin">&#xe603;</i> 正在加载').fadeIn();
					oThis.loadingStep=2;
					oThis.options.onPullDown(oThis);
				}
			}
		},
		refresh:function(){
			this.iScrollObj.refresh();
		}
	}
	$.fn.pullRefresh = function(option){
		return this.each(function(){
			var $this = $(this);
			var options = $.extend({}, $.fn.pullRefresh.DEFAULTS, $this.data(), typeof option == 'object' && option);
			var data = $(this).data('lt.pullRefresh');
			if(!data){
				$this.data('lt.pullRefresh',data=new PullRefresh(this,options));
			}
			if(typeof option == 'string'){
				data[option]();
			}
		});
	}
	$.fn.pullRefresh.DEFAULTS={
		scrollerCls:'.scrollWrapper',
		pullUpCls:'.pullUp',
		pullDownCls:'.pullDown',
		canPullUp:true,
		canPullDown:false,
		listBoxCls:'.list',
		onPullUp:function(oThis){},
		onPullDown:function(oThis){}
	};
});


