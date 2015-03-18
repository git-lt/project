var GLOBAL = {
	orderInfo:{},
	orderInfo_temp:{},
	subData:{},
	preInit:function(){}
};

var Page={
	preInit:function(){},
	index:{},
	cart:{},
	order:{}
}

Utils = {
    debounce: function (func, wait, immediate) {
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
    newGuid: function (g, len) {
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
    refreshStringArr:function(sArr){	//刷新关联数组的数据，去掉空值，添加length
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
    json2xmlStr:function(jsonData, rootName, xmlVersion){//json数据，根的名称，文档申明
    	
    	var res =[], pro="";
    	res.push(xmlVersion);
    	res.push('<'+rootName+' xmlns:xsi="'+jsonData['xmlns:xsi']+'" xmlns:xsd="'+jsonData['xmlns:xsd']+'" >');


		function buildXMLStr(jsonData,res){
			for(var i in jsonData){
				if(i=='xmlns:xsi'||i=='xmlns:xsd'){
					continue;
				}
				
	    		if(typeof jsonData[i]=='object'){
    				res.push('<'+i+'>');
    					for(var j in jsonData[i]){
    						if(typeof jsonData[i][j]=='object'){
    							if(jsonData[i][j].length){
    								for(var m in jsonData[i][j]){
    									res.push('<'+j+'>');
    									for(var k in jsonData[i][j][m]){
    										if(typeof jsonData[i][j][m][k] == 'object'){
    											arguments.callee(jsonData[i][j][m][k],res);
    										}
    										res.push('<'+k+'>'+jsonData[i][j][m][k]+'</'+k+'>');
    									}
    									res.push('</'+j+'>');
    								}
    							}else{
    								res.push('<'+j+'>');
    								arguments.callee(jsonData[i][j],res);
    								res.push('</'+j+'>');
    							}
    						}else{
    							res.push('<'+j+'>'+jsonData[i][j]+'</'+j+'>');
    						}
    						
    					}
    				res.push('</'+i+'>');
	    		}else{
	    			res.push('<'+i+'>'+jsonData[i]+'</'+i+'>');
	    		}
    		}
		}

		buildXMLStr(jsonData,res);



    	res.push('</'+rootName+'>');

    	return res.join('');
    }
};

GLOBAL.orderInfo = {
		orderID: Utils.newGuid().ToString('D'),    //订单编号
	    proID: 80,      //产品id
	    tplID: null, 	//模板的id
	    tplXmlUrl:'',   
	    tplPicNum:0,	//模板上的照片数量
	    typeName:'', 	//模板名称
	    typeID: null, 	//风格id
	    pageCount:3, 	//每页模板显示的数量
	    currPage:0,
	    pageTotal:0,
	    taobao: window.localStorage.taobao || '',   //旺旺名
	    total: 0,   //照片总数量
	    isNew: true,    //是否为当前订单
	    editUrl:''
}
GLOBAL.reqURL={
	root:'http://api.inguu.com',
	getStyleURL:'http://api.inguu.com/Mould/GetTypeList?typeclass=2',
	getTplsURL:'http://api.inguu.com/Mould/getlist', //?orderid=80&start=1&limit=2&typeid=25
	proxyURL:'/MakeApi/ProxyXml',

	picSubURL: '/MakeApi/UploadFile',
    orderSubURL:'/MakeApi/UploadAlbum',
    imgSrc:'/MakeApi/GetUserPic/'

    // picSub: '/photo/UploadPhoto',
    // orderSub:'/Photo/UploadOrder',
    // imgSrc:'/Temp/'
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
    }
}
GLOBAL.photos=[];

//组件类 - 页面切换
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
					oThis.$downEl.show().html('释放更新');
					oThis.loadingStep=1;
					oThis.isPullUp = false;
					oThis.iScrollObj.refresh();
				}else if(this.y < (this.maxScrollY-20) && oThis.options.canPullUp){
					//上拉刷新
					oThis.$upEl.show().html('释放更新');
					oThis.loadingStep=1;
					oThis.isPullUp = true;
					oThis.iScrollObj.refresh();
				}
			}
		},
		scrollEndEvent:function(oThis){
			if(oThis.loadingStep===1){
				if(oThis.isPullUp &&  oThis.options.canPullUp){
					oThis.$upEl.html('正在加载...');
					oThis.loadingStep=2;
					oThis.options.onPullUp(oThis);
				}else if(oThis.options.canPullDown){
					oThis.$downEl.html('正在加载...');
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
			var options = $.extend({},$.fn.pullRefresh.DEFAULTS,option);
			var $this = $(this);
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
			for (var i = 0; i <3; i++) {
				oThis.upNum++;
				oThis.$list.append('<li>Add row '+oThis.upNum+'</li>');
			};

			oThis.$upEl.html('上拉显示更多...');
			oThis.iScrollObj.refresh();
			oThis.loadingStep = 0;
		},
		onPullDown:function(oThis){
			for (var i = 0; i <3; i++) {
				oThis.downNum++;
				oThis.$list.prepend('<li>Add row '+oThis.downNum+'</li>');
			};

			oThis.$downEl.html('下拉显示更多...');
			oThis.iScrollObj.refresh();
			oThis.loadingStep = 0;
		}
	};

//首页初始化之前的处理
Page.preInit=function(){

	//初始化默认的订单信息
	GLOBAL.orderInfo = {
		orderID: Utils.newGuid().ToString('D'),    //订单编号
	    proID: 80,            //产品id
	    tplID: null,
	    tplXmlUrl:'',
	    typeName:'',
	    typeID: null,
	    pageCount:3,
	    currPage:0,
	    pageTotal:0,
	    taobao: window.localStorage.taobao || '',   //旺旺名
	    total: 0,   //照片总数量
	    isNew: true,    //是否为当前订单
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
		    			var urlPms = '?orderid='+GLOBAL.orderInfo.proID+'&start='+currPage+'&limit='+pageCount+'&typeid='+typeid;
		    			var url = GLOBAL.reqURL.getTplsURL+urlPms;
		    			console.log('更新：'+url);
		    			$.post('/MakeApi/ProxyXml',data,function(res){
							 var jsonData = $.xml2json(res);
					 		 console.log(jsonData);
						});
		    			$.ajax({
		    				url:'/MakeApi/ProxyXml',
		    				type:'POST',
		    				data:{url:url},
		    				success:function(res){
		    					GLOBAL.orderInfo['currPage']=currPage;
		    					var jsonData = $.xml2json(res);

					 		 	//将模板数量存储于按钮上
					 		 	var count = jsonData.count;
					 		 	//将模板信息显示出来
					 		 	if(count>0 && jsonData.mould){
					 		 		var tpls = jsonData.mould, tplsHTML=[];
					 		 		if(tpls.length){
					 		 			for(var j=0, len=tpls.length; j<len; j+=1){
					 		 				tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+'><img src="'+tpls[j]['picurl']+'" alt="模板预览"></li>')
					 		 			}
					 		 		}else{
					 		 			tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+'><img src="'+tpls['picurl']+'" alt="模板预览"></li>')
					 		 		}
					 		 		$tplBox.append(tplsHTML.join(''));
					 		 		Utils.debounce(function(){$tplchkBox.pullRefresh('refresh');},400,false)();
					 		 	}else{
					 		 		alert('没有更多了 :)');
					 		 	}
		    				},
		    				error:function(){
		    					alert('网络错误，数据加载失败！');
		    				}
		    			});
		    		}else{
		    			alert('没有更多了 :)');
		    		}


					var reqPms = '?orderid=25&start=1&limit=2';
					var data = {
						url:'http://api.inguu.com/Mould/getlist'+reqPms
					};
					$.post('/MakeApi/ProxyXml',data,function(res){
						 var jsonData = $.xml2json(res);
				 		 console.log(jsonData);
					});

					oThis.$upEl.html('上拉显示更多...');
					oThis.iScrollObj.refresh();
					oThis.loadingStep = 0;
				}
		    });
	};

	//点击风格的事件
	var styleClickFn = function(){
		var $this = $(this);

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
    	var url=GLOBAL.reqURL.getTplsURL+'?orderid=80&typeid='+styleid+'&start=0&limit='+GLOBAL.orderInfo.pageCount;
		console.log(url);
    	$.post('/MakeApi/ProxyXml',{url:url},function(res){
	 		var jsonData = $.xml2json(res);
			console.log(jsonData);

			//将模板数量存储于按钮上
			var count = jsonData.count;
			$this.data('total',count);

			GLOBAL.orderInfo['pageTotal'] = count && parseInt(Math.ceil(count/GLOBAL.orderInfo.pageCount));
			console.log(GLOBAL.orderInfo);

			//将模板信息显示出来
			if(count>0){
				var tpls = jsonData.mould, tplsHTML=[];
				if(tpls.length){
					for(var j=0, len=tpls.length; j<len; j+=1){
						tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+'><img src="'+tpls[j]['picurl']+'" alt="模板预览"></li>');
					}
				}else{
					tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+'><img src="'+tpls['picurl']+'" alt="模板预览"></li>');
				}
				

				$tplBox.html(tplsHTML.join(''));
				if(isFisrtScrollInit){
					Utils.debounce(iScrollInit,500,false)();
					isFisrtScrollInit=false;
				}else{
					Utils.debounce(function(){$tplchkBox.pullRefresh('refresh');},400,false)();
				}
			}else{
				$tplBox.html('<p class="mui-text-center c-888 f16">敬请期待...<p>');
				GLOBAL.orderInfo['tplID']=null;
				console.log(GLOBAL.orderInfo);
			}
    	});
	};

	//点击模板的事件
	var tplClickFn = function(){
		var $this =$(this);
		var tplID = $this.data('tplid');

		//添加选中效果
		$tplBox.data('chkedIndex') !== undefined && $tplBox.children().eq($tplBox.data('chkedIndex')).removeClass('active');
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

	//异步获取分类信息
	var data = {url:GLOBAL.reqURL.getStyleURL};
	$.ajax({url:GLOBAL.reqURL.proxyURL,type:'POST',data:data,async:false,success:function(res){
		 var jsonData = $.xml2json(res);
		 console.log(jsonData);
 		 if(jsonData.mouldtype && jsonData.mouldtype.length){
 		 	//获取风格数据
 		 	var styles = jsonData.mouldtype;
 		 	var styleHtml=[];
 		 	for(var i=0,len= styles.length; i<len; i+=1){
 		 		styleHtml.push('<li data-styleid='+styles[i]['id']+'><a href="javascript:void(0)">'+styles[i]['typename']+'</a></li>');
 		 	}
 		 	$styleBox.append(styleHtml.join(''));

 		 	//添加滚动效果
 		    var s_style = new IScroll('#style-wrapper', { 
		    	scrollX: true, 
		    	scrollY: false, 
		    	snap: 'li',
		    	momentum:false,
		    	click:true
		    });

			$styleBox.children().eq(0).trigger('click');
 		 }
	}});

    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    GLOBAL.orderInfo_temp = $.extend({},GLOBAL.orderInfo);

}


