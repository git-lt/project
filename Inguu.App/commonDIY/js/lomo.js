// window.onerror = function(msg,url,line,col,error){
// 	alert(msg+'--'+url+'--'+line+'--'+col+'--'+error);
// }
/**
 * [GLOBAL 全局对象]
 */


var GLOBAL = {
	orderInfo:{},		//订单信息
	reqURL:{}, 			//请求的地址
	photo:function(){}, //图片信息对象
	photos:[] 			//图片在模板中的位置信息
};

var Page={
	preInit:function(){}, //页面初始化
	index:{},	//首页逻辑
	cart:{} 	//制作间操作页面逻辑
};


/**
 * [Utils 工具类]
 */
Utils = {
    debounce: function (func, wait, immediate) {/*方法防抖*/
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    newGuid: function (g, len) {/*生成唯一GUID*/
        var g = g || "";
        var i = len || 32;
        while (i--) {
            g += Math.floor(Math.random() * 16.0).toString(16);
        }
        function Guid(g) {

            var arr = new Array();

            if (typeof (g) == "string") {
                InitByString(arr, g);
            }
            else {
                InitByOther(arr);

            }

            this.Equals = function (o) {
                if (o && o.IsGuid) {
                    return this.ToString() == o.ToString();
                }
                else {
                    return false;
                }
            }

            this.IsGuid = function () { }

            this.ToString = function (format) {
                if (typeof (format) == "string") {

                    if (format == "N" || format == "D" || format == "B" || format == "P") {
                        return ToStringWithFormat(arr, format);
                    }

                    else {
                        return ToStringWithFormat(arr, "D");
                    }
                }

                else {
                    return ToStringWithFormat(arr, "D");
                }
            }

            function InitByString(arr, g) {

                g = g.replace(/\{|\(|\)|\}|-/g, "");
                g = g.toLowerCase();
                if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {
                    InitByOther(arr);
                }
                else {
                    for (var i = 0; i < g.length; i++) {
                        arr.push(g[i]);
                    }
                }
            }
            function InitByOther(arr) {
                var i = 32;
                while (i--) {
                    arr.push("0");
                }
            }

            function ToStringWithFormat(arr, format) {
                switch (format) {
                    case "N":
                        return arr.toString().replace(/,/g, "");
                    case "D":
                        var str = arr.slice(0, 8) + "-" + arr.slice(8, 12) + "-" + arr.slice(12, 16) + "-" + arr.slice(16, 20) + "-" + arr.slice(20, 32);
                        str = str.replace(/,/g, "");
                        return str;
                    case "B":
                        var str = ToStringWithFormat(arr, "D");
                        str = "{" + str + "}";
                        return str;

                    case "P":
                        var str = ToStringWithFormat(arr, "D");
                        str = "(" + str + ")";
                        return str;

                    default:
                        return new Guid();
                }
            }
        }

        return new Guid(g);
    },
    refreshStringArr:function(sArr){/*刷新关联数组的数据，去掉空值，添加length*/
    	if(!sArr) return false;
    	var t=[],len=0;
    	for(var i in sArr){
    		if(sArr[i]){
    			t[i]=sArr[i];
    			len++;
    		}
    	}
    	t.length = len;
    	return t;
    },
    objectToXml:function (obj) {/*将json格式的模板数据转换为XML字符串*/
    	var xml = "";
    	for(var j in obj){
    		switch(j){
    			case "PageModel":
    			case "LayerModel":
    			case "Point":
    				xml += this.objectToXml(obj[j]);
    				break;
    			case "Layers":
    			case "Pages":
    			case "Points":
    				xml += "<" + j + ">";
	    			for (var item in obj[j]) {
	    				if(obj[j][item].length){
	    					for (var i = 0; i < obj[j][item].length; i++) {
	    						xml += "<" + item + ">" + this.objectToXml(obj[j][item][i]) + "</" + item + ">";
	    					};
	    				}else{
		    				xml += "<" + item + ">" + this.objectToXml(obj[j][item]) + "</" + item + ">";
	    				}
	    			};
    				
	    			xml += "</" + j + ">";
    				break;
    			case 'xmlns:xsi':
    			case 'xmlns:xsd':
    				break;
    			default:
    			xml+="<"+j+">" + obj[j] + "</"+j+">";

    		}
    	}
    	return xml;
    },
    isArray:function(obj){/*判断是否为数组*/
    	return Object.prototype.toString.call(obj) === '[object Array]';
    },
    objectToUrlpms:function(obj){/*将json数据转换为url参数字符串*/
    	var t = '?';
    	for(var i in obj){
    		t+=i+'='+obj[i]+'&';
    	}
    	return t.substring(0,t.length-1);
    },
    rgbToHex:function(rgbColor){/*将RGB颜色值转换为16进度颜色值*/
	   	rgb=rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

		function hex(x){ 
			return ("0"+parseInt(x).toString(16)).slice(-2); 
		} 

		rgb="#"+hex(rgb[1])+hex(rgb[2])+hex(rgb[3]); 

		return rgb; 
    },
    setCookie:function(name,value,days){/*设置cookie*/
        var days = days || 30;
	    var exp = new Date();
	    exp.setTime(exp.getTime() + days*24*60*60*1000);
	    document.cookie = name + "="+ escape(value) + ";expires=" + exp.toGMTString();
    },
    getCookie:function(name){/*获取cookie*/
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
	    if(arr=document.cookie.match(reg))
	        return (unescape(arr[2]));
	    else
	        return '';
    },
    delCookie:function(name){/*删除cookie*/
        var exp = new Date();
	    exp.setTime(exp.getTime() - 1);
	    var cval=getCookie(name);
	    if(cval!='')
	        document.cookie= name + "="+escape(cval)+";expires="+exp.toGMTString();
    },
    getUrlQuery:function(url,queryName){/*根据key获取url中的参数值*/
        var reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)");
        var r = url.substring(url.indexOf("\?") + 1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    checkPicZize:function(tplW,tplH,picW,picH){
    	tplW = parseInt(tplW,10); tplH = parseInt(tplH,10);
    	picW = parseInt(picW,10); picH = parseInt(picH,10);

    	if(!(tplW && tplH && picW && picH)){
    		console.log('warn: one size is 0!');
    		return;
    	}

		if(picW<tplW && picH<tplH){
			if(picW<tplW/2 && picH<tplH/2){
				return -1; //像素严重不足
			}
			return 0; //像素不足
		}
		return 1; 	//像素正常
    },
    isSupportFixed:function(){
	    var userAgent = window.navigator.userAgent, 
	        ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
	        ios5below = ios && ios[2] && (parseInt(ios[2].replace(/_/g, '.'), 10) < 5),
	        operaMini = /Opera Mini/i.test(userAgent),
	        body = document.body,
	        div, isFixed;

	    div = document.createElement('div');
	    div.style.cssText = 'display:none;position:fixed;z-index:100;';
	    body.appendChild(div);
	    isFixed = window.getComputedStyle(div).position != 'fixed';
	    body.removeChild(div);
	    div = null;

	    return !!(isFixed || ios5below || operaMini);
	}
};

GLOBAL.orderInfo = { /*这里的信息会在 preInit中全部重置*/
		orderID: '',    			//订单编号
	    proID: 0,       		//产品id
	    tplID: null,
	    tplXmlUrl:'',
	    typeName:'',
	    typeID: null,
	    pageCount:5,
	    currPage:0,
	    pageTotal:0,
	    taobao: Utils.getCookie('taobao'),  //旺旺名
	    total: 0,   						//照片总数量
	    isNew: true,    					//是否为当前订单
	    editUrl:''
}

GLOBAL.reqURL={
	// proxyURL:'/MakeApi/ProxyXml',
	// picSubURL: '/MakeApi/UploadFile',
	//orderSubURL:'/MakeApi/UploadAlbum',
	//imgSrc:'/MakeApi/GetUserPic/',
	// //?orderid=80&start=1&limit=2&typeid=25
	
	root:'http://api.inguu.com',
	getStyleURL:'http://api.inguu.com/Mould/GetTypeList?typeclass=2&shop=64',
	getTplsURL:'http://api.inguu.com/Mould/getlist',
    ttfURL:'http://api.inguu.com/font/GetList',
    getFontPicURL:'http://api.inguu.com/font/GetFontPic',
    proxyURL:'/tool/ProxyXml',
    picSubURL: '/photo/UploadPhoto',
    orderSubURL:'/Photo/UploadOrder?makeClass=OrderComposite.BookComposite,OrderComposite',
    imgSrc:'/Temp/'
}

GLOBAL.Photo=function(pms){
	if (pms && pms.length) {
        this.guid = pms.guid;
        this.state = pms.state;
        this.param = pms.param;
        this.goods = pms.goods;
        this.number = pms.number;
        this.imageWidth = pms.imageWidth;
        this.imageHeight = pms.imageHeight;
        this.orderID = pms.orderID;
        this.rotate = pms.rotate;
    }
}
GLOBAL.photos=[];


/**
 * [页面组件]
 */
//组件 - 页面切换
	var PageTransition = {
	    defauts: {
	        pageOutCls: 'page-out',
	        pageInCls: 'page-in',
	        activeCls: 'page-active',
	        nextPageCls: 'page-next',
	        prevPageCls: 'page-prev',
	        nextSelector: 'header .btn-next-page',
	        prevSelector: 'header .btn-prev-page',
	        pageSelector: 'section.page',
	        prevHandler: function ($currPage, $prevPage) { },
	        nextHandler: function ($currPage, $nextPage) { }
	    },
	    init: function () {
	        this.pageSlideOver();
	        this.addEvents();
	    },
	    pageSlideOver: function () {
	        var opt = this.defauts;
	        $('.' + opt.pageOutCls).on('transitionend', function () {
	            $(this).removeClass(opt.pageOutCls);
	        });
	        $('.' + opt.pageInCls).on('transitionend', function () {
	            $(this).removeClass(opt.pageInCls);
	        });
	    },
	    nextPage: function ($currPage) {
	        var opt = this.defauts;
	        var $currPage = $currPage,
	            $nextPage = $currPage.next(opt.pageSelector),
	            nextPageName = $nextPage.data('role');
	        $currPage.removeClass(opt.activeCls).addClass(opt.prevPageCls + ' ' + opt.pageOutCls);
	        $nextPage.removeClass(opt.nextPageCls).addClass(opt.activeCls + ' ' + opt.pageInCls);
	        history.pushState({ "page": nextPageName }, "", "?page=" + nextPageName);
	        opt.nextHandler && opt.nextHandler($currPage, $nextPage);
	    },
	    prevPage: function ($currPage) {
	        var opt = this.defauts;
	        var $currPage = $currPage,
	            $prevPage = $currPage.prev(opt.pageSelector);
	        $currPage.removeClass(opt.activeCls).addClass(opt.nextPageCls + ' ' + opt.pageOutCls);
	        $prevPage.removeClass(opt.prevPageCls).addClass(opt.activeCls + ' ' + opt.pageInCls);
	        history.go(-1);
	        opt.prevHandler && opt.prevHandler($currPage, $prevPage);
	    },
	    addEvents: function () {
	        var opt = this.defauts, oThis = this;
	        $(opt.nextSelector).on('click', function () {
	            oThis.nextPage($(this).parents(opt.pageSelector));
	        });
	        $(opt.prevSelector).on('click', function () {
	            oThis.prevPage($(this).parents(opt.pageSelector));
	        });
	    }
	};
	$.pageTransition = PageTransition;

//组件 - 下拉上拉刷新
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
				oThis.crollEvent.bind(this)(oThis);
			});
			oThis.iScrollObj.on('scrollEnd',function(){
				oThis.scrollEndEvent.bind(this)(oThis);
			});
		},
		crollEvent:function(oThis){
			if(!oThis.loadingStep){
				//添加对是否有下拉或上拉配置的判断
				if(this.y>20 && oThis.options.canPullDown){
					//下拉刷新
					oThis.$downEl.show().html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 释放更新');
					oThis.loadingStep=1;
					oThis.isPullUp = false;
					oThis.iScrollObj.refresh();
				}else if(this.y < (this.maxScrollY-20) && oThis.options.canPullUp){
					//上拉刷新
					oThis.$upEl.show().html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 释放更新');
					oThis.loadingStep=1;
					oThis.isPullUp = true;
					oThis.iScrollObj.refresh();
				}
			}
		},
		scrollEndEvent:function(oThis){
			if(oThis.loadingStep===1){
				if(oThis.isPullUp &&  oThis.options.canPullUp){
					oThis.$upEl.html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 正在加载...');
					oThis.loadingStep=2;
					oThis.options.onPullUp(oThis);
				}else if(oThis.options.canPullDown){
					oThis.$downEl.html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 正在加载...');
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
		onPullUp:function(oThis){
			alert('默认函数');
			// for (var i = 0; i <3; i++) {
			// 	oThis.upNum++;
			// 	oThis.$list.append('<li>Add row '+oThis.upNum+'</li>');
			// };

			// oThis.$upEl.html('<span class="mui-icon mui-icon-arrowthinup"></span> 上拉显示更多...');
			// oThis.iScrollObj.refresh();
			// oThis.loadingStep = 0;
		},
		onPullDown:function(oThis){
			alert('默认函数');
			// for (var i = 0; i <3; i++) {
			// 	oThis.downNum++;
			// 	oThis.$list.prepend('<li>Add row '+oThis.downNum+'</li>');
			// };

			// oThis.$downEl.html('<span class="mui-icon mui-icon-arrowthindown"></span> 下拉显示更多...');
			// oThis.iScrollObj.refresh();
			// oThis.loadingStep = 0;
		}
	};

//组件 - 消息提示
	$.msg ={};
	$.msg.tip=function(txt,boxSlt,timeout,color){
		var $box = $(boxSlt),
			$con = $box.find('.con'),
			$colose = $box.find('.close'),
			c = color || 'blue';

		if($box.data('isShown')=='1'){
			clearTimeout($con.timmer);
			$con.removeClass('flash').css('-webkit-animation-delay','0s');
			$con.timmer = setTimeout(function(){
				$con.addClass('flash');
			},300);
			
		}else{
			//显示
			$con.text(txt||'');
			$box.addClass(c).show().removeClass('fadeOutRight').addClass('fadeInRight');
			$con.addClass('flash').css('-webkit-animation-delay','1s');

			//延时关闭和自动关闭
			if(timeout && $.isNumeric(timeout)){
				clearTimeout($box.timmer);
				$box.timmer = setTimeout(function(){
					$box.removeClass('fadeInRight').addClass('fadeOutRight');
					$con.removeClass('flash');
					$box.data('isShown','0');
				},timeout);
			}
			$colose.off().on('click',function(){
				clearTimeout($box.timmer);
				$box.removeClass('fadeInRight').addClass('fadeOutRight');
				$con.removeClass('flash');
				$box.data('isShown','0');
			});

			$box.data('isShown','1');
		}
	};

//组件 - 颜色选择
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
	}

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


//首页初始化之前的处理
Page.preInit=function(){

    //显示 引导页 (第一次显示)
    var $guidPage = $('#page-guide');
    setTimeout(function(){$guidPage.addClass('fadeOut')},4000);
    setTimeout(function(){$guidPage.remove();},5000)
    // if(Utils.getCookie('guidShown')){
    //     $guidPage.hide();
    // }else{
    //     setTimeout(function(){$guidPage.addClass('fadeOut')},4000);
    //     setTimeout(function(){$guidPage.remove();},5000)
    //     Utils.setCookie('guidShown','true');
    // }
    

    //如果浏览器支持fixed, 设置header 和 footer为fixed定位
    if(Utils.isSupportFixed()){
    	$('footer,header').css('position','fixed');
    }
    
    //获取请求类型ID
	var urlId = PRO_INFO['id'];
	if(!urlId){
		$.msg.tip('请求地址错误！','#alert-box',4000,'red');
		return false;
	}

	//初始化默认的订单信息
	GLOBAL.orderInfo = {
		orderID: Utils.newGuid().ToString('D'),    //订单编号
	    proID: urlId,            //产品id 3028
	    tplID: null,
	    tplXmlUrl:'',
	    typeName:'',
	    typeID: 31,
	    pageCount:5,
	    currPage:0,
	    pageTotal:0,
	    taobao: Utils.getCookie('taobao'),   //旺旺名
	    total: 0,    			//照片总数量
	    isNew: true,    		//是否为当前订单
	    editUrl:window.location.href
	}

	var $styleBox = $('#style-chk-box'),
		$tplBox = $('#tpl-list'),
		$tplchkBox = $('#tpl-chk-box'),
		$resBox = $('#choiceInfo'),
		isFisrtScrollInit=true;

	//显示选择项
	var showSelected=function(){
		$resBox.text('模板：'+(GLOBAL.orderInfo.typeName||'无')+' - '+(GLOBAL.orderInfo.tplID||'无'));
	};

	//初始化iScroll拉动刷新组件
	var iScrollInit = function(){
		$tplchkBox.pullRefresh({
	    	onPullUp:function(oThis){
	    		//获取总页数和当前页面码
	    		var typeid = GLOBAL.orderInfo['typeID'],
	    			currPage = GLOBAL.orderInfo['currPage'],
	    			pageTotal = GLOBAL.orderInfo['pageTotal'],
	    			pageCount = GLOBAL.orderInfo['pageCount'];

	    		if(currPage<=pageTotal){
	    			currPage++;
	    			var urlPms = '?orderid='+GLOBAL.orderInfo.proID+'&start='+currPage+'&limit='+pageCount+'&typeid='+typeid+'&shop=64';
	    			var url = GLOBAL.reqURL.getTplsURL+urlPms;
	    			console.log('更新：'+url);
	    			$.post(GLOBAL.reqURL.proxyURL,data,function(res){
						 var jsonData = $.xml2json(res);
				 		 console.log(jsonData);
					});
	    			$.ajax({
	    				url:GLOBAL.reqURL.proxyURL,
	    				type:'POST',
	    				data:{url:url},
	    				success:function(res){
	    					GLOBAL.orderInfo['currPage']=currPage;
	    					var jsonData = $.xml2json(res);

				 		 	//将模板数量存储于按钮上
				 		 	var count = jsonData.count;

				 		 	//将模板信息显示出来
				 		 	if(count>0 && jsonData.mould){
				 		 		var tpls = jsonData.mould, tplsHTML=[], tplsNum = tpls.length;
				 		 		if(tplsNum){
				 		 			for(var j=0, len=tpls.length; j<len; j+=1){
				 		 				tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+'><img src="'+tpls[j]['picurl']+'" alt="模板预览"></li>')
				 		 			}
				 		 		}else{
				 		 			tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+'><img src="'+tpls['picurl']+'" alt="模板预览"></li>')
				 		 		}
				 		 		$tplBox.append(tplsHTML.join(''));


			 		 			if(tplsNum && tplsNum>=GLOBAL.orderInfo['pageCount']){
			 		 				Utils.debounce(function(){
					 		 			oThis.$upEl.html('<span class="mui-icon mui-icon-arrowthinup"></span> 上拉显示更多...');
					 		 			oThis.iScrollObj.refresh();
				 		 			},400,false)();
			 		 			}
				 		 	}else{
				 		 		oThis.$upEl.html('没有更多了...');
				 		 	}
	    				},
	    				error:function(){
	    					oThis.$upEl.html('<span class="mui-icon mui-icon-close"></span> 网络错误，数据加载失败！');
	    				}
	    			});
	    		}else{
	    			oThis.$upEl.html('没有更多了...');
	    		}
				// oThis.iScrollObj.refresh();
				oThis.loadingStep = 0;
			}
	    });
	};

	//点击风格的事件
	var styleClickFn = function(){
		var $this = $(this),$pullUp=$('#pullUp');
		//隐藏上拉加载，显示加载中
		$pullUp.hide();
		$tplBox.html('<div class="loading-tpl c-888" ><img src="/images/loading1.gif" alt="">  加载中···</div>');

    	//更改样式
    	$styleBox.data('chkedIndx') !== undefined && $styleBox.children().eq($styleBox.data('chkedIndx')).removeClass('active');
    	$styleBox.data('chkedIndx',$(this).index());
    	$(this).addClass('active');

    	//获取styleID
    	var styleid = $(this).data('styleid');

    	//更新orderInfo
    	GLOBAL.orderInfo['typeID'] = styleid;
    	GLOBAL.orderInfo['tplID']=null;
    	GLOBAL.orderInfo['currPage']=0;
    	GLOBAL.orderInfo['typeName']=$this.text();
    	showSelected();

    	//根据styleID获取风格下的图片，第一次获取3张
    	var url=GLOBAL.reqURL.getTplsURL+'?orderid='+GLOBAL.orderInfo.proID+'&typeid='+styleid+'&start=0&limit='+GLOBAL.orderInfo.pageCount+'&shop=64';
		console.log(url);
		$.ajax({
			url: GLOBAL.reqURL.proxyURL,
			type: 'POST',
			data: {url:url}
		})
		.done(function(res) {
			var jsonData = $.xml2json(res);
			console.log(jsonData);

			//将模板数量存储于按钮上
			var count = jsonData.count;
			$this.data('total',count);

			GLOBAL.orderInfo['pageTotal'] = count && parseInt(Math.ceil(count/GLOBAL.orderInfo.pageCount));
			console.log(GLOBAL.orderInfo);

			//将模板信息显示出来
			if(count>0){
				// $pullUp.show();
				var tpls = jsonData.mould, tplsHTML=[], tplsNum = tpls.length;
				if(tplsNum){
					for(var j=0, len=tpls.length; j<len; j+=1){
						tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+'><img src="'+tpls[j]['picurl']+'" alt="模板预览"></li>');
					}
				}else{
					tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+'><img src="'+tpls['picurl']+'" alt="模板预览"></li>');
					$pullUp.hide();
				}

				$tplBox.html(tplsHTML.join('')+'');

				if(tplsNum>=GLOBAL.orderInfo['pageCount']){
						$pullUp.show();
				}

				if(isFisrtScrollInit){
					iScrollInit();
					isFisrtScrollInit=false;
				}else{
					Utils.debounce(function(){$tplchkBox.pullRefresh('refresh');},400,false)();
				}
			}else{
				$tplBox.html('<p class="mui-text-center c-888 f30" style="line-height:300px">敬请期待...</p>');
				if(!isFisrtScrollInit){
					Utils.debounce(function(){$tplchkBox.pullRefresh('refresh');},300,false)();
				}
				$pullUp.hide();
				GLOBAL.orderInfo['tplID']=null;
				console.log(GLOBAL.orderInfo);
			}
		})
		.fail(function(res) {
			$tplBox.html('<p class="mui-text-center c-888 f30" style="line-height:300px">模板加载失败！</p>');
		});
	};

	//点击模板的事件
	var tplClickFn = function(){
		var $this =$(this);
		var tplID = $this.data('tplid');

		//添加选中效果
		$tplBox.data('chkedIndex') != 'undefined' && $tplBox.children().eq($tplBox.data('chkedIndex')).removeClass('active');
		$this.addClass('active');
		$tplBox.data('chkedIndex',$this.index());

		//更新orderInfo
		GLOBAL.orderInfo['tplID']=tplID;
		GLOBAL.orderInfo['tplXmlUrl']=$this.data('xmlurl');
		showSelected();
		console.log(GLOBAL.orderInfo);
	};

    //注册点击事件
    $styleBox.delegate('li','click',styleClickFn);
    
    //给模板图片添加事件
	$tplBox.delegate('li','click',tplClickFn);

	//异步获取 风格 信息
	var data = {url:GLOBAL.reqURL.getStyleURL+'&orderid='+GLOBAL.orderInfo.proID};
	$.ajax({url:GLOBAL.reqURL.proxyURL, type:'POST', data:data, async:false,success:function(res){
		 var jsonData = $.xml2json(res);
		 if(!jsonData || !jsonData.mouldtype) {
		 	$styleBox.html('<span class="c-888 ml1em">暂无数据！</span>'); return false;
		 }

 		 if(!Utils.isArray(jsonData.mouldtype)) {
		 	var t = jsonData.mouldtype;
		 	jsonData.mouldtype=[];
		 	jsonData.mouldtype.push(t);
		 }

		 console.log(jsonData);
 		 if(jsonData.mouldtype && jsonData.mouldtype.length){
 		 	//获取风格数据
 		 	var styles = jsonData.mouldtype;

 		 	var styleHtml=[];
 		 	for(var i=styles.length-1,len= styles.length; i>=0; i--){
 		 		styleHtml.push('<li data-styleid='+styles[i]['id']+'><a href="javascript:void(0)">'+styles[i]['typename']+'</a></li>');
 		 	}
 		 	$styleBox.append(styleHtml.join(''));

 		 	if(styles.length>3){
 		 		$styleBox.css('width',$styleBox.children().first().outerWidth(true)*styles.length+10);
 		 		//添加滚动效果
	 		    var s_style = new IScroll('#style-wrapper', { 
			    	scrollX: true, 
			    	scrollY: false, 
			    	snap: 'li',
			    	momentum:false,
			    	click:true
			    });
 		 	}

			$styleBox.children().eq(0).trigger('click');
 		 }
	}});

    $('#view-page-index')[0].addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    $('#tpls-box')[0].addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    //存储订单的初始化的信息
    GLOBAL.orderInfo_temp = $.extend({},GLOBAL.orderInfo);

    //注册关闭事件
    $('#page-subResult').on('click',function(){
            $(this).removeClass('in').addClass('out'); return false;
    });
}

