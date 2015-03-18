//存储所有相处信息
var photos = Page.cart.options.photos = [];

function Photo(parameters) {
    if (parameters && parameters.length) {
        this.guid = parameters.guid;
        this.state = parameters.state;
        this.x = parameters.x;
        this.y = parameters.y;
        this.width = parameters.width;
        this.height = parameters.height;
        this.param = parameters.param;
        this.goods = parameters.goods;
        this.number = parameters.number;
        this.imageWidth = parameters.imageWidth;
        this.imageHeight = parameters.imageHeight;
        this.orderID = parameters.orderID;
    }
}

$(function () {
    /*计算数量*/
    sumAmount();

    // 监听选择文件事件 [上传控件]
    $('#file-image').on('change', getUploadFile);
    // 点击普通按钮触发文件上传按钮 [伪装的触发按钮]
    // $('#upload-btn').on('click', tapUploadBtn);


    /*操作 事件绑定*/
    setHandlers();
});

/* === 计算数量 === */
var sumAmount = function () {
    var sum = 0;
    $('#pic-list-box').find('.amount').each(function () {
        sum = sum + parseInt($(this).text());
    });
    GLOBAL.orderInfo.total = sum;
    $('#sumAmount').text(sum);
    return sum;
};


/* === 图片上传 === */
var files = [];
//MAIN：开始上传
function startUpload() {
    if (files.length) {
        var file = files.shift();
        ajaxUpload(file);
    } else {
        console.log('所有文件上传完毕！');
        files.length = 0;
        setHandlers();    //绑定操作事件
        sumAmount();

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
    //previewPic(files);  // 图片预览
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
    xhr.open('POST', GLOBAL.ReqURL['picSub'] + pms, true);
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

    var sizeStr = e.target.responseText;
    if (sizeStr.indexOf('|') > 0) {
        var size = sizeStr.split('|'), imgW = size[0], imgH = size[1];
        var imgListHtml = [];
        imgListHtml.push('<li class="mui-table-view-cell imgs-item-li" id="list' + fileGuid + '"><div class="mui-slider-cell">');
        imgListHtml.push('<div class="mui-slider-handle oa-task-cell mui-table ">');
        imgListHtml.push('<div class="mui-table-cell mui-col-xs-4">');
        imgListHtml.push('<div class="img-paper" id="i' + fileGuid + '"><img src="'+GLOBAL.ReqURL['imgSrc']+encodeURIComponent(GLOBAL.orderInfo.taobao).replace(/\%/g,'_') +'/x_'+ fileGuid +'.jpg" width="' + imgW + '" height="' + imgH + '" alt="" /></div></div>');
        imgListHtml.push('<div class="mui-table-cell mui-col-xs-2">');
        imgListHtml.push('<span class="mui-badge"> <b class="amount">1</b> 张</span></div>');
        imgListHtml.push('<div class="mui-table-cell mui-col-xs-6 mui-button-row">');
        imgListHtml.push('<button class="edit-position mr05em"><span class="mui-icon mui-icon-compose"></span></button>');
        imgListHtml.push('<button class="decrease mr05em"><span class="mui-icon mui-icon-minus"></span></button>');
        imgListHtml.push('<button class="increase mr05em"><span class="mui-icon mui-icon-plus"></span></button>');
        imgListHtml.push('</div><span class="pix-tip f05"></span></div></div>');
        imgListHtml.push('<div><div class="mui-table-view mui-grid-view action-btns mui-text-center hide">');
        imgListHtml.push('<button class="mui-table-view-cell mui-col-xs-2 pos-lb mr05em"><span>留白</span></button>');
        imgListHtml.push('</div></div></li>');

        imgListHtml = imgListHtml.join('');
        $('#pic-list-box').append(imgListHtml);
        $('#cart-temp-info').remove();

        //缩放尺寸
        var cutPosition = { x: 0, y: 0, width: 0, height: 0 };//裁切信息
        var sizeBl = GLOBAL.SCALE_SIZE[GLOBAL.orderInfo.printType+GLOBAL.orderInfo.size];//获取选择的尺寸比例
        var res = autoScaleImg(fileGuid, 90,sizeBl[0], sizeBl[1], imgW, imgH, cutPosition);//获取缩放尺寸

        //添加像素提示样式
        var pixTip = getSizeCls(cutPosition.width,cutPosition.height);
        var pixTxt = pixTip[1];
        var actionBtnsL = actionBtnT = [], $btnbox = $('#list' + fileGuid + ' .action-btns');
        $('#list'+fileGuid+' div.oa-task-cell').addClass(pixTip[0]);
        $('#list'+fileGuid+' .pix-tip').text(pixTxt);

        //添加操作按钮
        if (cutPosition.x>cutPosition.y) {//可以左右移动, 添加 左 中 右 移动的按钮
            actionBtnsL.push('<button class="mui-table-view-cell mui-col-xs-2 pos-l"><span class="mui-icon mui-icon-arrowthinleft"></span></button>');
            actionBtnsL.push('<button class="mui-table-view-cell mui-col-xs-2 pos-c active"><span class="mui-icon mui-icon-plusempty"></span></button>');
            actionBtnsL.push('<button class="mui-table-view-cell mui-col-xs-2 pos-r"><span class="mui-icon mui-icon-arrowthinright"></span></button>');
            $btnbox.append(actionBtnsL.join(''));

            $('#i' + fileGuid + ' img').attr('center', 'left:' + (-cutPosition.x) + 'px; right:auto; top:0; bottom:auto;').data('mx', true);
        } else {//添加 上 中 下 移动的按钮
            actionBtnT.push('<button class="mui-table-view-cell mui-col-xs-2 pos-t"><span class="mui-icon mui-icon-arrowthinup"></span></button>');
            actionBtnT.push('<button class="mui-table-view-cell mui-col-xs-2 pos-c active"><span class="mui-icon mui-icon-plusempty"></span></button>');
            actionBtnT.push('<button class="mui-table-view-cell mui-col-xs-2 pos-b"><span class="mui-icon mui-icon-arrowthindown"></span></button>');
            $btnbox.append(actionBtnT.join(''));

            $('#i' + fileGuid + ' img').attr('center', 'top:' + (-cutPosition.y) + 'px; bottom:auto; left:0; right:auto;').data('mx', false);
        };
        //关闭按钮
        $btnbox.append('<button class="mui-table-view-cell mui-col-xs-2 mr05em btn-del"><span class="mui-icon mui-icon-closeempty"></span></button>');

        //将文件信息记录到对象PhotoObj中
        var oPic = new Photo({
            guid: fileGuid,
            state: 1,
            x: cutPosition.x,
            y: cutPosition.y,
            width: cutPosition.width,
            height: cutPosition.height,
            param: GLOBAL.orderInfo.texture,
            goods: GLOBAL.orderInfo.id,
            number: 1,
            imageWidth: size[0],
            imageHeight: size[1],
            length: 11,
            orderID:GLOBAL.orderInfo.orderID
        });

        photos[fileGuid] = oPic;
        photos.length = (photos.length || 0) + 1;
        console.log(photos);

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



// ============像素判断============
function getSizeCls (boxW,boxH){
    var clsNum=1;
    switch(GLOBAL.orderInfo.id){
        case '5':
            clsNum=compareSize(boxW,boxH,1270,890);
        break;
        case '0':
            clsNum=compareSize(boxW,boxH,1520,1020);
        break;
        case '1':
            clsNum=compareSize(boxW,boxH,1520,1140);
        break;
        case '2':
            clsNum=compareSize(boxW,boxH,1780,1270);
        break;
        case '3':
            clsNum=compareSize(boxW,boxH,2030,1520);
        break;
        case '34':
            clsNum=compareSize(boxW,boxH,1270,890);
        break;
        case '30':
            clsNum=compareSize(boxW,boxH,1520,1020);
        break;
        case '31':
            clsNum=compareSize(boxW,boxH,1520,1140);
        break;
        case '32':
            clsNum=compareSize(boxW,boxH,1780,1270);
        break;
        case '33':
            clsNum=compareSize(boxW,boxH,2030,1520);
        break;
        case '8700':
            clsNum=compareSize(boxW,boxH,1520,1020);
        break;
        case '8701':
            clsNum=compareSize(boxW,boxH,2030,1520);
        break;
        case '8702':
            clsNum=compareSize(boxW,boxH,2540,2030);
        break;
        case '8694':
            clsNum=compareSize(boxW,boxH,1778,1270);
        break;
        case '8695':
            clsNum=compareSize(boxW,boxH,2030,1520);
        break;
        case '8696':
            clsNum=compareSize(boxW,boxH,2540,2030);
        break;
        case '8665':
            clsNum=compareSize(boxW,boxH,700,530);
        break;
        case '8667':
            clsNum=compareSize(boxW,boxH,830,650);
        break;
        case '8669':
            clsNum=compareSize(boxW,boxH,1000,750);
        break;
        case '8671':
            clsNum=compareSize(boxW,boxH,1200,900);
        break;
    }
    return { '1': ['img-ok',''], '0': ['img-waring','像素不足'], '-1': ['img-danger','像素严重不足'] }[clsNum];
}

function compareSize (boxW,boxH,sizeW,sizeH){
    if(boxW>sizeW && boxH>sizeH){
        return 1;
    }else if(boxW>=sizeW/2 && boxH>=sizeH/2){
        return 0;
    }else{
        return -1;
    }
}



/* === 缩放尺寸 === */
//缩放图片尺寸 [参数：外层正方形盒子的宽，比例的长，比例的高，图片的长，图片的高,裁切的坐标]
function autoScaleImg(imgboxID, boxW, sizeW, sizeH, w, h, cutPosition) {

	var imgW = w;
	var imgH = h;
	var max = Math.max(sizeW,sizeH);
	var min = Math.min(sizeW,sizeH);
   
	if(w > h){
		var wc = w / max, hc = h / min;
		if (wc < hc) {
			h = w * min / max;
		} else {
			w = h * max / min;
		}
	}else{
		var wc = w / min, hc = h / max;
		if (wc < hc) {
			h = w * max / min;
		} else {
			w = h * min / max;
		}
	}
	var zoom = boxW / Math.max(w, h);
	$('#i' + imgboxID).css({
		width: w + 'px',
		height: h + 'px',
		zoom: zoom,
        left:'50%',
        'margin-left':(-w/2)+'px',
        top:'50%'
	});
    
    //图片居中显示
    var topV = leftV = 0;
    $('#i' + imgboxID + ' img').css({
        top: -(imgH - h)/2 + "px",
        left: -(imgW - w)/2 + "px"
    });

    cutPosition.x = Math.abs(parseFloat(-(imgW - w)/2));
    cutPosition.y = Math.abs(parseFloat(-(imgH - h)/2));
    cutPosition.width = w;
    cutPosition.height = h;

    return cutPosition;
}


/* === 操作 事件绑定 === */
var setHandlers = function () {
    //center
    $('#pic-list-box .action-btns .pos-c').off().off().on('click', function () {
        var $this = $(this);
        var $img = $this.parents('.imgs-item-li').find('.img-paper img');
        if ($img.data('islb')) {
            $img.css({ 'width': $img.attr('width') + 'px', 'height': $img.attr('height') + 'px' });
            $img.data('islb', false);
        }
         var txtCenter = $img.attr('center')
        $img[0].style.cssText = txtCenter;
        $this.addClass('active').siblings().removeClass('active');

        var cutCenterVal = (txtCenter.substring(txtCenter.indexOf(':')+1,txtCenter.indexOf('px')))-0;
        var currGuid = $img.parent().attr('id').substring(1);
        if($img.data('mx')){
            updatePhotoCutInfo(currGuid, cutCenterVal, 0, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
        }else{
            updatePhotoCutInfo(currGuid, 0, cutCenterVal, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
        }
    });
    //right
    $('#pic-list-box .action-btns .pos-r').off().on('click', function () {
        var $this = $(this);
        var $img = $this.parents('.imgs-item-li').find('.img-paper img');
        if ($img.data('islb')) {
            $img.css({ 'width': $img.attr('width') + 'px', 'height': $img.attr('height') + 'px' });
            $img.data('islb', false);
        }
        $img.css({ left: 0, right: 'auto', top: 0, bottom: 'auto' });
        $this.addClass('active').siblings().removeClass('active');
        var currGuid = $img.parent().attr('id').substring(1);
        updatePhotoCutInfo(currGuid, 0, 0, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
    });
    //left
    $('#pic-list-box .action-btns .pos-l').off().on('click', function () {
        var $this = $(this);
        var $img = $this.parents('.imgs-item-li').find('.img-paper img');
        if ($img.data('islb')) {
            $img.css({ 'width': $img.attr('width') + 'px', 'height': $img.attr('height') + 'px' });
            $img.data('islb', false);
        }
        $img.css({ right: 0, left: 'auto', top: 0, bottom: 'auto' });
        $this.addClass('active').siblings().removeClass('active');
        var currGuid = $img.parent().attr('id').substring(1);
        var cutLen = $img.attr('center');
        cutLen = (cutLen.substring(cutLen.indexOf(':')+1,cutLen.indexOf('px')))-0;
        updatePhotoCutInfo(currGuid, -cutLen*2, 0, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
    });
    //top
    $('#pic-list-box .action-btns .pos-t').off().on('click', function () {
        var $this = $(this);
        var $img = $this.parents('.imgs-item-li').find('.img-paper img');
        if ($img.data('islb')) {
            $img.css({ 'width': $img.attr('width') + 'px', 'height': $img.attr('height') + 'px' });
            $img.data('islb', false);
        }
        $img.css({ bottom: 0, top: 'auto', right: 0, left: 'auto' });
        $this.addClass('active').siblings().removeClass('active');
        var currGuid = $img.parent().attr('id').substring(1);
        var cutLen = $img.attr('center');
        cutLen = (cutLen.substring(cutLen.indexOf(':')+1,cutLen.indexOf('px')))-0;
        updatePhotoCutInfo(currGuid, 0, -cutLen*2, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
    });
    //bottom
    $('#pic-list-box .action-btns .pos-b').off().on('click', function () {
        var $this = $(this);
        var $img = $this.parents('.imgs-item-li').find('.img-paper img');
        if ($img.data('islb')) {
            $img.css({ 'width': $img.attr('width') + 'px', 'height': $img.attr('height') + 'px' });
            $img.data('islb', false);
        }
        $img.css({ top: 0, bottom: 'auto', left: 0, right: 'auto' });
        $this.addClass('active').siblings().removeClass('active');
        var currGuid = $img.parent().attr('id').substring(1);
        updatePhotoCutInfo(currGuid, 0, 0, $img.parent().css('width'), $img.parent().css('height'), $img.data('islb'));
    });
    //留白
    $('#pic-list-box .action-btns .pos-lb').off().on('click', function () {
        var $this = $(this),
            $img = $(this).parents('.imgs-item-li').find('.img-paper img'),
            $paper = $img.parent();
        if (!$img.data('mx')) {//左右留白
            $img.css({ 'height': $paper.css('height'), 'width': 'auto' });
            var cutVal = ($paper.offset().width - $img.offset().width) / 2;;
            $img.css({ 'left': cutVal + 'px', 'right': 'auto', 'top': 0, 'bottom': 'auto' });
        } else {//上下留白
            $img.css({ 'width': $img.parent().css('width'), 'height': 'auto' });
            var cutVal = ($paper.offset().height - $img.offset().height) / 2;;
            $img.css({ 'top': cutVal + 'px', 'bottom': 'auto', 'left': 0, 'right': 'auto' });
        }
        $this.addClass('active').siblings().removeClass('active');
        $img.data('islb', true);
        var currGuid = $img.parent().attr('id').substring(1);
        updatePhotoCutInfo(currGuid, $img.css('left'), $img.css('top'), $img.offset().width,  $img.offset().height, true);
    });

    //showOrHide actions
    $('#pic-list-box .edit-position').off().on('click', function () {
        var $this = $(this);
        $(this).parents('.imgs-item-li').find('.action-btns').toggle();
    });

    //increase Num
    var autoIncreaseTimer = null;
    $('#pic-list-box .increase').off().on('click', function () {
        var $amoutWrap = $(this).parents('.mui-slider-cell').find('.amount');
        var guid = $(this).parents('.imgs-item-li').prop('id').substring(4);
        var amount = $amoutWrap.text();
        amount = (amount - 0 + 1);
        $amoutWrap.text(amount);
        photos[guid]['number'] = amount;
        sumAmount();
    });

    //decrease Num
    var autoDecreaseTimer = null;
    $('#pic-list-box .decrease').off().on('click', function () {
        var $amoutWrap = $(this).parents('.mui-slider-cell').find('.amount');
        var guid = $(this).parents('.imgs-item-li').prop('id').substring(4);
        if ($amoutWrap.text() === '1') return false;
        var amount = $amoutWrap.text();
        if ((amount - 1) <= 0) {
            amount = 1;
            return false;
        }
        amount = amount - 1;
        $amoutWrap.text(amount);
        photos[guid]['number'] = amount;
        sumAmount();
    });

    //delete
    $('#pic-list-box .action-btns .btn-del').off().on('click',function(){
        if(confirm("是否确认删除相片？"))
        {
            var pBox = $(this).parents('.imgs-item-li');
            pBox.off().remove();
            var guid = pBox.prop('id').substring(4);
            photos[guid] = null;
            photos.length = photos.length - 1 === 0 ? 0 : photos.length - 1;
            var total = sumAmount();
            if(total===0){
                Page.order.resetPicList();
            }
        }
    });

}

function updatePhotoCutInfo(guid, x, y, width, height, islb) {
    photos[guid]['x'] = Math.abs(parseFloat(x));
    photos[guid]['y'] = Math.abs(parseFloat(y));
    photos[guid]['width'] = parseFloat(width);
    photos[guid]['height'] = parseFloat(height);
    photos[guid]['state'] = islb ? 2 : 1;
    console.log('guid: '+guid+' x: ' + photos[guid]['x'] + ' y: ' + photos[guid]['y'] + ' w: ' + photos[guid]['width'] + ' h: ' + photos[guid]['height']+' sate: '+photos[guid]['state']);
}
