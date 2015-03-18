/* ============================================================================
 * tabSwitch:jquery.tabSwitch.js v1.0.2
 * lastTime:2015年2月14日 09:39:08
 * Email:935486956@qq.com
 * DOM结构示例：
 * 	  	<div class="tab-box">
		  	<div class="tab-menus">
		  		<a href="#" class="active">选项一</a>
		  		<a href="#">选项二</a>
		  		...
		  	</div>
		  	<div class="tab-content">
		  		<div>内容1</div>
		  		<div>内容2</div>
		  		...
		  	</div>
	  	</div>
 * 两种方式初始化 选项切换 组件
 * 1、JS初始化示例：
	$('.tab-box').tabSwitch({
        menusBoxCls: 'tab-menus',         //选项菜单所在盒子的className
        contentBoxCls: 'tab-content',     //内容切换所在盒子的className
        nextCls:'next',                   //下一项
        prevCls: 'prev',                  //上一项
        activeIndex: 0,                   //默认选中的项的索引 
        activeCls: 'active',              //菜单激活的className
        eventType: 'click',               //菜单触发的事件名 click/mouseenter
        onShown:function(activeIndex){},  //显示后的回调 参数：当前显示项的索引
        autoPlay: false,                  //是否自动播放
        isCarousel: false,                //是否为轮播图
        delay: 4000                       //播放延迟时间
	 });
	 如果class名称一样，可以这样初始化：$('.tab-box').tabSwitch();
 * 2、标签属性初始化示例：
 * <div class="tab-box" data-toggle="tab-box">
 * =============================================================================== */

// 2015年3月13日 16:24:08
// 添加对 焦点图 中图片加载的优化
// 首次加载时：只加载第一屏中的图片
// 点击导航时：判断是否加载过，如果没有则获取图片链接进行加载，加载后显示
//             如果已经加载过，则直接显示
// 


;(function ($, window, document, undefined) {
    'use strict';

    //TabSwitch CLASS DIFINITION
    //==========================
    var TabSwitch = function (element, options) {
        this.$el = $(element);
        this.timmer = null;                     //自动播放的定时器
        this.activeIndex = options.activeIndex; //当前选中项的索引
        this.targetIndex = 0;                   //将要选中的索引
        this.$menuChildren = this.$el.find('.' + options.menusBoxCls).children();
        this.$tabContentChildren = this.$el.find('.' + options.contentBoxCls).children();
        this.$next = this.$el.find('.' + options.nextCls);
        this.$prev = this.$el.find('.' + options.prevCls);
        this.menusNum = this.$menuChildren.length; //菜单项的个数
        this.o = options;
        this._init();
    };

    TabSwitch.prototype = {
        constructor: TabSwitch,
        _init: function () {
            var $this = this.$el, o = this.o;

            // 默认选中
            this.$menuChildren.eq(this.activeIndex).addClass(o.activeCls);
            this.$tabContentChildren.eq(this.activeIndex).addClass(o.activeCls);

            o.isCarousel && this._initCarousel();

            // 注册事件
            this._addEvents();

            // 自动播放
            o.autoPlay && this.autoPlay();
        },
        _addEvents: function () {
            var $this = this.$el,
				eventType = this.o.eventType === 'click' ? 'click' : 'mouseenter',
				oThis = this, o = this.o;

            // 点击选项或导航nav
            this.$menuChildren.on(eventType, function () {
                clearInterval(oThis.timmer);
                $.proxy(oThis._play, oThis, $(this).index())();
            });

            // 上一个
            this.$next.length && this.$next.on('click', function(){
                clearInterval(oThis.timmer);
                $.proxy(oThis.next, oThis)();
            });

            // 下一个
            this.$prev.length && this.$prev.on('click', function(){
                clearInterval(oThis.timmer);
                $.proxy(oThis.prev, oThis)();
            });

            // 鼠标进入和离开
            $this.on('mouseenter', function () {
                o.autoPlay && clearInterval(oThis.timmer);
            }).on('mouseleave', function () {
                o.autoPlay && $.proxy(oThis.autoPlay, oThis)();
            });
        },
        _play: function (targetIndex) {
            var o = this.o;

            this.$menuChildren.eq(this.activeIndex).removeClass(o.activeCls).end().eq(targetIndex).addClass(o.activeCls);
            this.$tabContentChildren.eq(this.activeIndex).removeClass(o.activeCls).end().eq(targetIndex).addClass(o.activeCls);
            o.onShown(targetIndex);

            this.activeIndex = targetIndex;
        },
        _initCarousel:function(){
            // 初始化layer层的样式
            var o = this.o, $this;
            this.$el.find('.layer').each(function(){
                $this = $(this);
                $this.css({
                    backgroundImage:'url('+$this.data('bg')+')',
                    animationDelay:$this.data('delay')*0.1+'s'
                });
            });
        },
        next:function(){
            this.targetIndex = this.activeIndex + 1;
            this.targetIndex = this.targetIndex === this.menusNum ? 0 : this.targetIndex;
            this._play(this.targetIndex);
        },
        prev:function(){
            this.targetIndex = this.activeIndex - 1;
            this.targetIndex = this.targetIndex === -1 ? this.menusNum-1 : this.targetIndex;
            this._play(this.targetIndex);
        },
        autoPlay:function(){
            var oThis = this, o = this.o;

            clearInterval(this.timmer);
            this.timmer = setInterval(function () {
                $.proxy(oThis.next, oThis)();
            }, o.delay);
        }
    };

    //TabSwitch PLUGIN DIFINITION
    //===========================
    var old = $.fn.tabSwitch;

    $.fn.tabSwitch = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('tabSwitch.ui');
            var options = $.extend({}, $.fn.tabSwitch.defaults, option);
            if (!data) $this.data('tabSwitch', (data = new TabSwitch(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.tabSwitch.defaults = {
        menusBoxCls: 'tab-menus',	      //选项菜单所在盒子的className
        contentBoxCls: 'tab-content',     //内容切换所在盒子的className
        nextCls:'next',                   //下一项
        prevCls: 'prev',                  //上一项
        activeIndex: 0,                   //默认选中的项的索引 
        activeCls: 'active',			  //菜单激活的className
        eventType: 'click',			      //菜单触发的事件名 click/mouseenter
        onShown:function(activeIndex){},  //显示后的回调 参数：当前显示项的索引
        autoPlay: false,				  //是否自动播放
        isCarousel: false,                //是否为轮播图
        delay: 4000					      //播放延迟时间
    };

    $.fn.tabSwitch.Contructor = TabSwitch;

    //TabSwitch NO CONFLICT
    //====================
    $.fn.tabSwitch.noConflict = function () {
        $.fn.tabSwitch = old;
        return this;
    }

    // TabSwitch DATA-API
    // ==================
    $(function () {
        $('[data-toggle="tab-box"]').tabSwitch();
    });

})(jQuery, window, document)




