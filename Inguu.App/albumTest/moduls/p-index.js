define(function(require, exports, module){
	require('./global');
	require('./utils');

	require('jquery');
	require('jquery.xml2json');
	require('iscroll-probe');
	require('jquery.pullRefresh');
	require('jquery.msg');
	var imgloaded = require('imagesLoaded');

	var pIndex = {},preInit={};
	
	preInit = {
		init:function(){
			this.showGuide();		/*显示引导页页面*/
			this.setFixed();		/*设置fix定位*/
			this.initOrderInfo();	/*初始化orderInfo*/

			$('document').on('touchmove',function(ev){ ev.preventDefault()})
		},
		showGuide:function(){
			var $guidPage = $('#page-guide');
			$guidPage.animate().delay(3500).fadeOut('slow',function(){ $(this).remove(); });

			// if(Utils.getCookie('guidShown')){
			//     $guidPage.hide();
			// }else{
			//     setTimeout(function(){$guidPage.addClass('fadeOut')},4000);
			//     setTimeout(function(){$guidPage.remove();},5000)
			//     Utils.setCookie('guidShown','true');
			// }
		},
		setFixed:function(){
			if(!Utils.isSupportFixed()){
	    		$('footer,header').css('position','absolute');
	    	}
		},
		initOrderInfo:function(){
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
			    editUrl:window.location.href,
			    autoAddPic:false
			}
		}
	};


	pIndex = {
		options:{
			$indexPage: $('#pageIndex'),
			$styleBox : $('#style-chk-box'),
			$tplBox : $('#tpl-list'),
			$tplchkBox : $('#tpl-chk-box'),
			$resBox : $('#choiceInfo'),
			isFirstInit:true,
			isFisrtScrollInit:true
		},
		init:function(){
			//注册关闭事件,提交后的信息页面 -->放到后面的页面
			var o = this.options;
			if(o.isFirstInit){
				this.initStyles();		/*初始化风格信息*/
				this.chkStyleEv();		/*注册点击风格事件*/
				this.chkTplEv();		/*注册点击模板事件*/

			    //存储订单的初始化的信息
	    		GLOBAL.orderInfo_temp = $.extend({},GLOBAL.orderInfo);

	    		// o.$indexPage[0].addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	    		// $('#tpls-box')[0].addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

				o.isFirstInit = false;
			}

			$('#style-chk-box a:first').trigger('click');
		},
		initStyles:function(){
			var data = {url:GLOBAL.reqURL.getStyleURL+'&orderid='+GLOBAL.orderInfo.proID},
				o= this.options, self= this;
			$.ajax({url:GLOBAL.reqURL.proxyURL, type:'POST', data:data, async:false,success:function(res){
				 var jsonData = $.xml2json(res);
				 if(!jsonData || !jsonData.mouldtype) {
				 	o.$styleBox.html('<span class="c-8 pl10 block mt10 mb10 tc"><i class="iconfont f18">&#xe613;</i> 暂无数据！</span>'); return false;
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
		 		 		styleHtml.push('<a href="javascript:void(0)" class="item" data-styleid='+styles[i]['id']+'>'+styles[i]['typename']+'</a>');
		 		 	}
		 		 	o.$styleBox.append(styleHtml.join(''));

		 		 	if(styles.length>3){
		 		 		o.$styleBox.css('width',85*styles.length+10);
		 		 		//添加滚动效果
			 		    var s_style = new IScroll('#style-wrapper', { 
					    	scrollX: true, 
					    	scrollY: false, 
					    	snap: 'a',
					    	momentum:false,
					    	click:true
					    });
		 		 	}

					o.$styleBox.children().eq(0).trigger('click');
		 		 }
			}});
		},
		initIScroll:function(){
			var o = this.options;
			o.$tplchkBox.pullRefresh({
		    	onPullUp:function(oThis){
		    		//获取总页数和当前页面码
		    		var typeid = GLOBAL.orderInfo['typeID'],
		    			currPage = GLOBAL.orderInfo['currPage'],
		    			pageTotal = GLOBAL.orderInfo['pageTotal'],
		    			pageCount = GLOBAL.orderInfo['pageCount'];

		    		if(currPage <= pageTotal){
		    			currPage++;
		    			// var urlPms = '?orderid='+GLOBAL.orderInfo.proID+'&start='+currPage+'&limit='+pageCount+'&typeid='+typeid+'&shop=64';
		    			var urlPms = '?orderid='+GLOBAL.orderInfo.proID+'&start='+currPage+'&limit='+pageCount+'&typeid='+typeid;
		    			var url = GLOBAL.reqURL.getTplsURL+urlPms;
		    			$.ajax({
		    				url:GLOBAL.reqURL.proxyURL,
		    				type:'POST',
		    				data:{url:url}
		    			}).done(function(res){
	    					GLOBAL.orderInfo['currPage']=currPage;
	    					var jsonData = $.xml2json(res);

				 		 	//将模板数量存储于按钮上
				 		 	var count = jsonData.count;

				 		 	//将模板信息显示出来
				 		 	if(count>0 && jsonData.mould){
				 		 		var tpls = jsonData.mould, tplsHTML=[], tplsNum = tpls.length;
				 		 		if(tplsNum){
				 		 			for(var j=0, len=tpls.length; j<len; j+=1){
				 		 				tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+' class="L"><img src="'+tpls[j]['picurl']+'" alt="模板预览" class="I"></li>');
				 		 			}
				 		 		}else{
				 		 			tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+' class="L"><img src="'+tpls['picurl']+'" alt="模板预览" class="I"></li>')
				 		 		}
				 		 		o.$tplBox.append(tplsHTML.join(''));


			 		 			if(tplsNum && tplsNum>=GLOBAL.orderInfo['pageCount']){
		 		 					$('#tpl-list').imagesLoaded(function(){
		 		 						oThis.$upEl.html('<span class="mui-icon mui-icon-arrowthinup"></span> 上拉显示更多...').fadeIn();
		 		 						oThis.iScrollObj.refresh();
		 		 					});
			 		 			}
				 		 	}else{
				 		 		oThis.$upEl.html('没有更多了...');
				 		 	}
		    			}).fail(function(){
		    				oThis.$upEl.html('<span class="mui-icon mui-icon-close"></span> 网络错误，数据加载失败！').fadeIn();
		    			});

		    		}else{
		    			oThis.$upEl.html('没有更多了...').fadeIn();
		    		}
					// oThis.iScrollObj.refresh();
					oThis.loadingStep = 0;
				}
		    });
		},
		chkStyleEv:function(){
			var o = this.options, self = this;
			o.$styleBox.delegate('a','click',function(){
				var $this = $(this),$pullUp=$('#pullUp');
				//隐藏上拉加载，显示加载中
				$pullUp.hide().html('<i class="iconfont">&#xe602;</i> 上拉显示更多...');
				o.$tplBox.html('');
				o.$tplchkBox.append('<div class="tc c-8 center" id="tpls-loading"><img src="/images/loading1.gif" alt="">  加载中···</div>');

		    	$this.addClass('active').siblings().removeClass('active');

		    	//获取styleID
		    	var styleid = $this.data('styleid');

		    	//更新orderInfo
		    	GLOBAL.orderInfo['typeID'] = styleid;
		    	GLOBAL.orderInfo['tplID']=null;
		    	GLOBAL.orderInfo['currPage']=0;
		    	GLOBAL.orderInfo['typeName']=$this.text();
		    	//根据styleID获取风格下的图片，第一次获取5张
		    	// var url=GLOBAL.reqURL.getTplsURL+'?orderid='+GLOBAL.orderInfo.proID+'&typeid='+styleid+'&start=0&limit='+GLOBAL.orderInfo.pageCount+'&shop=64';
		    	var url=GLOBAL.reqURL.getTplsURL+'?orderid='+GLOBAL.orderInfo.proID+'&typeid='+styleid+'&start=0&limit='+GLOBAL.orderInfo.pageCount ;
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
					$('#tpls-loading').remove();

					//将模板信息显示出来
					if(count>0){
						var tpls = jsonData.mould, tplsHTML=[], tplsNum = tpls.length;
						if(tplsNum){
							for(var j=0, len=tpls.length; j<len; j+=1){
								tplsHTML.push('<li data-tplid='+tpls[j]['id']+' data-xmlurl='+tpls[j]['xmlurl']+' class="L"><img src="'+tpls[j]['picurl']+'" alt="模板预览" class="I"></li>');
							}
						}else{
							tplsHTML.push('<li data-tplid='+tpls['id']+' data-xmlurl='+tpls['xmlurl']+' class="L"><img src="'+tpls['picurl']+'" alt="模板预览" class="I"></li>');
							$pullUp.hide();
						}

						o.$tplBox.html(tplsHTML.join('')+'');

						if(tplsNum>=GLOBAL.orderInfo['pageCount']){ $pullUp.show(); }

						if(o.isFisrtScrollInit){
							$('#tpl-list').imagesLoaded(function(){
								self.initIScroll();
								o.isFisrtScrollInit=false;
							});
						}else{
							$('#tpl-list').imagesLoaded(function(){
								o.$tplchkBox.pullRefresh('refresh');
							});
						}
					}else{
						o.$tplBox.html('<p class="tc c-8 f24 center">敬请期待...</p>');
						if(!o.isFisrtScrollInit){
							Utils.debounce(function(){o.$tplchkBox.pullRefresh('refresh');},300,false)();
						}
						$pullUp.hide();
						GLOBAL.orderInfo['tplID']=null;
						console.log(GLOBAL.orderInfo);
					}
				})
				.fail(function(res) {
					o.$tplBox.html('<p class="tc c-8 f24 center"><i class="iconfont f18">&#xe613;</i> 模板加载失败！</p>');
				});


			});
		},
		chkTplEv:function(){
			var o = this.options, self = this;
			o.$tplBox.delegate('li','click',function(){
				var $this =$(this);
				var tplID = $this.data('tplid');

				//添加选中效果
				o.$tplBox.data('chkedIndex') != 'undefined' && o.$tplBox.children().eq(o.$tplBox.data('chkedIndex')).removeClass('active');
				$this.addClass('active');
				o.$tplBox.data('chkedIndex',$this.index());

				//更新orderInfo
				GLOBAL.orderInfo['tplID']=tplID;
				GLOBAL.orderInfo['tplXmlUrl']=$this.data('xmlurl');
			});
		}
	};

	module.exports = {
		preInit:preInit,
		pIndex:pIndex
	};
});