Page.index={
	init:function(){}
}

Page.cart={
	options:{
		taobaoBox:$('#cart-taobao'),
		picListBox:$('#pic-list-box'),
		isFirstInit:true,
		currXmlUrl:'',
		tplXMLData:{}, //模板信息
		imgPosInfo:[]  //保存模板上的照片坐标信息
	},
	init:function(){
		var o = this.options;
		if(o.isFirstInit){
			//更新淘宝名称
			o.taobaoBox.text(GLOBAL.orderInfo.taobao);

			//注册上传事件
			this.updatePic();

			this.reChoiceTplEv();

			this.editUserEv();

			this.subOrderEv();

			o.isFirstInit=false;
		}


		//显示对应模板
		this.initTpl();

		//注册拖拽事件
		// this.initDrag();
	},
	addEvents:function(){
	},
	initTpl:function(){
		var that= this,o=this.options;
		if(o.currXmlUrl==GLOBAL.orderInfo.tplXmlUrl) return;
		o.currXmlUrl = GLOBAL.orderInfo.tplXmlUrl;
		$.post(GLOBAL.reqURL.proxyURL,{url:GLOBAL.orderInfo.tplXmlUrl},function(data){
			var res = $.xml2json(data);
			o.tplXMLData = res;
			o.imgPosInfo.length=0;
			console.log(res);

			//模板大小
			var modelWidth = res.ModelWidth,
				modelHeight = res.ModelHeight;
			var pages = res.Pages||{};
			if(!pages) return false;

			// 背景图和文本层
			var back= pages.PageModel.Back,
				textLayers= pages.PageModel.TextLayers;

			//设置背景图片
			var $tplbox = $('#tpl-edit-box')
			var docW = window.screen.width;
			$tplbox.children().remove();
			$tplbox.css({
				'position':'relative',
				'background':'url('+GLOBAL.reqURL.root+back+') no-repeat center center',
				'background-size':'contain',
				'background-clip':'content-box',
				'width':modelWidth,
				'height':modelHeight,
				'zoom':docW/modelWidth
			});

			var arrLays = pages.PageModel.Layers.LayerModel,
			eleW ,eleH ,eleIndex ,isPhoto ,isRotate ,eleRotate ,eleX ,eleY ,src,indexV;
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
						transform: eleRotate
					}).appendTo($tplbox);
				}else{ 	//照片
					$('<div class="drop-box" data-index="'+indexV+'">请拖动图片到此处</div>').css({
						position:'absolute',
						backgroundColor:'rgb(168, 168, 168)',
						color:'#fff',
						fontSize:'100px',
						textAlign:'center',
						lineHeight:eleH+'px',
						left:eleX+'px',
						top:eleY+'px',
						zIndex:eleIndex,
						transform: eleRotate,
						width:eleW+'px',
						height:eleH+'px'}).appendTo($tplbox);
				}
			}
		});
	},
	updatePic:function(){
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
		        $('#pic-list-box li').each(function(){
		        	var index = $(this).index();
		        	$(this).css({
		        		top:'4px',
		        		left:(index*70+3)+'px'
		        	});
		        });
		        //绑定拖动事件
				that.initDrag();

				//添加滚动效果
				if($('#pic-list-box').children().length>4){
		 		    var s_upPics = new IScroll('#upload-pic-box', { 
				    	scrollX: true, 
				    	scrollY: false,
				    	momentum:false,
				    	click:true
				    });
				}

		        // setHandlers();    //绑定操作事件
		        //隐藏加载提示
		        $('#loading-box').css('display','none').removeClass('colorful-pulse');
		    }
		}

		//获取需要上传的文件 [ 过虑 +GUID 预览 ]
		function getUploadFile() {
		    console.log('选择的文件个数：' + this.files.length);
		    files = [].slice.call(this.files);
		    files = fileFilter(files);//文件过滤
		    addGUID(files);//添加唯一标识
		    files.length && startUpload();
		}

		//异步上传
		function ajaxUpload(file) {
		     //显示加载提示
		    $('#loading-box').css('display','block').find('span').css("-webkit-animation-play-state","running");

		    var pms = '?guid=' + file.guid + '&name=' + encodeURIComponent(GLOBAL.orderInfo.taobao), fileGuid = file.guid;
		    console.log(pms);

		    var xhr = new XMLHttpRequest();

		    //进度
		    xhr.upload.addEventListener('progress', uploadProgress, false);
		    //成功
		    xhr.addEventListener('load', function (e) { uploadComplete(e, fileGuid, file.sizeOK); }, false);
		    //开始
		    //xhr.addEventListener('loadstart', uploadStart, false);
		    //失败
		    xhr.addEventListener('error', uploadFailed, false);
		    //取消
		    //xhr.addEventListener('abort', uploadCanceled, false);

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
		            alert('您这张' + file.name + '图片过大，应小于100M');
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
		    console.log('upload Complete: res = ' + e.target.responseText);
		    if($('#cart-temp-info')) $('#cart-temp-info').remove();

		    var sizeStr = e.target.responseText;
		    if (sizeStr.indexOf('|') > 0) {
		        var size = sizeStr.split('|'), imgW = size[0], imgH = size[1];
		        $('<li id="list'+fileGuid+'"></li>').css({
		        	'background-image':'url('+GLOBAL.reqURL['imgSrc']+GLOBAL.orderInfo.taobao +'/x_'+ fileGuid +')',
		        }).data('size',{w:imgW,h:imgH}).appendTo($('#pic-list-box'));
		        
		        //将文件信息记录到对象PhotoObj中
		        var oPic = new GLOBAL.Photo({
		            guid: fileGuid,
		            state: 1,
		            goods: GLOBAL.orderInfo.tplID,
		            number: 1,
		            imageWidth: size[0],
		            imageHeight: size[1],
		            length: 11,
		            orderID:GLOBAL.orderInfo.orderID
		        });

		        GLOBAL.photos[fileGuid] = oPic;
		        GLOBAL.photos.length = (GLOBAL.photos.length || 0) + 1;
		        console.log(GLOBAL.photos);

		    } else {
		        alert('请检查旺旺名称，文件上传失败 :(');
		    }
		    startUpload();      //继续上传 未上传的文件
		}
		function uploadFailed(e) {
		    //显示加载提示
		    $('#loading-box').css('display','none').find('span').css("-webkit-animation-play-state","paused");
		    alert('文件上传出错: ' + e.target.error);
		}
	},
	initDrag:function(){
		var that =this,o=this.options;
        $('#pic-list-box li').pep({
			constrainTo: '#view-page-cart',
			droppable: '.drop-box',
			droppableActiveClass:'pep-dpa',
			activeClass:'pep-active',
			overlapFunction: false,
			useCSSTranslation: false,
			revert:true,
			revertIf: function(ev, obj){
			return !this.activeDropRegions.length;
			},
			start: function(ev, obj){ 
				obj.noCenter = false;
				obj.$el.css('z-index',99);
			},
			rest: function(ev, obj){//拖到指定位置后的回调函数
				if ( obj.activeDropRegions.length > 0 ) {
					var $li = $(obj.el);
					var url = $li.css('background-image');//图片地址包含url(...)
					var size = $li.data('size');//图片大小
					var imgId = $li.prop('id').substring(4);
					url = url.substring(4,url.length-1);

					//恢复图片到原始位置
					obj.revert();

					//图片拖动到的盒子
					var $dropBox=$(obj.activeDropRegions[0]),
						layerIndex = $dropBox.data('index');

					//缩放图片至盒子大小添加到盒子中
					var mark = Math.random().toString('16').substring(2,5);//生成三位随机数，用于几张相同的图片
					$dropBox.html('').css({'overflow':'hidden'});
					var res = that.autoScaleImg($dropBox.outerWidth(),$dropBox.outerHeight(),size.w,size.h);
					$('<img id="i'+imgId+mark+'" src="'+url+'" class="" alt="" width="'+size.w+'" height="'+size.h+'"/>').css({width:res.w,height:res.h}).appendTo($dropBox);

					//将照片信息存储到imgPosInfo中
					o.imgPosInfo['i-'+layerIndex]={
						Src:url,
						ImageX:0,
						ImageY:0,
						ImageWidth:res.w,
						ImageHeight:res.h,
						BaseWidth:size.w,
						BaseHeight:size.h
					};

					var len=0;
					for(var i in o.imgPosInfo) len+=1;
					o.imgPosInfo.length=len;

					var $parent = $dropBox,pT=$parent.offset().top,pL = $parent.offset().left;
					//绑定拖拽事件图片，限定左右或上下拖动
					$('#i'+imgId+mark).pep({
						isBoxZoom:true,
				    	seCSSTranslation:false,
				    	axis: res.cmx?'x':'y',
						drag:function(ev, obj){
							// console.log((obj.$el.offset().left)-pL+','+(obj.$el.offset().top-pT));
							//图片的坐标：
							o.imgPosInfo['i-'+layerIndex].ImageX=Math.abs((obj.$el.offset().left)-pL);
							o.imgPosInfo['i-'+layerIndex].ImageY=Math.abs((obj.$el.offset().top-pT));
							console.log(o.imgPosInfo);
						}
					});
				}
          	}
        });
	},
	initImgScroll:function(){
	},
	reChoiceTplEv:function(){
		$('#reChoiceTpl').on('click',function(){
			$.pageTransition.prevPage($('#view-page-cart'));
		});
	},
	autoScaleImg:function(boxW, boxH, imgW, imgH) {
		var newSize={w:0,h:0,cmx:false}; //缩放后的图片大小和是否可以左右移动
	   	
		if(imgW/imgH>boxW/boxH){ //按高缩放
			newSize.h = boxH;
   			newSize.w = imgW*boxH/imgH;
   			newSize.cmx=true;
		}else{  				 //按宽缩放
			newSize.w=boxW;
			newSize.h=imgH*boxW/imgW;
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
            $('#txt_editTB').val(window.localStorage.taobao).focus();
        });

        $editDia.find('.btn-cancel').on('click',function(){
            modalHidden($editDia);
        });

        $editDia.find('.btn-primary').on('click',function(){
            var name = $.trim($('#txt_editTB').val());
           if(name!==''){
                GLOBAL.orderInfo.taobao = window.localStorage.taobao=name;
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
    	var xmlData = this.options.tplXMLData, imgsInfo = this.options.imgPosInfo;

    	var layerModels = xmlData.Pages.PageModel.Layers.LayerModel;

    	var i=0, len=layerModels.length,tempXMl='';
    	for(; i<len; i+=1){
    		if(layerModels[i]['IsPhoto']=='true'){
    			var i = layerModels[i]['Index'];
    			layerModels[i]['Src'] = imgsInfo['i-'+i]['Src'];
    			layerModels[i]['ImageX'] = imgsInfo['i-'+i]['ImageX'];
    			layerModels[i]['ImageY'] = imgsInfo['i-'+i]['ImageY'];
    			layerModels[i]['ImageWidth'] = imgsInfo['i-'+i]['ImageWidth'];
    			layerModels[i]['ImageHeight'] = imgsInfo['i-'+i]['ImageHeight'];
    			layerModels[i]['BaseWidth'] = imgsInfo['i-'+i]['BaseWidth'];
    			layerModels[i]['BaseHeight'] = imgsInfo['i-'+i]['BaseHeight'];
    		}
    	}

		tempXMl=Utils.json2xmlStr(xmlData,'Book','<?xml version="1.0" encoding="utf-8"?>');
		console.log(tempXMl);

    	//获取数据，拼接数据
        var subData = {
            'name': GLOBAL.orderInfo.typeName,
            'taobao': GLOBAL.orderInfo.taobao,
            'order': encodeURIComponent(tempXMl),
            'editID': '',
            'editUrl': GLOBAL.orderInfo.editUrl
        };
    	return subData;
    },
    subOrderEv:function(){
		if($('.drop-box img').length!=$('.drop-box').length){
			alert('请给模板添加照片！'); return false;
		}
    	var self=this, o=this.options;
    	$('#sub-order-btn').on('click',function(){
    		//异步提交数据
    		var data = self.buildSubData();
    		$.post(GLOBAL.reqURL.orderSubURL,data,function(data){
    			console.log(data);
    			// 判断是否提交成功
    			// if(){}else{}
	    		//提交成功后， reset所有数据
	    		// self.resetCartList();
	    		// self.resetOrderInfo();
				// $.pageTransition.nextPage($('#view-page-cart'));
    		});

    		return false;
    	});
    },
    resetCartList:function(){
    	$('#pic-list-box').html('<li id="cart-temp-info" class="c-888 f30">请上传您的相片！</li>');
    },
    resetOrderInfo:function(){
    	var taobao = GLOBAL.orderInfo.taobao;
    	GLOBAL.orderInfo = $.extend({},GLOBAL.orderInfo_temp);

    	GLOBAL.orderInfo.taobao = taobao;
    	GLOBAL.orderInfo.orderID = Utils.newGuid().ToString('D');
    	GLOBAL.orderInfo.isNew = true;
    }
}


Page.order={
	options:{
		isFirstInit:true,
		orderData:[], 	//orderID:{styleName:'',tplNum:0,picCount:0}
		subData:{}
	},
	init:function(){
		var o=this.options,self=this;
		if(o.isFirstInit){
			this.editUserEv();
			this.subOrderEv();
			this.addMoreEv();
			this.delOrderEv();
			o.isFirstInit=false;
		}else{

		}

		//判断是当前订单信息是否是新的订单
		o.orderData[GLOBAL.orderInfo.orderID] = {styleName:GLOBAL.orderInfo.typeName,tplNum:GLOBAL.orderInfo.tplID,picCount:$('.drop-box img').length};
		o.orderData = Utils.refreshStringArr(o.orderData);
		console.log(o.orderData);

		//显示数据	
		self.renderOrder();
	},
	renderOrder:function(){
		var orderHtml = [],o=this.options;
		if(!o.orderData.length) return;
		//清空列表
		$('#order-list-ul>li').nextAll().remove();

		//显示订单信息
		for(var j in o.orderData){
			orderHtml.push('<ul class="pb05em pt05em order-item-ul" data-orderid="i'+j+'"><li class="style">风格：<b>'+o.orderData[j]['styleName']+'</b></li>');
			orderHtml.push('<li class="tpl">模板编号：<b>'+o.orderData[j]['tplNum']+'</b></li>');
			orderHtml.push('<li class="num"><span>照片数量：<b>'+o.orderData[j]['picCount']+'</b>张</span> <a class="mui-inline mui-pull-right mr1em" href="javascript:void(0)">删除</a>');
			orderHtml.push('</li></ul>');
		}
		$('#order-list-ul').append(orderHtml.join(''));
	},
	editUserEv:function(){
        var $editDia = $('#dialog-editTB');
        $('#order-taobao').text(GLOBAL.orderInfo.taobao);
        $('#btn-editTB').on('click',function(){
            $editDia.addClass('active');
            var $whichModal = $editDia.find('section.modal');
            $whichModal.css({ "display": "block" });
            setTimeout(function () { $whichModal.addClass('modal-in'); }, 100);
            $('#txt_editTB').val(window.localStorage.taobao).focus();
        });

        $editDia.find('.btn-cancel').on('click',function(){
            modalHidden($editDia);
        });

        $editDia.find('.btn-primary').on('click',function(){
            var name = $.trim($('#txt_editTB').val());
           if(name!==''){
                GLOBAL.orderInfo.taobao = window.localStorage.taobao=name;
                //更新每个页面的旺旺名：
                $('#cart-taobao').text(name);
                $('#order-taobao').text(GLOBAL.orderInfo.taobao);
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
    buildSubData:function(tplXMLData,imgPosInfo){
    	//获取数据，拼接数据
        var temp = [];
        // temp.push('<photos><mobile></mobile>');
        // for (var i in photos) {
        //     if(!photos[i]) continue;
        //     temp.push('<photo>');
        //     temp.push('<guid>' + i + '</guid>');
        //     temp.push('<state>' + photos[i]['state'] + '</state>');
        //     if(photos[i]['state']===1){
        //         temp.push('<x>' + photos[i]['x'] + '</x>');
        //         temp.push('<y>' + photos[i]['y'] + '</y>');
        //         temp.push('<width>' + photos[i]['width'] + '</width>');
        //         temp.push('<height>' + photos[i]['height'] + '</height>');
        //     }
        //     temp.push('<param>' + photos[i]['param'] + '</param>');
        //     temp.push('<goods>' + photos[i]['goods'] + '</goods>');
        //     temp.push('<number>' + photos[i]['number'] + '</number>');
        //     temp.push('<imageWidth>' + photos[i]['imageWidth'] + '</imageWidth>');
        //     temp.push('<imageHeight>' + photos[i]['imageHeight'] + '</imageHeight>');
        //     temp.push('</photo>');
        // }
        // temp.push('</photos>');

        temp = temp.join('');
        console.log(temp);
        temp = encodeURIComponent(temp);

        subData = {
            'name': GLOBAL.orderInfo.typeName,
            'taobao': GLOBAL.orderInfo.taobao,
            'order': temp,
            'editID': '',
            'editUrl': GLOBAL.orderInfo.editUrl
        };
        return subData;
    },
    subOrderEv:function(){
    	var self=this, o=this.options;
    	$('#subOrder').on('click',function(){
    		if(o.orderData.length==0) { alert('请选择模板创建定单'); return false; }

    		//异步提交数据
    		var data = self.buildSubData(Page.cart.options.tplXMLData,Page.cart.options.imgPosInfo);

    		// $.post('',data,function(){});
    		
    		//提交成功后， reset所有数据
    		self.resetOrderList();
    		self.resetCartList();
    		self.resetOrderInfo();
    	});
    },
    addMoreEv:function(){
    	var o=this.options,self=this;
    	$('#addOrder').on('click',function(){
    		//重置orderInfo
    		self.resetOrderInfo();

    		//回到首页
    		$('section.page').removeClass('page-active page-prev').addClass('page-next').first().removeClass('page-next').addClass('page-active');

    		//清空图片列表
    		self.resetCartList();
    	});
    },
    delOrderEv:function(){
    	var o = this.options,self=this;
    	$('#order-list-ul .num').on('click','a',function(){
    		//弹框确认是否删除
    		if(confirm('是否确认删除该订单？')){
	    		var $ulParent = $(this).parent().parent();
	    		var orderID = $ulParent.data('orderid');
	    		o.orderData[orderID]=null;
	    		self.refreshOrderData(o.orderData);
	    		$('#i'+orderID).remove();

	    		//删除的是否为当前订单
	    		if(orderID==GLOBAL.orderInfo.orderID){
	    			//清空cart中上传的照片列表
	    			self.resetCartList();
	    			self.resetOrderInfo();
	    		}

	    		//订单列表里是否还有订单
	    		if($('#order-list-ul ul').length==0){
	    			self.resetOrderList();
	    		}
    		}
    	});
    },
    refreshOrderData:function(orderData){
    	if(!orderData) return;
    	var t=[],len=0;
    	for(var i in orderData){
    		if(orderData[i]){
    			t[i].push(orderData[i]);
    			len++;
    		}
    	}
    	t.length = len;
    	return t;
    },
    resetCartList:function(){
    	$('#pic-list-box').html('<li id="cart-temp-info" class="c-888 f30">请上传您的相片！</li>');
    },
    resetOrderList:function(){
    	$('#order-list-ul ul').remove().append('<li class="c-888 mui-text-center pt1em pb1em order-temp-tip">暂无订单信息</li>');
    },
    resetOrderInfo:function(){
    	var taobao = GLOBAL.orderInfo.taobao;
    	var orderID= Utils.newGuid().ToString('D');
    	GLOBAL.orderInfo = $.extend({},GLOBAL.orderInfo_temp);
    	GLOBAL.orderInfo.taobao = taobao;
    	GLOBAL.orderInfo.orderID = orderID;
    	GLOBAL.orderInfo.isNew = true;
    }
}



function modalHidden($modalBox) {
    var $con = $modalBox.find('section.modal');
    $con.removeClass('modal-in');
    $con.css({ "display": "none" });
    $modalBox.removeClass('active');
};

$(function(){
	/* === 对话框 === */
    var $overlay = $('#dialog-login');

    $('#index-ok').click(function () {
    	//验证是否选择了模板
        	if(!GLOBAL.orderInfo.tplID) {
        		alert('请选择一个模板！');
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
                window.localStorage.taobao = uName;
                $('#userName').removeClass('ipt-error flash-anim');
                modalHidden($overlay);
                setTimeout(function () { $.pageTransition.nextPage($('#view-page-index')); }, 110);
                return false;
            } else {
                $('#userName').addClass('ipt-error flash-anim');
                $('#userName').on('webkitAnimationEnd', function () {
                    $(this).removeClass('flash-anim');
                });
            }
            return false;
        });

        $overlay.click(function (e) {
            if (e.target.classList.contains('overlay')) {
                modalHidden($overlay);
            }
        });
    });

    //初始化页面切换组件
    $.pageTransition.defauts.nextHandler = function ($currPage, $nextPage) {
        if ($nextPage.data('role') === 'cart') {
            Page.cart.init();
        } else if ($nextPage.data('role') === 'order') {
            Page.order.init();
        }
    }
    $.pageTransition.init();

    Page.preInit();


    // Page.index.addEvents();
    Page.index.init();
});
