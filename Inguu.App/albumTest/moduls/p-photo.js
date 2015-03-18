define(function(require, exports, module) {
	require('./global');
	require('./utils');
	require('jquery');
	require('jquery.xml2json');
	require('iscroll-probe');
	require('jquery.pullRefresh');
	require('jquery.msg');
	require('jquery.dragsort');
	var touch = require('touch.min');

	var pPhoto = {};

	pPhoto = {
		options:{
			isFirstInit:true,
			$uploadingEl:$('#loading-box'),
			$inputFileEl:$('#file-image'),
			$imgListBox:$('#imgs-box'),
			currChkImgId:null
		},
		init:function(){
			this.uploadPicEv();
			this.chkPicEv();
			this.delPicEv();
			this.rotatePicEv();
		},
		uploadPicEv:function(){
			var that = this, o = this.options, files = [];

			o.$inputFileEl.on('change', getUploadFile);

			//MAIN：开始上传
			function startUpload() {
			    if (files.length) {
			        var file = files.shift();
			        ajaxUpload(file);
			    } else {
			        files = [];
			        //隐藏加载提示
			        o.$uploadingEl.addClass('hide');
			        //设置position为static，浮动定位，方便dragsort来定位
			        $('#imgs-box .imgItem').css('position','static');
			        Utils.debounce(function(){
			        	$('#imgs-box').dragSort({
					       	wrap:'#imgs-box',
					       	item:'.imgItem'
				       	});
			        },300)();

			        console.log('所有文件上传完毕！');
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
			    xhr.addEventListener('loadstart', function(){ o.$uploadingEl.removeClass('hide'); }, false);
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
			        	$('#tipBox').msgTip('您这张' + file.name + '图片过大，应小于100M',4000,'yellow');
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
			         	tipCls = '';
			        // GLOBAL.ReqURL['imgSrc']+encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/\%/g,'_') +'/x_'+ fileGuid +'.jpg
			        
			        //判断像素是否合格
			        switch(Utils.checkPicZize(PRO_INFO.width, PRO_INFO.height, imgW, imgH)){
			        	case 0: tipCls = '<i class="iconfont c-or m5">&#xe60c;</i>'; break;
			        	case 1: tipCls = ''; break;
			        	case -1: tipCls = '<i class="iconfont c-rd m5">&#xe60c;</i>'; break;
			        };

			        var imgUrl = GLOBAL.reqURL['imgSrc']+encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/\%/g,'_') +'/x_'+ fileGuid+'.jpg';

			        $('<li class="imgItem" id="list'+fileGuid+'" data-url="'+imgUrl+'"><span class="S show tl"></span></li>').attr({'w':imgW,'h':imgH}).children()
			        .css({
			        	'background-image':'url('+ imgUrl +')',
			        })
			        .append(tipCls).end()
			        .appendTo(o.$imgListBox);

			        //添加页码标识，如果图片超过4张，便于分页显示
			        o.$imgListBox.data('currPage',0);

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
			        GLOBAL.photos = Utils.refreshStringArr(GLOBAL.photos);
			        console.log(GLOBAL.photos);
			    } else {
			    	$('#tipBox').msgTip('请检查旺旺名称，文件上传失败 :(',4000,'red');
			    }
			    startUpload();      //继续上传 未上传的文件
			}
			function uploadFailed(e) {
			    //显示加载提示
			    o.$uploadingEl.addClass('hide');
		    	$('#tipBox').msgTip('文件上传出错: ' + e.target.error,4000,'red');
			}
		},
		delPicEv:function(){
			var o = this.options;
			touch.on('#delPic','tap',function(){
				if(o.currChkImgId !== null) $('#'+o.currChkImgId).remove();
				GLOBAL.photos[o.currChkImgId.substring(4)]=null;
				GLOBAL.photos = Utils.refreshStringArr(GLOBAL.photos);
				o.currChkImgId = null;
			});
		},
		rotatePicEv:function(){
			var o = this.options;
			touch.on('#rotatePic','tap',function(){
				if(o.currChkImgId !== null){
					var $img = $('#'+o.currChkImgId),
						imgId = o.currChkImgId.substring(4);
					if($img.data('rotate') == undefined){
						$img.children().css({'-webkit-transform': 'rotate(-90deg)','transform': 'rotate(-90deg)'});
						$img.data('rotate',-90);
						GLOBAL.photos[imgId]['rotate']=-90;
					}else{
						var newDeg = $img.data('rotate')-90;
						$img.children().css({'-webkit-transform': 'rotate('+newDeg+'deg)','transform': 'rotate('+newDeg+'deg)'});
						$img.data('rotate',newDeg);
						GLOBAL.photos[imgId]['rotate'] = newDeg;
					}
				}
			});
		},
		chkPicEv:function(){
			var o = this.options;
			touch.on('#imgs-box', 'tap', 'li', function(e){
				var $this = $(e.target);
				if(o.currChkImgId !== null ) $('#'+o.currChkImgId).removeClass('active'); 
				o.currChkImgId = $this.parent().addClass('active').siblings().removeClass('active').end().attr('id');
			});
		},
		setTaobaoName:function(){
			// $().text();
		},
		resetPhotos:function(){
			//清空照片列表，添加提示
			//清空照片数据
			//禁用按钮
		},
		hasChkTplAndName:function(){
			if(!!GLOBAL.orderInfo.tplID && !!GLOBAL.orderInfo.taobao){
				return true;
			}else if(!GLOBAL.orderInfo.tplID){
				return 'tplNull';
			}else if(!GLOBAL.orderInfo.taobao){
				return 'nameNull';
			}
		}
	};

	module.exports = pPhoto;
});