Page.index={
	init:function(){
		//将默认选项选中
		$('#style-chk-box li:first').click();
	}
}

Page.cart={
	options:{
		taobaoBox:$('#cart-taobao'),
		picListBox:$('#pic-list-box'),
		isFirstInit:true,
		currXmlUrl:'',
		currPageNum:0,		//第几页模板
		currPageScale:0, 	//模板的缩放值
		models:{},
		tplXMLData:{},  	//模板信息
		textLayerInfo:{}, 	//存储模板上的文字层信息 t-0-1
		ttfPicList:[],		//字体预览图的数据
		imgPosInfo:[]  		//保存模板上的照片坐标信息
	},
	init:function(){
		var o = this.options;
		if(o.isFirstInit){
			//更新淘宝名称
			o.taobaoBox.text(GLOBAL.orderInfo.taobao);

			//注册上传事件
			this.uploadPic();

			this.reChoiceTplEv();

			this.editUserEv();

			this.subOrderEv();

			this.tplNavPageEv();

			this.picListActionEV();

			this.popupAddTextEv();

			o.isFirstInit=false;
		}

		//显示对应模板
		this.initTpl();

		//注册拖拽事件
		// this.initDrag();
	},
	initTpl:function(){
		var that= this,o=this.options;
		if(o.currXmlUrl==GLOBAL.orderInfo.tplXmlUrl) return;
		o.currXmlUrl = GLOBAL.orderInfo.tplXmlUrl;
		$.post(GLOBAL.reqURL.proxyURL,{url:GLOBAL.orderInfo.tplXmlUrl},function(data){
			var res = $.xml2json(data);
			o.tplXMLData = res;
			o.imgPosInfo=[];
			console.log(res);
			
			//模板大小
			var pages = res.Pages||{};
			if(!pages) return false;
			
			//生成页码导航
			//如果是单面则没有页码导航
			var arrModels = o.models = pages.PageModel;
			var firstModel = arrModels;
			if(arrModels.length){
				firstModel = arrModels[0];
				var tplNavNum = [],cls;
				tplNavNum.push('<div class="mui-clearfix">');
				for(var i=1,len = arrModels.length; i<=len; i+=1 ){
					if( i!==1 && (i-1)%5===0){
						tplNavNum.push('</div><div class="mui-clearfix hide">');
					}else if( i===len && i%5 !==0 ){
						tplNavNum.push('<a href="javascript:void(0)" >'+i+'</a></div>');
						break;
					}
					cls = i===1?'active':'';
					tplNavNum.push('<a href="javascript:void(0)" class="'+cls+'" >'+i+'</a>');
				}
				$('#tpl-navpage div.pagenum').html(tplNavNum.join('')).data('currPageNumLayer',0);
				$('#tpl-navpage').show();
			}

			//显示第一个模板
			// 背景图和文本层
			var back= firstModel.Back,
				textLayers= firstModel.TextLayers,
				modelWidth = firstModel.Width,
				modelHeight = firstModel.Height;

			//设置背景图片
			$('#tpls-box').data('currindex',0).children().first().nextAll().remove(); //除了第一页模板，其它的都删除
			var $tplbox = $('#tpl-edit-box0');
			$tplbox.show().children().remove();

			var restH = document.body.clientHeight-44-41-84-28-32-20;
			var restW = document.body.clientWidth-20;			
			o.currPageScale = parseInt(modelWidth,10) >= parseInt(modelHeight,10) ? restW/modelWidth : restH/modelHeight;

			$tplbox.css({
				'position':'relative',
				'background':'url('+GLOBAL.reqURL.root+back+') no-repeat center center',
				'background-size':'100%',
				'width':modelWidth,
				'height':modelHeight,
				'zoom':o.currPageScale,
				'left':'50%',
				'margin-left':-modelWidth/2
			});
			
			var arrLays=firstModel.Layers.LayerModel,
				eleW ,eleH ,eleIndex ,isPhoto ,isRotate ,eleRotate ,eleX ,eleY ,src,indexV;
			if(arrLays){
				if(!Utils.isArray(arrLays)){
					var t = arrLays;
					arrLays=[];
					arrLays = arrLays.push(t);
				}
				for(var i=0,len=arrLays.length; i<len; i+=1){
					eleW = arrLays[i]['Width'];
					eleH = arrLays[i]['Height'];
					eleIndex = arrLays[i]['Index'];
					isPhoto = arrLays[i]['IsPhoto'];
					isRotate = arrLays[i]['IsRotate'];
					maskUrl = arrLays[i]['Mask'];

					eleRotate = 'rotate('+arrLays[i]['Rotate']+'deg)';
					eleX = arrLays[i]['X'];
					eleY = arrLays[i]['Y'];
					src= arrLays[i]['Src'];
					indexV =arrLays[i]['Index'];

					if(src) src= GLOBAL.reqURL.root+src;

					if(isPhoto=='false'){	//素材
						$('<img src="'+src+'" alt="素材图片" data-index="'+indexV+'" width="'+eleW+'" height="'+eleH+'" />').css({
							position:'absolute',
							left:eleX+'px',
							top:eleY+'px',
							zIndex:eleIndex,
							transform: eleRotate,
							'pointer-events':'none'
						}).appendTo($tplbox);
					}else{ 	//照片
						$('<div class="drop-box" data-index="'+indexV+'"><p style="margin-top:25%; color:#fff;">请拖动图片到此处</p></div>').css({
							position:'absolute',
							backgroundColor:'rgb(168, 168, 168)',
							color:'#fff',
							textAlign:'center',
							left:eleX+'px',
							top:eleY+'px',
							zIndex:eleIndex,
							transform: eleRotate,
							width:eleW+'px',
							'-webkit-mask':!!maskUrl ? 'url('+GLOBAL.reqURL.root+ maskUrl+') no-repeat 50% 50%/100%':'none',
							height:eleH+'px'}).data('boxsize',{w:eleW,h:eleH}).appendTo($tplbox);
					}
				}
			}

			$('#loading-tpl').hide();
		});
	},
	tplNavPageEv:function(){
		var $navPageBox = $('#tpl-navpage');
		var $tplsBox = $('#tpls-box');
		var $numLayers = $navPageBox.find('.pagenum');
		var o = this.options, self=this;
		$navPageBox.on('click','a',function(){
			var models = o.models;
			if(!models || !models.length) return false;
			var $this = $(this),
				index = parseInt($this.text(),10)-1;

			var model = models[index];
			var arrLays=model.Layers.LayerModel;

			o.currPageNum = index;
				
			//判断是否存在，如果存在，则不需要添加
			//不存在，创建dom，添加到盒子
			if($('#tpl-edit-box'+index).length==0){
				$tplsBox.append('<div class="tpl-edit-box" id="tpl-edit-box'+index+'" ></div>');

				var $tplbox = $('#tpl-edit-box'+index);
				var back= model.Back,
					textLayers= model.TextLayers,
					modelWidth = model.Width,
					modelHeight = model.Height;

				//设置背景图片
				var restH = document.body.clientHeight-44-41-84-28-32-20;
				var restW = document.body.clientWidth-20;			
				o.currPageScale = parseInt(modelWidth,10) >= parseInt(modelHeight,10) ? restW/modelWidth : restH/modelHeight;

				$tplbox.css({
					'position':'relative',
					'background':'url('+GLOBAL.reqURL.root+back+') no-repeat center center',
					'background-size':'100%',
					'width':modelWidth,
					'height':modelHeight,
					'zoom':o.currPageScale,
					'left':'50%',
					'margin-left':-modelWidth/2
				});

				if(Utils.isArray(arrLays)){
					var eleW ,eleH ,eleIndex ,isPhoto ,isRotate ,eleRotate ,eleX ,eleY ,src,indexV;
					for(var i=0,len=arrLays.length; i<len; i+=1){
						eleW = arrLays[i]['Width'];
						eleH = arrLays[i]['Height'];
						eleIndex = arrLays[i]['Index'];
						isPhoto = arrLays[i]['IsPhoto'];
						isRotate = arrLays[i]['IsRotate'];
						eleRotate = 'rotate('+arrLays[i]['Rotate']+'deg)';
						eleX = arrLays[i]['X'];
						eleY = arrLays[i]['Y'];
						src= arrLays[i]['Src'];
						indexV =arrLays[i]['Index'];

						if(src) src= GLOBAL.reqURL.root+src;

						if(isPhoto=='false'){	//素材
							$('<img src="'+src+'" alt="素材图片" data-index="'+indexV+'" width="'+eleW+'" height="'+eleH+'" />').css({
								position:'absolute',
								left:eleX+'px',
								top:eleY+'px',
								zIndex:eleIndex,
								transform: eleRotate,
								'pointer-events':'none'
							}).appendTo($tplbox);
						}else{ 	//照片
							$('<div class="drop-box" data-index="'+indexV+'"><p style="margin-top:25%; color:#fff;">请拖动图片到此处</p></div>').css({
								position:'absolute',
								backgroundColor:'rgb(168, 168, 168)',
								color:'#fff',
								textAlign:'center',
								left:eleX+'px',
								top:eleY+'px',
								zIndex:eleIndex,
								transform: eleRotate,
								width:eleW+'px',
								'-webkit-mask':!!maskUrl ? 'url('+GLOBAL.reqURL.root+ maskUrl+') no-repeat 50% 50%/100%':'none',
								height:eleH+'px'}).data('boxsize',{w:eleW,h:eleH}).appendTo($tplbox);
						}
					}
				}else{
					eleW = arrLays['Width'];
					eleH = arrLays['Height'];
					eleIndex = arrLays['Index'];
					isPhoto = arrLays['IsPhoto'];
					isRotate = arrLays['IsRotate'];
					eleRotate = 'rotate('+arrLays['Rotate']+'deg)';
					eleX = arrLays['X'];
					eleY = arrLays['Y'];
					src= arrLays['Src'];
					indexV =arrLays['Index'];

					$('<div class="drop-box" data-index="'+indexV+'"><p style="margin-top:25%; color:#fff;">请拖动图片到此处</p></div>').css({
						position:'absolute',
						backgroundColor:'rgb(168, 168, 168)',
						color:'#fff',
						textAlign:'center',
						left:eleX+'px',
						top:eleY+'px',
						zIndex:eleIndex,
						transform: eleRotate,
						width:eleW+'px',
						'-webkit-mask':!!maskUrl ? 'url('+GLOBAL.reqURL.root+ maskUrl+') no-repeat 50% 50%/100%':'none',
						height:eleH+'px'}).data('boxsize',{w:eleW,h:eleH}).appendTo($tplbox);
				}
			}

			//显示当前，隐藏其它
			$('#tpl-edit-box'+$tplsBox.data('currindex')).hide();

			$('#tpl-edit-box'+index).show();
			$tplsBox.data('currindex',index);

			//页码添加选择样式
			if(!$this.hasClass('active'))
				$this.addClass('active');
		});

		$navPageBox.find('button.prev').on('click',function(){
			var currNumLayerIndex = $numLayers.data('currPageNumLayer');
			var $layers = $numLayers.children();
			if(currNumLayerIndex!==0){
				$(this).removeClass('disable');
				$layers.eq(currNumLayerIndex).hide();
				currNumLayerIndex--;
				$numLayers.data('currPageNumLayer',currNumLayerIndex);
				$layers.eq(currNumLayerIndex).show();
			}else{
				$(this).addClass('disable');
			}
		});

		$navPageBox.find('button.next').on('click',function(){
			var currNumLayerIndex = $numLayers.data('currPageNumLayer');
			var $layers = $numLayers.children();
			var len = $layers.length-1;

			if(currNumLayerIndex!==len){
				$(this).removeClass('disable');
				$layers.eq(currNumLayerIndex).hide();
				currNumLayerIndex++;
				$numLayers.data('currPageNumLayer',currNumLayerIndex);
				$layers.eq(currNumLayerIndex).show();
			}else{
				$(this).addClass('disable');
			}
		});
	},
	uploadPic:function(){
		var that = this;
		/* === 图片上传 === */
		var files = [];

		$('#file-image').on('change', getUploadFile);

		//MAIN：开始上传
		function startUpload() {
		    if (files.length) {
		        var file = files.shift();
		        ajaxUpload(file);
		    } else {
		        console.log('所有文件上传完毕！');
		        files.length = 0;
		        //设置照片的定位，以便于pep的事件绑定
		        that.refreshPicListPos();
		        //绑定拖动事件
				that.initDrag();
				//如果超过4张照片就显示操作
				var actions = $('#upload-pic-actions');
				if($('#pic-list-box').children().length>4){
					actions.find('.next').removeAttr('disabled');
					actions.find('.delete').removeAttr('disabled');
				}
				actions.find('.rotate').removeAttr('disabled');

		        //隐藏加载提示
		        $('#loading-box').css('display','none');
		    }
		}

		//获取需要上传的文件 [ 过虑 +GUID 预览 ]
		function getUploadFile() {
		    console.log('选择的文件个数：' + this.files.length);
		    files = [].slice.call(this.files);
		    files = fileFilter(files);//文件过滤
		    addGUID(files);//添加唯一标识
		    files.length && startUpload();
		    this.value='';
		}

		//异步上传
		function ajaxUpload(file) {
		    var pms = '?guid=' + file.guid + '&name=' + encodeURIComponent(GLOBAL.orderInfo.taobao), fileGuid = file.guid;

		    var xhr = new XMLHttpRequest();

		    //进度
		    xhr.upload.addEventListener('progress', uploadProgress, false);
		    //成功
		    xhr.addEventListener('load', function (e) { uploadComplete(e, fileGuid, file.sizeOK); }, false);
		    //开始
		    xhr.addEventListener('loadstart', function(){
		    	//显示加载提示
		    	$('#loading-box').css('display','block');
		    }, false);
		    //失败
		    xhr.addEventListener('error', uploadFailed, false);

		    //上传
		    xhr.open('POST', GLOBAL.reqURL['picSubURL'] + pms, true);
		    var fd = new FormData();
		    fd.append('file', file);
		    xhr.send(fd);
		}
		 
		//给文件添加GUID
		function addGUID(picFiles) {
		    if (picFiles && toString.call(picFiles) === '[object Array]' && picFiles.length) {
		        for (var i = 0, len = picFiles.length; i < len; i += 1) {
		            var guid = Utils.newGuid().ToString("D");
		            picFiles[i].guid = guid;
		        }
		    }
		}

		//文件过滤[大小]
		function fileFilter(picFiles) {
		    var arrFiles = [];
		    for (var i = 0, file; file = picFiles[i]; i++) {
		        if (file.size >= (1024 * 1024 * 100)) {
		            $.msg.tip('您这张' + file.name + '图片过大，应小于100M','#alert-box',4000);
		        } else {
		            arrFiles.push(file);
		        }
		    }
		    return arrFiles;
		}

		//异步上传过程中的回调函数
		function uploadProgress(e) {
		    if (e.lengthComputable) {
		        var percentComplete = e.loaded / e.total;
		        console.log('进度：' + Math.floor(percentComplete * 100) + '%');
		    }
		}
		function uploadComplete(e, fileGuid, sizeOK) {
		    if($('#cart-temp-info')) $('#cart-temp-info').remove();
		    var sizeStr = e.target.responseText;
		    if (sizeStr.indexOf('|') > 0) {
		        var size = sizeStr.split('|'), 
		        	imgW = size[0], 
		        	imgH = size[1],
		         	$picListBox = $('#pic-list-box'),
		         	tipCls = '';
		        // GLOBAL.ReqURL['imgSrc']+encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/\%/g,'_') +'/x_'+ fileGuid +'.jpg
		        
		        //判断像素是否合格
		        switch(Utils.checkPicZize(PRO_INFO.width, PRO_INFO.height, imgW, imgH)){
		        	case 0: tipCls = 'warn'; break;
		        	case 1: tipCls = ''; break;
		        	case -1: tipCls = 'error'; break;
		        };

		        $('<li id="list'+fileGuid+'"></li>').css({
		        	// 'background-image':'url('+GLOBAL.reqURL['imgSrc']+GLOBAL.orderInfo.taobao +'/x_'+ fileGuid +')',
		        	'background-image':'url('+GLOBAL.reqURL['imgSrc']+encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/\%/g,'_') +'/x_'+ fileGuid +'.jpg)',
		        }).data('size',{w:imgW,h:imgH}).append('<span class="'+tipCls+'"></span>').appendTo($picListBox);

		        //添加页码标识，如果图片超过4张，便于分页显示
		        $picListBox.data('currPage',0);

		        //将文件信息记录到对象PhotoObj中
		        var oPic = new GLOBAL.Photo({
		            guid: fileGuid,
		            state: 1,
		            goods: GLOBAL.orderInfo.tplID,
		            number: 1,
		            imageWidth: size[0],
		            imageHeight: size[1],
		            length: 11,
		            orderID:GLOBAL.orderInfo.orderID,
		            rotate:0
		        });

		        GLOBAL.photos[fileGuid] = oPic;
		        GLOBAL.photos.length = (GLOBAL.photos.length || 0) + 1;
		        console.log(GLOBAL.photos);

		    } else {
		        $.msg.tip('请检查旺旺名称，文件上传失败 :(','#alert-box',4000);
		    }
		    startUpload();      //继续上传 未上传的文件
		}
		function uploadFailed(e) {
		    //显示加载提示
		    $('#loading-box').css('display','none');
		    $.msg.tip('文件上传出错: ' + e.target.error,'#alert-box',4000,'red');
		}
	},
	refreshPicListPos:function(){
		//设置照片的定位，以便于pep的事件绑定
		var i=0;
        $('#pic-list-box li:visible').each(function(){
        	$(this).css({
        		top:'4px',
        		left:(i*70+3)+'px'
        	});
        	i++;
        });
	},
	picListActionEV:function(){
		var $picListBox = $('#pic-list-box'),
			$picActionsBox = $('#upload-pic-actions')
			self = this;

		$picActionsBox.find('.prev').on('click',function(){
			var currPage = $picListBox.data('currPage'),$picList = $picListBox.children();
			if(currPage===0) return false;
			currPage--;
			var start = currPage*4,end = (currPage+1)*4;
			$picList.hide().slice(start,end).show();

			Utils.debounce(function(){self.refreshPicListPos();},300)();
			
			if(currPage===0) $(this).attr('disabled','disabled')
			$(this).siblings().removeAttr('disabled');

			$picListBox.data('currPage',currPage);
		});
		$picActionsBox.find('.next').on('click',function(){
			var currPage = $picListBox.data('currPage'),$picList = $picListBox.children();
			if((currPage+1)*4>=$picList.length) return false;
			currPage++;
			var start = currPage*4,end = (currPage+1)*4;
			$picList.hide().slice(start,end).show();

			Utils.debounce(function(){self.refreshPicListPos();},300)();

			$picListBox.data('currPage',currPage);
			if((currPage+1)*4>=$picList.length) $(this).attr('disabled','disabled')
			$(this).siblings().removeAttr('disabled');
		});
		$picActionsBox.find('.delete').on('click',function(){
			if(window.confirm('确认清空所有已经上传的照片吗？')){
				$picListBox.html('<li id="cart-temp-info" class="c-888 f30">请上传您的相片！</li>');
				$picActionsBox.hide();
			}
		});
		$picActionsBox.find('.rotate').on('click',function(){

			//找到上传预览图，进行旋转
			//获取原来的角度，在原来的角度上加90度
			var $cPic = $('#pic-list-box').find('.actived');

			//判断是否选择图片
			if(!($cPic && $cPic.length)) return false;

			//获取文件名
			var fileGuid = $cPic.attr('id').substring(4),newDeg=0;

			if(GLOBAL.photos[fileGuid].rotate){
				newDeg= GLOBAL.photos[fileGuid].rotate +90;
				$cPic.css('-webkit-transform','rotate('+newDeg+'deg)');
			}else{
				$cPic.css('-webkit-transform','rotate(90deg)');
				newDeg=90;
			}
			GLOBAL.photos[fileGuid].rotate=newDeg;
		});
	},
	initDrag:function(){
		var that =this,o=this.options;
        $('#pic-list-box li').pep({
			constrainTo: '#view-page-cart',
			droppable: '.drop-box',
			droppableActiveClass:'pep-dpa',
			overlapFunction: false,
			useCSSTranslation: false,
			revert:true,
			revertIf: function(ev, obj){
				return !this.activeDropRegions.length;
			},
			start: function(ev, obj){ 
				obj.noCenter = false;
				obj.$el.css('z-index',999);
			},
			drag:function(ev,obj){
				// console.log(obj.$el.offset().left,obj.$el.offset().top);
			},
			rest: function(ev, obj){//拖到指定位置后的回调函数
				if ( obj.activeDropRegions.length > 0 ) {
					var $li = $(obj.el);
					var url = $li.css('background-image');//图片地址包含url(...)
					var size = $li.data('size');//图片大小
					var imgId = $li.prop('id').substring(4);
					var picRotate = GLOBAL.photos[imgId].rotate;

					url = url.substring(4,url.length-1);

					//恢复图片到原始位置
					obj.revert();

					//图片拖动到的盒子
					var $dropBox=$(obj.activeDropRegions[obj.activeDropRegions.length-1]),
						layerIndex = $dropBox.data('index');

					//缩放图片至盒子大小添加到盒子中
					var mark = Math.random().toString('16').substring(2,5);//生成三位随机数，用于几张相同的图片
					$dropBox.html('').css({'overflow':'hidden'});
					var boxsize = $dropBox.data('boxsize');

					//判断是否需要要旋转
					var res = that.autoScaleImg(boxsize.w,boxsize.h,size.w,size.h, picRotate);

					$('<img id="i'+imgId+mark+'" src="'+url+'" class="" alt="" width="'+size.w+'" height="'+size.h+'"/>').css({width:res.w,
						height:res.h,
						'-webkit-transform':'rotate('+res.rotateDeg+'deg)'
					}).appendTo($dropBox);

					//获取模板的页码
					var pageNum = $dropBox.parents('.tpl-edit-box').prop('id').replace('tpl-edit-box','');

					//将照片信息存储到imgPosInfo中   参数：[i-第几页-第几层]
					o.imgPosInfo['i-'+ pageNum +'-'+ layerIndex]={
						Src:encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/%/g,'_')+'/'+ imgId+'.jpg',
						// Src:GLOBAL.orderInfo.taobao+'/'+ imgId+'.jpg',
						ImageX:0,
						ImageY:0,
						ImageWidth:parseInt(res.w, 10),
						ImageHeight:parseInt(res.h, 10),
						BaseWidth:parseInt(size.w, 10),
						BaseHeight:parseInt(size.h, 10),
						Rotate:res.rotateDeg
					};

					var len=0;
					for(var i in o.imgPosInfo) len+=1;
					o.imgPosInfo.length=len;

					var $parent = $dropBox,pT=$parent.offset().top,pL = $parent.offset().left;

					//绑定拖拽事件图片，限定左右或上下拖动
					var maxMoveLength = res.cmx ? res.w-boxsize.w: res.h-boxsize.h;
					console.log('最大拖动距离：'+maxMoveLength);

					$('#i'+imgId+mark).pep({
						isBoxZoom:true,
				    	seCSSTranslation:false,
				    	axis: res.cmx?'x':'y',
				    	revert:true,
						drag:function(ev, obj){},
						revertAfter:'stop',
						revertIf: function(){ //限制边界
							var matrix = this.$el.css('transform');
							if(matrix){
								var pos = matrix.substring(7,matrix.length-1).replace(/\s+/g,'').split(',');
								if(res.cmx){
									if(pos[4]>0 || Math.abs(pos[4])>maxMoveLength)
										return true;
								}else{
									if(pos[5]>0 || Math.abs(pos[5])>maxMoveLength)
										return true;
								}
							}
						},
						stop:function(ev, obj){
							//图片的坐标：从css的transform中的matrix矩阵中取
							var matrix = obj.$el.css('transform');
							if(matrix){
								var pos = matrix.substring(7,matrix.length-1).replace(/\s+/g,'').split(',');
								o.imgPosInfo['i-'+ pageNum+'-'+layerIndex].ImageX = parseInt(pos[4], 10);
								o.imgPosInfo['i-'+ pageNum+'-'+layerIndex].ImageY =  parseInt(pos[5], 10);
							}else{
								o.imgPosInfo['i-'+ pageNum+'-'+layerIndex].ImageX=o.imgPosInfo['i-'+layerIndex].ImageY=0;
							}
							console.log(o.imgPosInfo);
						}
					});
				}
          	}
        });
	},
	reChoiceTplEv:function(){
		$('#reChoiceTpl').on('click',function(){
			$.pageTransition.prevPage($('#view-page-cart'));
		});
	},
	autoScaleImg:function(boxW, boxH, imgW, imgH, rotateDeg) {
		var newSize={w:0,h:0,cmx:false,rotateDeg:0}; //缩放后的图片大小和是否可以左右移动
	   	
	   	//判断图片旋转后的长宽是否变化
	   	if(rotateDeg && rotateDeg/90%2!=0){//长宽已经改变, 交换长和宽
	   		var t = imgW+imgH;
	   		imgW = t-imgW;
	   		imgH = t-imgH;
	   	}
		newSize.rotateDeg = rotateDeg>360?rotateDeg%360:rotateDeg;

		if(imgW/imgH > boxW/boxH){ //按高缩放
			newSize.h = boxH;
   			newSize.w = imgW*boxH/imgH;
   			newSize.cmx = true;
		}else{  				 //按宽缩放
			newSize.w = boxW;
			newSize.h = imgH*boxW/imgW;
		}

	   return newSize;
	},
	editUserEv:function(){
        var $editDia = $('#dialog-editTB');

        $('#cart-taobao').on('click',function(){
            $editDia.addClass('active');
            var $whichModal = $editDia.find('section.modal');
            $whichModal.css({ "display": "block" });
            setTimeout(function () { $whichModal.addClass('modal-in'); }, 100);
            $('#txt_editTB').val(GLOBAL.orderInfo.taobao).focus();
        });

        $editDia.find('.btn-cancel').on('click',function(){
            modalHidden($editDia);
        });

        $editDia.find('.btn-primary').on('click',function(){
            var name = $.trim($('#txt_editTB').val());
           if(name !== ''){
                GLOBAL.orderInfo.taobao =name;
                Utils.setCookie('taobao',name,30);
                //更新每个页面的旺旺名：
                $('#cart-taobao').text(name);
                modalHidden($editDia);
           }else{
                $('#txt_editTB').addClass('ipt-error flash-anim');
           }
        });

        $editDia.click(function (e) {
            if (e.target.classList.contains('overlay')) {
                modalHidden($editDia);
            }
        });
    },
    buildSubData:function(){
    	var o = this.options;
    	var xmlData = this.options.tplXMLData, imgsInfo = this.options.imgPosInfo;

    	var models = xmlData.Pages.PageModel;

    	//判断是数组还是对象
    	//如果是数组：
    	var i=0, len=models.length,tempXMl='',layerModels;

    	//将Pages 下面的PageModel 如果是对象则变成数组
		if(!Utils.isArray(models)){
    		var t = models;
    		models=[];
    		models.push(t);
    	}

    	len = models.length;
		for(; i<len; i+=1){
			layerModels=models[i]['Layers']['LayerModel'];

			if(Utils.isArray(layerModels)){
				for(var j=0, c=layerModels.length; j<c; j+=1){
					if(layerModels[j]['IsPhoto']=='true'){
						var index = layerModels[j]['Index'];
						if(!imgsInfo['i-'+i+'-'+index]){
							$.msg.tip('模板第 '+(i+1)+' 页未添加照片！','#alert-box',4000,'yellow'); 
							return false;
							// continue;
						}
						layerModels[j]['Src'] = imgsInfo['i-'+i+'-'+index]['Src'];
						layerModels[j]['Type'] = 'photo';
						layerModels[j]['ImageX'] = imgsInfo['i-'+i+'-'+index]['ImageX'];
						layerModels[j]['ImageY'] = imgsInfo['i-'+i+'-'+index]['ImageY'];
						layerModels[j]['ImageWidth'] = imgsInfo['i-'+i+'-'+index]['ImageWidth'];
						layerModels[j]['ImageHeight'] = imgsInfo['i-'+i+'-'+index]['ImageHeight'];
						layerModels[j]['BaseWidth'] = imgsInfo['i-'+i+'-'+index]['BaseWidth'];
						layerModels[j]['BaseHeight'] = imgsInfo['i-'+i+'-'+index]['BaseHeight'];
						layerModels[j]['Rotate'] = imgsInfo['i-'+i+'-'+index]['Rotate'];
					}else if(layerModels[j]['IsText']){
						layerModels[j]['Type'] = 'text';
					}else{
						layerModels[j]['Type'] = 'icon';
					}
				}
			}else{
				//如果LayerModel不是数组，则变成数组，方便添加文字层
				var t =layerModels;
				models[i]['Layers']['LayerModel']=[];
				models[i]['Layers']['LayerModel'].push(layerModels);
				var newLayerModels=models[i]['Layers']['LayerModel'];
					if(newLayerModels[0]['IsPhoto']==='true'){
						var index = newLayerModels[0]['Index'];
						if(!imgsInfo['i-'+i+'-'+index]){
							$.msg.tip('模板第 '+(i+1)+' 页未添加照片！','#alert-box',4000,'yellow'); 
							return false;
							// continue;
						}
						newLayerModels[0]['Src'] = imgsInfo['i-'+i+'-'+index]['Src'];
						newLayerModels[0]['Type'] = 'photo';
						newLayerModels[0]['ImageX'] = imgsInfo['i-'+i+'-'+index]['ImageX'];
						newLayerModels[0]['ImageY'] = imgsInfo['i-'+i+'-'+index]['ImageY'];
						newLayerModels[0]['ImageWidth'] = imgsInfo['i-'+i+'-'+index]['ImageWidth'];
						newLayerModels[0]['ImageHeight'] = imgsInfo['i-'+i+'-'+index]['ImageHeight'];
						newLayerModels[0]['BaseWidth'] = imgsInfo['i-'+i+'-'+index]['BaseWidth'];
						newLayerModels[0]['BaseHeight'] = imgsInfo['i-'+i+'-'+index]['BaseHeight'];
						newLayerModels[0]['Rotate'] = imgsInfo['i-'+i+'-'+index]['Rotate'];
					}else if(layerModels[0]['IsText']){
						layerModels[0]['Type'] = 'text';
					}else{
						layerModels[0]['Type'] = 'icon';
					}
			}

			//添加文字层的数据
			if(o.textLayerInfo.length){
				for(var k in o.textLayerInfo){
					if(i== k.substring(k.indexOf('-')+1,k.lastIndexOf('-')))
					layerModels.push(o.textLayerInfo[k]);
				}
			}

		}

    	console.log(layerModels);

    	var pms='<Product>'+GLOBAL.orderInfo.proID+'</Product><ModelID>'+GLOBAL.orderInfo.tplID+'</ModelID><Param></Param>';

    	tempXMl= "<Book>" +Utils.objectToXml(xmlData)+pms+'</Book>';
		console.log(tempXMl);

    	//获取数据，拼接数据
        var subData = {
            'name': 'mobile',
            'taobao': GLOBAL.orderInfo.taobao,
            'order': encodeURIComponent(tempXMl),
            'editID': '',
            'editUrl': GLOBAL.orderInfo.editUrl
        };
    	return subData;
    },
    subOrderEv:function(){
    	var self=this, o=this.options;
    	$('#sub-order-btn').on('click',function(){

    		//模板是否添加了图片
       		if($('.drop-box img').length!=$('.drop-box').length){
				$.msg.tip('请给模板添加照片！','#alert-box',4000,'red'); 
				return false;
			}

			var $this = $(this);
            if($.trim($this.text())!='提交作品') return false;

    		//异步提交数据
    		var data = self.buildSubData();
    		if(!data) return false;

    		$this.html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 提交中');
    		$.post(GLOBAL.reqURL.orderSubURL,data,function(data){
    			console.log(data);
    			// 判断是否提交成功
    			if(data.indexOf('|')>0){
    				var href = window.location.href;
    				$('#page-subResult').removeClass('out').addClass('in').find('.editeUrl')
    				.text(href.substring(0,href.indexOf('?')+1)+'id='+data.split('|')[1]);
    				self.resetCartList();
		    		self.resetOrderInfo();
		    		Page.index.init();
					// $.pageTransition.prevPage($('#view-page-cart'));
    			}else{
    				$.msg.tip('订单提交失败：'+data.substring(0,20),'#alert-box',4000,'red');
    			}
    			 $this.html('提交作品');
    		});

    		return false;
    	});
    },
    resetCartList:function(){
    	//还原页码效果
    	$('#pic-list-box').html('<li id="cart-temp-info" class="c-888 f30">请上传您的相片！</li>')

    	$('#tpls-box').find('.txtImg').remove();
    	this.options.textLayerInfo={};
    	this.options.imgPosInfo=[];

    	//清空模板中的图片和文字层
    	$('.drop-box').html('').html('<p style="margin-top:25%; color:#fff;">请拖动图片到此处</p>');
    	var tplNavNumBox = $('#tpl-navpage');
    	tplNavNumBox.find('a:not(:first)').removeClass('active');
    	tplNavNumBox.find('.pagenum div').hide().first().show();
    	$('#upload-pic-actions').find('button:not(:last)').attr('disabled','disabled');
    },
    resetOrderInfo:function(){
    	var taobao = GLOBAL.orderInfo.taobao;
    	GLOBAL.orderInfo = $.extend({},GLOBAL.orderInfo_temp);

    	GLOBAL.orderInfo.taobao = taobao;
    	GLOBAL.orderInfo.orderID = Utils.newGuid().ToString('D');
    	GLOBAL.orderInfo.isNew = true;
    },
    popupAddTextEv:function(){
    	var o = this.options,scaleSize=20;
    	var txtInfo={
    		str:'',
    		v:0,
    		scale:1,
    		color:'000000',
    		fontname:encodeURIComponent('微软雅黑'),
    		size:0
    	};

    	var txtInfo_t = $.extend({},txtInfo);

    	//滑杆控件 初始化
    	var rangeCom = new Powerange($('#size-range .js-step')[0],{step:2,min:8,max:50,start:20, hideRange: true});
    	console.log(rangeCom);

    	document.getElementById('txt-result').addEventListener('touchmove',function(e){ e.preventDefault()},false);
    	//添加文字 按钮 事件
    	$('#addTxt').on('click',function(){
    		$('#popup-addtxt').addClass('active');
    		if(!o.ttfPicList.length){
	    		//将求字体预览图片
				$.ajax({
					url:GLOBAL.reqURL.proxyURL,
					data:{url:GLOBAL.reqURL.ttfURL},
					async:false,
					type:'POST',
					success:function(data){
					 var jsonData = $.xml2json(data);
					 // console.log(jsonData);

					 var temp = [];
					 if(jsonData.font.length){
					 	// 
					 	for(var i=0,len=jsonData.font.length; i<len; i+=1){
					 		temp.push('<li class="ttf-pic" data-ttfid="'+jsonData.font[i]['id']+'" id="t-'+jsonData.font[i]['id']+'"><img src="'+jsonData.font[i]['picurl']+'" alt="'+jsonData.font[i]['fontname']+'"></li>');
					 	}
					 	
					 	var s=0;
					 	for(var j=0,len=temp.length; j<len; j+=1){
					 		if((j+1)%6===0){
					 			o.ttfPicList[(j+1)/6-1]={
					 				'content':'<ul class="ttf-item">'+temp.slice(s,j+1).join('')+'</ul>'
					 			};
					 			s=j+1;
					 		}else if(j=== temp.length-1 &&　j%6!==0){
					 			o.ttfPicList.push({
					 				'content':'<ul class="ttf-item">'+temp.slice(s).join('')+'</ul>'
					 			});
					 		}
					 	}

					 	console.log(o.ttfPicList);
					 }
				}});
		    	var dottyHmtl=[];
				for(var k=0,len=o.ttfPicList.length; k<len; k+=1){
					dottyHmtl.push('<span></span>');
				}
				$('#nav-dotty').html(dottyHmtl.join(''));
				var tabs = document.getElementById('nav-dotty').children;
				tabs[0].style.background = '#0e90d2';
				
				Utils.debounce(function(){
					//设置字体预览外框的宽度
					var $ttfbox =$('#ttf-pic-list'),
						ttfboxH = (document.body.clientHeight - $ttfbox.offset().top - 30) +'px'; 
					$ttfbox.css('height',ttfboxH);
		    		//初始化滑动组件
					var islider = new iSlider({
					    data: o.ttfPicList,
					    type: 'dom',
					    dom: document.getElementById("ttf-pic-list"),
					    duration: 2000,
					    isVertical: false,
					    isLooping: true,
					    isDebug: false,
					    isAutoplay: false,
					    onslidechange: function(idx){
					   		for(i = 0; i < tabs.length; i++){
					   			if (i == idx){
					   				tabs[i].style.background = '#0e90d2';
					   			}
					   			else{
					   				tabs[i].style.backgroundColor = '#666';
					   			}
					   		}
					   	}
					});
				},300)();
			}

			//还原popup的界面，清空用户输入
			initPopupView('添加文字','添加到模板','000000',20,'微软雅黑',0,false);
    	});

		//选择字体 显示字体名称的事件
		$('#ttf-pic-list').on('click','li.ttf-pic',function(){
			var $this = $(this);
			var ttfId = $this.data('ttfid');
			var text = $this.children().first().prop('alt');
			var lastId = $('#ttf-pic-list').data('currSelectedId');
			$('#ttf-pic-list').data('currSelectedId','t-'+ttfId);

			//添加选中样式，设置文字到按钮
			if(lastId) $('#'+lastId).css('border-color','#ccc');
			$this.css('border-color','#007AFF');
			$('#ttf-name').text(text);
		})
		
		//range 控件，获取字体大小，并设置
		$('#range-font-size').on('change',function(){
			var size = $(this).val();
			$('#ttf-size').text(size);
			txtInfo.size = Math.round(size/o.currPageScale);
			scaleSize=size;
		});

		//color 控件，获取颜色
		$('#ttf-color').on('click',function(){
			var that= this,currColor = $(this).css('backgroundColor');
			currColor = Utils.rgbToHex(currColor);
			console.log(currColor);
			$('#picker-box').colorPicker({
				colorBgSrc:'/images/colorwheel.png',
				currColor:currColor,
				onConfirm:function(val){
					$('#txt-info').css('color',val);
					txtInfo.color=val.substring(1);
					$(that).css('background-color',val);
				}
			});
		});

		//生成 预览图
		$('#btn-createTxt').on('click',function(){
			$('#txt-result').hide();
			//获取输入：
			var txt = $.trim($('#txt-info').val());
			if(txt==''){
				$.msg.tip('文字输入不能为空！','#alert-box',4000); return false;
			}
			txtInfo.str= encodeURIComponent(txt);
			txtInfo.fontname = encodeURIComponent($('#ttf-name').text());

			var url = GLOBAL.reqURL.getFontPicURL + Utils.objectToUrlpms(txtInfo)+'&r='+Math.random().toString().substring(3,6);
			console.log(url);

			//将地址添加到img标签中，预览
			$('#progressbar-img').show().addClass('active');//进度条
			
			$('#txt-preimg').attr('src',url).off().load(function(){
				console.log('img: '+this.width+','+this.height);
				$('#progressbar-img').hide().removeClass('active');

					// 直接添加到模板中间
					// 还原页面，关闭对话框
					var $srcImg = $(this);
					var imgUrl = url;
					var imgW = this.width;
					var imgH = this.height;
					var $currPageBox = $('#'+'tpl-edit-box'+o.currPageNum);

					var newTxtId = 't-' + o.currPageNum +'-'+ Math.random().toString().substring(3,5);

					o.textLayerInfo[newTxtId]={
						'IsText':true,
						'Type':'text',
						'Src':decodeURI(txtInfo.str),
						'Width':imgW,
						'Height':imgH,
						'X':0,
						'Y':0,
						'FontSize':txtInfo.size,
						'FontColor':txtInfo.color,
						'FontFamily':decodeURI(txtInfo.fontname),
						'size':scaleSize
					};

					$srcImg.clone().attr('id',newTxtId).addClass('txtImg').appendTo($('#tpl-edit-box'+o.currPageNum)).css({
						'position':'absolute',
						'top':($currPageBox.outerHeight() - o.textLayerInfo[newTxtId]['Height'])/2,
						'left':($currPageBox.outerWidth() - o.textLayerInfo[newTxtId]['Width'])/2,
						'z-index':20
					});

					o.textLayerInfo[newTxtId]['X'] = $('#'+newTxtId).offset().left;
					o.textLayerInfo[newTxtId]['Y'] = $('#'+newTxtId).offset().top;

					o.textLayerInfo = Utils.refreshStringArr(o.textLayerInfo);
					console.log(o.textLayerInfo);

					$('#popup-addtxt').removeClass('active');

					//添加拖动效果
					$('#tpls-box .txtImg').pep({
						useCSSTranslation: false,
						constrainTo:'parent',
						isTextZoom:true,
						shouldPreventDefault: false,
						activeClass:'',
						stop:function(ev,obj){
							var imgid = obj.$el.attr('id');
							o.textLayerInfo[imgid]['X']=obj.$el.position().left;
							o.textLayerInfo[imgid]['Y']=obj.$el.position().top;
							console.log(o.textLayerInfo);
						}
					});

					if($('#btn-createTxt').text()=="确认修改"){
				    	$('#del-currTxt button').trigger('click');//删除之前的文字
				    }
				
			});
		});

		//关闭 事件
		$('#popup-addtxt .popup-hd').find('[data-popup-close]').on('click',function(){
			$('#popup-addtxt').removeClass('active');
		});

		//横向竖向 按钮注册事件
		// $('#text-direction').on('click','button',function(){
		// 	var dec = $(this).data('val');
		// 	$(this).addClass('mui-btn-positive').siblings().removeClass('mui-btn-positive');
		// 	txtInfo.v = dec;
		// });

		//修改: 给文字层双击注册事件
		touch.on('#tpls-box', 'doubletap','.txtImg', function(ev){
		    //初始化界面
		    var $popupBox = $('#popup-addtxt');
		    var txtimgId = $(this).attr('id');//图片id

		    //显示删除按钮
		    $('#del-currTxt').show().data('txtImgId',txtimgId);

		    initPopupView('修改文字','确认修改',o.textLayerInfo[txtimgId]['FontColor'], o.textLayerInfo[txtimgId]['size'],o.textLayerInfo[txtimgId]['FontFamily'],0,true,o.textLayerInfo[txtimgId]['Src']);
		    $popupBox.addClass('active');
		});

		//删除：给按钮注册删除文字层事件
		$('#del-currTxt').on('click','button',function(){
			//获取图片的id，删除对象中的图片信息
			var imgId = $('#del-currTxt').data('txtImgId');
			o.textLayerInfo[imgId]=null;
			o.textLayerInfo = Utils.refreshStringArr(o.textLayerInfo);
			//关闭当前页面
			$('#popup-addtxt').removeClass('active');
			//删除界面上的文字图片
			$('#'+imgId).off().remove();
		});

		//参数:页面标题、添加按钮的文本，颜色值、字体大小、字体名称、方向值、是否显示删除按钮、文本
		function initPopupView(title,actionTxt,color,size,fontFamily,direction,showDel,txt){
			$('#popup-addtxt').find('.popup-title').text(title);
			$('#txt-info').val(txt||'').css({'color':'#'+color});
			$('#txt-result').hide();
			$('#range-font-size').val(size);
			$('#ttf-color').css('background','#'+color);
			$('#ttf-size').text(size);
			$('#ttf-name').text(fontFamily);
			$('#'+$('#ttf-pic-list').data('currSelectedId')).css('border-color','#ccc');
			// $('#text-direction').find('[data-val='+(direction||0)+']').addClass('mui-btn-positive').siblings().removeClass('mui-btn-positive');
			if(showDel){$('#del-currTxt').show()}else{$('#del-currTxt').hide()};
			$('#btn-createTxt').text(actionTxt);
			txtInfo.str = encodeURIComponent(txt||'');
			txtInfo.color = color;
			txtInfo.v = direction || 0;
			txtInfo.fontname = encodeURIComponent(fontFamily);
			txtInfo.size = Math.round(size/o.currPageScale);
		}
    }
}

