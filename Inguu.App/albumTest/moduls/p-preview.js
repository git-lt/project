define(function(require, exports, module) {
	require('./global');
	require('./utils');

	require('jquery');
	require('jquery.xml2json');
	require('jquery.pullRefresh');
	require('jquery.msg');
	require('jquery.pep');
	require('jquery.colorPicker');
	require('jquery.rangex');
	var touch = require('touch.min');
	require('islider');

	var pPreview = {};

	pPreview = {
		options:{
			taobaoBox:$('#cart-taobao'),
			picListBox:$('#pic-list-box'),
			isFirstInit:true,
			lastPhotosNum:0,
			currXmlUrl:'',
			currPageNum:0,		//第几页模板
			currPageScale:0, 	//模板的缩放值
			models:{},
			tplXMLData:{},  		//模板信息
			textLayerInfo:{}, 		//存储模板上的文字层信息 t-0-1
			ttfPicList:[],			//字体预览图的数据
			lastAddPicIndex:0,		//最后一张添加到模板上的照片索引
			imgPosInfo:[],  		//保存模板上的照片坐标信息
			picListData:[],			//根据用户手动排序后的照片集合
			picListPageNum:0, 		//照片大于4个时，分页数量
			picShowNum:0, 			//可以显示的照片个数
			currPicListPageNum:1	//顶部照片所在的页码
		},
		init:function(){
			var o = this.options;

			this.initTpl();

			this.showImgs();

			$('#previewTbName').text(GLOBAL.orderInfo.taobao);

			if(o.isFirstInit){

				this.tplNavPageEv();

				this.popupAddTextEv();

				this.subOrderEv();

				this.editUserEv();

				this.picNavPageEv();

				this.hideResultPageEv();

				this.autoAddEv();

				o.isFirstInit = false;
			}
		},
		initTpl:function(){
			var self= this,o=this.options;
			if(!GLOBAL.orderInfo.tplXmlUrl) return;
			if(o.currXmlUrl == GLOBAL.orderInfo.tplXmlUrl) return;
			o.currXmlUrl = GLOBAL.orderInfo.tplXmlUrl;

			$.ajax({
				url:GLOBAL.reqURL.proxyURL,
				data:{url:GLOBAL.orderInfo.tplXmlUrl},
				type:'POST'
			}).done(function(data){
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
					tplNavNum.push('<div class="clearfix">');
					for(var i=1,len = arrModels.length; i<=len; i+=1 ){
						if( i!==1 && (i-1)%5===0){
							tplNavNum.push('</div><div class="clearfix hide">');
						}else if( i===len && i%5 !==0 ){
							tplNavNum.push('<a href="javascript:void(0)" class="btn ml5 mr5 p10" >'+i+'</a></div>');
							break;
						}
						cls = i===1?'btn-primary':'';
						tplNavNum.push('<a href="javascript:void(0)" class="btn '+cls+' ml5 mr5 p10" >'+i+'</a>');
					}
					$('#tpl-navpage div.pagenum').html(tplNavNum.join('')).data('currPageNumLayer',0);

					$('#tpl-navpage').show().find('.prev').addClass('disabled');
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

				//数据重置
				o.lastAddPicIndex = 0;
				GLOBAL.orderInfo.autoAddPic && self.autoAddPicToTpl(0);

			}).fail(function(){
				alert('模板加载失败！');
			});
		},
		refreshPicListPos:function(){
			//设置照片的定位，以便于pep的事件绑定
			var i=0;
	        $('#pic-list-box li:visible').each(function(){
	        	$(this).css({
	        		top:'0',
	        		left:(i*70+20)+'px'
	        	});
	        	i++;
	        });
		},
		showImgs:function(){
			var self = this, o = this.options; //添加：如果照片旋转了，要重新显示照片
			if(GLOBAL.photos.length>0 && o.lastPhotosNum != GLOBAL.photos.length){

				o.lastPhotosNum = GLOBAL.photos.length;

				var $box = $('#pic-list-box'), $actions = $('#upload-pic-box .prev,#upload-pic-box .next');

				//按index进行排序
				o.picListData = $('#imgs-box').children().sort(function(a,b){
					return ($(a).attr('index')>>0)>($(b).attr('index')>>0)
				});

				var picNum = GLOBAL.photos.length;

				if( picNum > 4 ){
					$actions.show();
					//计算当前屏幕的大小及可显示的照片数量。 40:上一页下一页的宽度，70：照片的宽度
					o.picShowNum = Math.floor((document.body.clientWidth-35)/70); //每页显示的数量
					$box.html('').append(o.picListData.slice(0, o.picShowNum).clone());
					o.picListPageNum = Math.ceil(picNum/o.picShowNum); //页数
					o.currPicListPageNum = 1; //当前页码
				}else{
					$actions.hide();
					$box.html('').append(o.picListData.clone());
				}

				self.refreshPicListPos();

				self.initDrag();
			}
		},
		picNavPageEv:function(){
			var self = this, o = this.options, 
				$prev = $('#upload-pic-box .prev'),
				$next = $('#upload-pic-box .next'),
				$box = $('#pic-list-box');


			$prev.on('click',function(){
				if(o.currPicListPageNum>=1){
					o.currPicListPageNum--;
					var lastI = o.currPicListPageNum*o.picShowNum;
					$box.html('').append(o.picListData.slice(lastI-o.picShowNum, lastI).clone());
					self.refreshPicListPos();
					$next.show();
					
					if(o.currPicListPageNum == 1){
						$(this).hide();
					}
					self.initDrag();
				}
			});
			$next.on('click',function(){
				if(o.currPicListPageNum <= o.picListPageNum){
					var startI = o.currPicListPageNum*o.picShowNum;

					$box.html('').append(o.picListData.slice(startI, startI+o.picShowNum).clone());
					self.refreshPicListPos();
					$prev.show();
					o.currPicListPageNum++;
					if(o.currPicListPageNum == o.picListPageNum){
						$(this).hide();
					}
					self.initDrag();
				}
			});
		},
		tplNavPageEv:function(){
			var $navPageBox = $('#tpl-navpage')
				, $tplsBox = $('#tpls-box')
				, $numLayers = $navPageBox.find('.pagenum')
				, o = this.options, self=this;

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

					GLOBAL.orderInfo.autoAddPic && self.autoAddPicToTpl(index);
				}

				//显示当前，隐藏其它
				$('#tpl-edit-box'+$tplsBox.data('currindex')).hide();

				$('#tpl-edit-box'+index).show();
				$tplsBox.data('currindex',index);

				//页码添加选择样式
				$this.addClass('btn-primary');
			});

			$navPageBox.find('button.prev').on('click',function(){
				var currNumLayerIndex = $numLayers.data('currPageNumLayer');
				var $layers = $numLayers.children(),
					$next = $('#tpl-navpage .next'),
					$this = $(this);
				console.log($layers.length);

				if($next.hasClass('disabled')) $next.removeClass('disabled');
				if(currNumLayerIndex!==0){
					$layers.eq(currNumLayerIndex).hide();
					currNumLayerIndex--;
					$numLayers.data('currPageNumLayer',currNumLayerIndex);
					$layers.eq(currNumLayerIndex).show();
				}

				if(currNumLayerIndex===0){
					$this.addClass('disabled');
				}
			});

			$navPageBox.find('button.next').on('click',function(){
				var currNumLayerIndex = $numLayers.data('currPageNumLayer');
				var $layers = $numLayers.children();
				var len = $layers.length-1;
				if($('#tpl-navpage .prev').hasClass('disabled')) $('#tpl-navpage .prev').removeClass('disabled');
				
				console.log($layers.length);
				if(currNumLayerIndex!==len){
					$layers.eq(currNumLayerIndex).hide();
					currNumLayerIndex++;
					$numLayers.data('currPageNumLayer',currNumLayerIndex);
					$layers.eq(currNumLayerIndex).show();
				}
				if(currNumLayerIndex===len){
					$(this).addClass('disabled');
				}
			});
		},
		editUserEv:function(){
			$('#previewEditTB').on('click',function(){
				var t = GLOBAL.orderInfo.taobao;
				$.msg.prompt({
					defaultVal:GLOBAL.orderInfo.taobao,
					onConfirm:function($ipt){
						var tName = $ipt.val();
						if($.trim(tName)!==''){
							if(tName!=t){
				                GLOBAL.orderInfo.taobao = tName;
								Utils.setCookie('taobao',tName,30);
								$('#previewTbName').text(tName);
							}
							$.msg.prompt().hide();
						}else{
							$ipt.addClass('ipt-error').one('webkitAnimationEnd',function(){
								$(this).removeClass('ipt-error');
							});
						}
					}
				}).show();
			});
		},
		initDrag:function(){
			var that =this,o=this.options;
	        $('#pic-list-box li').pep({
				constrainTo: '#pagePreview .content',
				droppable: '.drop-box',
				droppableActiveClass:'pep-dpa',
				overlapFunction: false,
				useCSSTranslation: false,
				revert: true,
				revertIf: function(ev, obj){
					return !this.activeDropRegions.length;
				},
				start: function(ev, obj){ 
					obj.noCenter = false;
					obj.$el.css('z-index', 99);
				},
				rest: function(ev, obj){ //拖到指定位置后的回调函数
					if ( obj.activeDropRegions.length > 0 ) {
						var $li = $(obj.el)
							, url = $li.children().css('background-image')//图片地址包含url(...)
							, sizeW = $li.attr('w')		//图片大小
							, sizeH = $li.attr('h')		//图片大小
							, imgId = $li.prop('id').substring(4)
							, picRotate = GLOBAL.photos[imgId].rotate;

						url = url.substring(4,url.length-1);

						//恢复图片到原始位置
						obj.revert();

						//图片拖动到的盒子
						var $dropBox=$(obj.activeDropRegions[obj.activeDropRegions.length-1]),
							layerIndex = $dropBox.data('index');

						//缩放 图片至盒子大小添加到盒子中
						var mark = Math.random().toString('16').substring(2,5);//生成三位随机数，用于几张相同的图片
						$dropBox.html('');
						var boxsize = $dropBox.data('boxsize');

						//判断是否需要要 旋转
						var res = that.autoScaleImg(boxsize.w, boxsize.h, sizeW, sizeH, picRotate);

						$('<img id="i'+imgId+mark+'" src="'+url+'" class="" alt="" width="'+sizeW+'" height="'+sizeH+'"/>').css({width:res.w,
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
							BaseWidth:parseInt(sizeW, 10),
							BaseHeight:parseInt(sizeH, 10),
							Rotate:res.rotateDeg
						};

						o.imgPosInfo = Utils.refreshStringArr(o.imgPosInfo);

						var $parent = $dropBox,pT=$parent.offset().top,pL = $parent.offset().left;

						//绑定拖拽事件图片，限定左右或上下拖动
						var maxMoveLength = res.cmx ? res.w-boxsize.w: res.h-boxsize.h;
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
							stop:function(ev, obj){//图片的坐标：从css的transform中的matrix矩阵中取
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
								// $('#tipBox').msgTip('模板第 '+(i+1)+' 页未添加照片！',4000,'yellow');
								// return false;
								continue;
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
								// $.msg.tip('模板第 '+(i+1)+' 页未添加照片！','#tipBox',4000,'yellow'); 
								// $('#tipBox').msgTip('模板第 '+(i+1)+' 页未添加照片！',4000,'yellow');
								// return false;
								continue;
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
	            'editUrl': GLOBAL.orderInfo.editUrl,
	            'makeClass': 'OrderComposite.BookComposite,OrderComposite'
	        };
	    	return subData;
	    },
	    subOrderEv:function(){
	    	var self=this, o=this.options;
	    	$('#sub-order-btn').on('click',function(){
	    		//模板是否添加了图片
	       		if($('.drop-box img').length!=$('.drop-box').length){
					$('#tipBox').msgTip('请给模板添加照片！',4000,'yellow');
					return false;
				}
				var $this = $(this);
	           
	    		//异步提交数据
	    		var data = self.buildSubData();
	    		if(!data) return false;

	    		$this.addClass('disabled');
	    		$.post(GLOBAL.reqURL.orderSubURL,data,function(data){
	    			console.log(data);
	    			// 判断是否提交成功
	    			if(data.indexOf('|')>0){
	    				var href = window.location.href;
						setTimeout(function(){$('#page-subResult').show()},0);
						var editRel = href.substring(0,href.indexOf('?')+1)+'id='+data.split('|')[1];
	    				$('#page-subResult').addClass('in').find('.editeUrl').text(editRel);

						$this.removeClass('disabled');
	    			}else{
	    				$('#tipBox').msgTip('订单提交失败：'+data.substring(0,20), 4000,'red');
	    			}
	    			 $this.html('提交作品');
	    		});

	    		return false;
	    	});
	    },
        popupAddTextEv:function(){
        	var o = this.options, scaleSize = 20, $popupPage = $('#popup-addtxt');;
        	var txtInfo={
        		str:'',
        		v:0,
        		scale:1,
        		color:'000000',
        		fontname:encodeURIComponent('微软雅黑'),
        		size:0
        	};

        	var txtInfo_t = $.extend({},txtInfo);

        	//range 控件初始化，获取字体大小，并设置
        	$('#size-range').rangeX({		
        		maxVal:50,
				minVal:16,
				currVal:20,
				step:2,
				onChange:function(val){
					var size = val;
					$('#ttf-size').text(size);
					txtInfo.size = Math.round(size/o.currPageScale);
					scaleSize=size;
				}
			});
        	// document.getElementById('txt-result').addEventListener('touchmove',function(e){ e.preventDefault()},false);

        	var popupTxtShow =function(){
        		$popupPage.css('display','block')
        		Utils.debounce(function(){$popupPage.addClass('active');},50)();
        		// $popupPage.show();
        	};
        	var popupTxtHide =function(){
        		$popupPage.removeClass('active');
        		Utils.debounce(function(){$popupPage.hide();},400)();
        	};

        	//添加文字 按钮 事件
        	$('#addTxt').on('click',function(){
        		popupTxtShow();
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
    			if(!o.currPageScale) return; //没有模板缩放值，说明模板没有加载

    			$('#txt-result').hide();
    			//获取输入：
    			var txt = $.trim($('#txt-info').val());
    			if(txt==''){
    				$('#tipBox').msgTip('文字输入不能为空！', 4000,'blue');
    				 return false;
    			}
    			txtInfo.str= encodeURIComponent(txt);
    			txtInfo.fontname = encodeURIComponent($('#ttf-name').text());

    			var url = GLOBAL.reqURL.getFontPicURL + Utils.objectToUrlpms(txtInfo)+'&r='+Math.random().toString().substring(3,6);
    			console.log(url);

    			//将地址添加到img标签中，预览
    			popupTxtShow();//进度条
    			
    			$('#txt-preimg').attr('src',url).off().load(function(){
    				console.log('img: '+this.width+','+this.height);
    				popupTxtHide();
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

    					popupTxtHide();
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
    			popupTxtHide();
    		});

    		//横向竖向 按钮注册事件
    		// $('#text-direction').on('click','button',function(){
    		// 	var dec = $(this).data('val');
    		// 	$(this).addClass('mui-btn-positive').siblings().removeClass('mui-btn-positive');
    		// 	txtInfo.v = dec;
    		// });

    		//修改: 给文字层双击注册事件
    		touch.on('#tpls-box','doubletap','.txtImg',function(){
    			//初始化界面
    			var $popupBox = $('#popup-addtxt');
    			var txtimgId = $(this).attr('id');//图片id

    			//显示删除按钮
    			$('#del-currTxt').show().data('txtImgId',txtimgId);

    			initPopupView('修改文字','确认修改',o.textLayerInfo[txtimgId]['FontColor'], o.textLayerInfo[txtimgId]['size'],o.textLayerInfo[txtimgId]['FontFamily'],0,true,o.textLayerInfo[txtimgId]['Src']);

    			popupTxtShow();
    		});

    		//删除：给按钮注册删除文字层事件
    		$('#del-currTxt').on('click','button',function(){
    			//获取图片的id，删除对象中的图片信息
    			var imgId = $('#del-currTxt').data('txtImgId');
    			o.textLayerInfo[imgId]=null;
    			o.textLayerInfo = Utils.refreshStringArr(o.textLayerInfo);
    			//关闭当前页面
    			popupTxtHide();
    			//删除界面上的文字图片
    			$('#'+imgId).off().remove();
    		});

    		//参数:页面标题、添加按钮的文本，颜色值、字体大小、字体名称、方向值、是否显示删除按钮、文本
    		function initPopupView(title,actionTxt,color,size,fontFamily,direction,showDel,txt){
    			$('#popup-addtxt').find('.popup-title').text(title);
    			$('#txt-info').val(txt||'').css({'color':'#'+color});
    			$('#txt-result').hide();
    			$('#size-range').rangeX('setVal',size);
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
        },
        autoAddEv:function(){
        	var self = this;
        	$('#btnAutoAdd').click(function(){
        		self.options.lastAddPicIndex = 0;
        		$(this).toggleClass('active');
        		if($(this).hasClass('active')){
        			GLOBAL.orderInfo.autoAddPic = true; 
        			$(this).find('i').html('&#xe621;');
        			self.autoAddPicToTpl(0);
        			return;
        		}

        		$(this).find('i').html('&#xe622;');
        		GLOBAL.orderInfo.autoAddPic = false; 
        		var $imgs = $('.drop-box img');
        		if($imgs.length>0){
        			$imgs.replaceWith('<p style="margin-top:25%; color:#fff;">请拖动图片到此处</p>');
        		}
        		$imgs = null;
        		return;
        	});
        },
        hideResultPageEv:function(){
        	$('#page-subResult').click(function(){ 
        		$(this).removeClass('in').fadeOut(function(){
        			var goIndexUrl = window.location.href.replace(window.location.hash,'#&pageIndex');
        			window.location.href = goIndexUrl; 
        			window.location.reload();
        		});
        	});
        },
        hasPhotos:function(){ return GLOBAL.photos.length > 0; },
        autoAddPicToTpl:function(currPageNum){
        	var self = this, o = this.options;
        	//获取模板上所有的照片区域，获取照片的大小
        	var pics = o.picListData; //所有照片

        	var tplPics = $('#tpl-edit-box'+(currPageNum||0)).find('.drop-box');
			var tempIndex = o.lastAddPicIndex === 0 ? 0 : o.lastAddPicIndex+1; 

        	tplPics.each(function(index){
        		//获取照片大小和当前照片区域大小，计算缩放和角度、
        		//获取照片路径，添加到当前模板
        		//记录数据到imgPosInfo中
        		//绑定拖动事件
        		if(pics.eq(tempIndex).length===0) return false;

        		o.lastAddPicIndex = tempIndex;
        		var $this = $(this);
        		var boxW = $this.data('boxsize').w>>0, boxH = $this.data('boxsize').h>>0;
        		var imgW = pics.eq(tempIndex).attr('w')>>0, 
        			imgH = pics.eq(tempIndex).attr('h')>>0,
        			imgId = pics.eq(tempIndex).prop('id').substring(4),
        			imgSrc = pics.eq(tempIndex).data('url'),
        			rotateD = GLOBAL.photos[imgId].rotate,
        			layerIndex = $this.data('index');

				tempIndex++;

        		var res = self.autoScaleImg(boxW, boxH, imgW, imgH, rotateD);
        		var mark = Math.random().toString('16').substring(2,5);//生成三位随机数，用于几张相同的图片

        		$('<img id="i'+imgId+mark+'" src="'+imgSrc+'" class="" alt="" width="'+imgW+'" height="'+imgH+'"/>').css({width:res.w,
        			height:res.h,
        			'-webkit-transform':'rotate('+res.rotateDeg+'deg)'
        		}).appendTo($this.html(''));

        		//获取模板的页码
        		var pageNum = $this.parents('.tpl-edit-box').prop('id').replace('tpl-edit-box','')>>0;

        		//将照片信息存储到imgPosInfo中   参数：[i-第几页-第几层]
        		o.imgPosInfo['i-'+ pageNum +'-'+ layerIndex]={
        			Src:encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/%/g,'_')+'/'+ imgId+'.jpg',
        			ImageX: 0,
        			ImageY: 0,
        			ImageWidth: res.w,
        			ImageHeight: res.h,
        			BaseWidth: imgW,
        			BaseHeight: imgH,
        			Rotate: res.rotateDeg
        		};

        		o.imgPosInfo = Utils.refreshStringArr(o.imgPosInfo);

        		var pT=$this.offset().top,pL = $this.offset().left;

    			//绑定拖拽事件图片，限定左右或上下拖动
    			var maxMoveLength = res.cmx ? res.w-boxW: res.h-boxH;
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
    				stop:function(ev, obj){//图片的坐标：从css的transform中的matrix矩阵中取
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
        	});
        }
	};

	module.exports = pPreview;

});