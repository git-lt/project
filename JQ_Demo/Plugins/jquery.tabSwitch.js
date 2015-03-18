/* ============================================================================
 * tabSwitch:jquery.tabSwitch.js v1.0.1
 * lastTime:2015年2月14日 09:39:08
 * Copyright 2014 LT, Inc.
 * 选项卡切换
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
		menusBoxCls:'tab-menus',	//选项菜单所在盒子的className
		contentBoxCls:'tab-content',//内容切换所在盒子的className
		activeCls:'active',			//菜单激活的className
		eventType:'click'			//菜单触的事件 click/mouseover
		autoPlay:false,				//是否自动播放
		delay:3000					//播放延迟时间
	 });
	 如果class名称一样，可以这样初始化：$('.tab-box').tabSwitch();
 * 2、标签属性初始化示例：
 * <div class="tab-box" data-toggle="tab-box">
 * =============================================================================== */

; (function ($, window, document, undefined) {
    'use strict';

    //TabSwitch CLASS DIFINITION
    //==========================
    var TabSwitch = function (element, options) {
        this.$el = $(element);
        this.timmer = null;
        this.activeIndex = 0;
        this.$menuChildren = this.$el.find('.' + options.menusBoxCls).children();
        this.$tabContentChildren = this.$el.find('.' + options.contentBoxCls).children();
        this.o = options;
        this.init();
    };

    TabSwitch.prototype = {
        constructor: TabSwitch,
        init: function () {
            var $this = this.$el;

            //默认内容隐藏，第一个选项卡选中
            this.$menuChildren.first().addClass('active');
            this.$tabContentChildren.first().addClass('active');

            //注册事件
            this._addEvent();

            // 自动播放
            !!this.o.autoPlay && this._play();
        },
        _addEvent: function () {
            var $this = this.$el,
				eventType = this.o.eventType === 'click' ? 'click' : 'mouseover',
				oThis = this;

            //给菜单添加 click 或 mouseover 事件
            this.$menuChildren.on(eventType, function (e) {
                e.preventDefault();

                clearInterval(oThis.timmer);

                var currIndex = $(this).index();

                oThis.$menuChildren.eq(oThis.activeIndex).removeClass('active').end().eq(currIndex).addClass('active');
                oThis.$tabContentChildren.eq(oThis.activeIndex).removeClass('active').end().eq(currIndex).addClass('active');

                oThis.o.onShown(currIndex);

                oThis.activeIndex = currIndex;
            });
        },
        _play: function () {
            clearInterval(this.timmer);
            var $this = this.$el, oThis = this, count = this.$menuChildren.length, currIndex;

            this.timmer = setInterval(function () {
                currIndex = oThis.activeIndex + 1;
                if (currIndex === count) currIndex = 0;

                oThis.$menuChildren.eq(oThis.activeIndex).removeClass('active').end().eq(currIndex).addClass('active');
                oThis.$tabContentChildren.eq(oThis.activeIndex).removeClass('active').end().eq(currIndex).addClass('active');
                oThis.o.onShown(currIndex);
            }, this.o.delay);

            $this.on('mouseenter', function () {
                clearInterval(this.timmer);
            }).on('mouseleave', function () {
                oThis._play();
            });
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
        activeCls: 'active',			  //菜单激活的className
        effect: 'fadeIn',  			      //内容显示的方式 show/fadeIn/slideDown/slideUp
        eventType: 'click',			      //菜单触的事件 click/mouseover
        onShown:function(currIndex){},    //显示后的回调
        autoPlay: false,				  //是否自动播放
        delay: 3000					      //播放延迟时间
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
        $.fn.tabSwitch.call($('[data-toggle="tab-box"]'));
    });

})(jQuery, window, document)