function modalHidden($modalBox) {
    var $con = $modalBox.find('section.modal');
    $con.removeClass('modal-in');
    $con.css({ "display": "none" });
    $modalBox.removeClass('active');
};


/**
 * [程序主入口]
 */
$(function(){
	$('#index-title').text(PRO_INFO.name+'定制主页');
	/* === 对话框 === */
    var $overlay = $('#dialog-login');
    	$('#index-ok').click(function () {
    	//验证是否选择了模板
    	if(!GLOBAL.orderInfo.tplID) {
    		$.msg.tip('请选择一个模板！','#alert-box',4000,'yellow');
    		return false;
    	}

        //判断是否已经登录(已经输入taobao账号), 跳转到下一页
        if ($.trim(GLOBAL.orderInfo.taobao) !== '') {
            $.pageTransition.nextPage($('#view-page-index'));
            return false;
        }

        var $that = $(this);

        $overlay.addClass('active');
        var $whichModal = $('.' + $(this).data('modal'));
        $whichModal.css({ "display": "block" });
        setTimeout(function () { $whichModal.addClass('modal-in'); }, 100);

        $overlay.find('.btn-cancel').click(function (e) {
            modalHidden($overlay);
            return false;
        });
        $overlay.find('.btn-primary').click(function (e) {
            //获取输入 不能为空
            var uName = $.trim($('#userName').val())
            if (uName !== '') {
                //存入缓存 -> 跳转下一页
                GLOBAL.orderInfo.taobao = uName;
				Utils.setCookie('taobao',uName,30);
                $('#userName').removeClass('ipt-error');
                modalHidden($overlay);
                setTimeout(function () { $.pageTransition.nextPage($('#view-page-index')); }, 110);
                return false;
            } else {
                $('#userName').addClass('ipt-error');
                $('#userName')[0].addEventListener('webkitAnimationEnd',function(){
                	$(this).removeClass('ipt-error');
                },false);
            }
            return false;
        });

        $overlay.click(function (e) {
            if (e.target.classList.contains('overlay')) {
                modalHidden($overlay);
            }
        });
    });
	
	$('#txt_editTB')[0].addEventListener('webkitAnimationEnd',function(){
		$(this).removeClass('ipt-error');
	},false);


    //初始化页面切换组件
    $.pageTransition.defauts.nextHandler = function ($currPage, $nextPage) {
        if ($nextPage.data('role') === 'cart') {
            Page.cart.init();
        } else if ($nextPage.data('role') === 'order') {
            Page.order.init();
        }
    }
    $.pageTransition.init();

    //页面初始化
    Page.preInit();

    //首页初始化
    Page.index.init();
});
