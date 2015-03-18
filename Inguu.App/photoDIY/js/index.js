/*-----------------------全局变量申明-------------------------*/
var GLOBAL = {},//全局对象
    Utils = {}, //工具类
    Page = {},  //页面类
    Com = {};   //组件类

GLOBAL.orderInfo = {};
GLOBAL.orderInfo_temp = GLOBAL.orderInfo; //用于存储初始默认参数
GLOBAL.PAPER_TYPES = {};



Page.index = {};
Page.cart = {};
Page.order = {};

/*-----------------------对象定义-------------------------*/
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
    toggleShow: function (eventID, targetID) {
        $(eventID).click(function () {
            $(targetID).toggle();
        });
    },
    getUrlQuery:function(url,queryName){
        var reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)");
        var r = url.substring(url.indexOf("\?") + 1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
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
    }
};

//全局对象
GLOBAL.orderInfo = {
    orderID: Utils.newGuid().ToString('D'),    //订单编号
    id: "5",            //产品id
    brand: '柯达',    //品牌
    texture: '光面',  //材质
    size: '5寸',         //尺寸
    taobao: Utils.getCookie('taobao') || '',   //旺旺名
    total: 0,   //照片总数量
    isNew: true,    //是否为当前订单
    res: '柯达 5寸 光面',    //选择结果
    print:'木质', //版画材质
    printType:'s', //s:数码 b:版画 p:拍立得
    editUrl:''
};

GLOBAL.ReqURL = {
    // 'picSub': '/MakeApi/UploadFile',
    // 'orderSub':'/MakeApi/UploadAlbum',
    // 'imgSrc':'/MakeApi/GetUserPic/'

    'picSub': '/photo/UploadPhoto',
    'orderSub':'/Photo/UploadOrder',
    'imgSrc':'/Temp/'
}

//冲印类型编码
GLOBAL.PAPER_TYPES = {
    "富士5寸": "5",
    "富士6寸": "0",
    "富士全景6寸": "1",
    "富士7寸": "2",
    "富士8寸": "3",
    "柯达5寸": "34",
    "柯达6寸": "30",
    "柯达全景6寸": "31",
    "柯达7寸": "32",
    "柯达8寸": "33",
    "木质6寸":"8700",
    "木质8寸":"8701",
    "木质10寸":"8702",
    "水晶7寸":"8694",
    "水晶8寸":"8695",
    "水晶10寸":"8696",
    "3寸":"8665",
    "4寸":"8667",
    "5寸":"8669",
    "6寸":"8671"
};

//尺寸比例
GLOBAL.SCALE_SIZE={
    's5寸': [12.7, 8.9],
    's6寸': [15.2, 10.2],
    's7寸': [17.8, 12.7],
    's8寸': [20.3, 15.2],
    's全景6寸': [15.2, 11.4],
    'b6寸': [15.2,10.2],
    'b7寸': [17.78,12.7],
    'b8寸': [20.3,15.2],
    'b10寸': [25.4,20.3],
    'p3寸': [7.0,5.3],
    'p4寸': [8.3,6.5],
    'p5寸': [10.0,7.5],
    'p6寸': [12.0,9.0]
};

//组件类 - 页面切换
PageTransition = {
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
        $('.' + opt.pageOutCls).live('transitionend', function () {
            $(this).removeClass(opt.pageOutCls);
        });
        $('.' + opt.pageInCls).live('transitionend', function () {
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
        $(opt.nextSelector).live('click', function () {
            oThis.nextPage($(this).parents(opt.pageSelector));
        });
        $(opt.prevSelector).live('click', function () {
            oThis.prevPage($(this).parents(opt.pageSelector));
        });
    }
};
$.pageTransition = PageTransition;


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
            if(timeout){
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

//存储所有相处信息
var photos = [];

//页面类 
Page.index = {
    default: {
        $brand: $('#brand-chk-box .brand'),
        $brandImg: $('#brand-chk-box .brand-img'),
        $texture: $('#brand-chk-box .texture'),
        $textureImg: $('#brand-chk-box .texture-img'),
        $print:$('#print-box .print'),
        $printImg:$('#print-box .print-img'),
        $size: $('#size-list'),
        $resBox: $('#choiceInfo'),
        $sizeSumBox: $('#size-sum-box')
    },
    init: function () {
        //显示默认数据 选中状态
        var o = this.default;
        var buttons = $('#view-page-index button').removeClass('checked').find('span').removeClass('mui-icon-checkmarkempty');
        if(GLOBAL.orderInfo.printType=='s'){
            o.$brand.filter('button[data-val="' + GLOBAL.orderInfo.brand + '"]').addClass('checked').find('span').addClass('mui-icon-checkmarkempty');
            o.$texture.filter('button[data-val="' + GLOBAL.orderInfo.texture + '"]').addClass('checked').find('span').addClass('mui-icon-checkmarkempty');
        }else if(GLOBAL.orderInfo.printType=='b'){
            o.$print.filter('button[data-val="' + GLOBAL.orderInfo.print + '"]').addClass('checked').find('span').addClass('mui-icon-checkmarkempty');
        }else if(GLOBAL.orderInfo.printType=='p'){
            o.$texture.filter('button[data-val="' + GLOBAL.orderInfo.texture + '"]').addClass('checked').find('span').addClass('mui-icon-checkmarkempty');
        }
        o.$size.children().filter('li[data-val="' + GLOBAL.orderInfo.size + '"]').click();

        o.$resBox.text('定制信息：' + GLOBAL.orderInfo.res)
    },
    addEvents: function () {
        var o = this.default, oThis = this;

        o.$brand.on('click', function (e) { oThis._choiceBrandImg.bind(this, o, oThis)();return false;}  );
        o.$texture.on('click', function (e) { oThis._choiceTextureImg.bind(this, o, oThis)(); return false;}  );
        o.$size.on('click', 'li',function (e) { oThis._choiceSize.bind(this, o, oThis)(); return false;} );
        o.$print.on('click',function (){oThis._choicePrintImg.bind(this, o, oThis)(); return false;});
    },
    showSelected: function (o, oThis) {
        if(GLOBAL.orderInfo.printType==='s'){
            GLOBAL.orderInfo.res = GLOBAL.orderInfo.brand + ' ' + GLOBAL.orderInfo.size + ' ' + GLOBAL.orderInfo.texture;
        }else if(GLOBAL.orderInfo.printType==='b'){
            GLOBAL.orderInfo.res = GLOBAL.orderInfo.print + ' ' + GLOBAL.orderInfo.size;
        }else if(GLOBAL.orderInfo.printType==='p'){
           GLOBAL.orderInfo.res = GLOBAL.orderInfo.texture + ' ' + GLOBAL.orderInfo.size;
        }

        var val = '定制信息：' + GLOBAL.orderInfo.res;
        o.$resBox.text(val);
    },
    _choiceBrandImg: function (o, oThis) {
        var val = $(this).data('val'),
            imgUrl = val == '富士' ? "/images/paperbrand_f.jpg":'/images/paperbrand_k.jpg';
        GLOBAL.orderInfo.brand = val;

        if(GLOBAL.orderInfo.printType==='s'){
            GLOBAL.orderInfo.id = GLOBAL.PAPER_TYPES[GLOBAL.orderInfo.brand + GLOBAL.orderInfo.size];
        }
        oThis.showSelected(o);
        $(this).addClass('active mui-icon-checkmarkempty').parent().siblings().find('button').removeClass('active mui-icon-checkmarkempty');
        o.$brandImg.attr('src', imgUrl);
        console.log(GLOBAL.orderInfo);
    },
    _choiceTextureImg: function (o, oThis) {
        var val = $(this).data('val'),
            imgUrl = val == '光面' ? "/images/paperface-g.jpg":"/images/paperface-r.jpg";
        GLOBAL.orderInfo.texture = val;
        oThis.showSelected(o);
        $(this).addClass('active mui-icon-checkmarkempty').parent().siblings().find('button').removeClass('active mui-icon-checkmarkempty');
        o.$textureImg.attr('src', imgUrl);
        console.log(GLOBAL.orderInfo);
    },
    _choicePrintImg: function(o, oThis){
        var val = $(this).data('val'),
            imgUrl = val == '木质' ? "/images/printtype-m.jpg":"/images/printtype-s.jpg";
        GLOBAL.orderInfo.print = val;
        
        if(GLOBAL.orderInfo.printType==='b'){
            GLOBAL.orderInfo.id = GLOBAL.PAPER_TYPES[GLOBAL.orderInfo.print + GLOBAL.orderInfo.size];
        }
        oThis.showSelected(o);
        o.$printImg.attr('src', imgUrl);

        //切换尺寸
        if(val == '木质'){
            $('#size6').css('display','block');
            $('#size7').css('display','none');
            if(GLOBAL.orderInfo.size=='7寸'){
                GLOBAL.orderInfo.size = '6寸';
                o.$size.children().filter('[data-val="6寸"]').click();
            }
        }else{
            $('#size6').css('display','none');
            $('#size7').css('display','block');
            if(GLOBAL.orderInfo.size=='6寸'){
                GLOBAL.orderInfo.size = '7寸';
                o.$size.children().filter('[data-val="7寸"]').click();
            }
        }
        $(this).addClass('active mui-icon-checkmarkempty').parent().siblings().find('button').removeClass('active mui-icon-checkmarkempty');
        console.log(GLOBAL.orderInfo);
    },
    _choiceSize: function (o, oThis) {
        var val =$(this).data('val');
        GLOBAL.orderInfo.size = val;

        if(GLOBAL.orderInfo.printType==='s'){
            GLOBAL.orderInfo.id = GLOBAL.PAPER_TYPES[GLOBAL.orderInfo.brand + GLOBAL.orderInfo.size];
        }else if(GLOBAL.orderInfo.printType==='b'){
            GLOBAL.orderInfo.id = GLOBAL.PAPER_TYPES[GLOBAL.orderInfo.print + GLOBAL.orderInfo.size];
        }else if(GLOBAL.orderInfo.printType==='p'){
            GLOBAL.orderInfo.id = GLOBAL.PAPER_TYPES[GLOBAL.orderInfo.size];
        }
        oThis.showSelected(o);

        $(this).addClass('active').siblings().removeClass('active');

        //显示相应的尺寸规格
        var size = GLOBAL.SCALE_SIZE[GLOBAL.orderInfo.printType+val];
        var spans = o.$sizeSumBox.find('span');
        spans.first().text(val);
        spans.last().text(size[0]+'cm X '+size[1]+'cm');

        console.log(GLOBAL.orderInfo);
    }
};

Page.cart = {
    options: {
        photos: [],
        isFirstInit:true
    },
    init: function () { 
        var o = this.options, self = this;
        self.sumAmount();
        $('#cart-paper').text(GLOBAL.orderInfo.res);
        $('#cart-taobao').text(GLOBAL.orderInfo.taobao);

        if(o.isFirstInit){

            self.regUploadEv();

            self.picItemActionsEv();

            o.isFirstInit = false;

        }
    },
    regUploadEv:function(){ /*注册上传事件*/
        /* === 图片上传 === */
        var files = [],self=this;

        $('#file-image').on('change', getUploadFile);

        //MAIN：开始上传
        function startUpload() {
            if (files.length) {
                var file = files.shift();
                ajaxUpload(file);
            } else {
                console.log('所有文件上传完毕！');
                files.length = 0;
                self.sumAmount();

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
            //previewPic(files);  // 图片预览
            files.length && startUpload();
        }

        //异步上传
        function ajaxUpload(file) {
             //显示加载提示
            $('#loading-box').css('display','block');

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
                    $.msg.tip('您这张' + file.name + '图片过大，应小于100M','#alert-box',4000,'red');
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
                var res = self.autoScaleImg(fileGuid, 90,sizeBl[0], sizeBl[1], imgW, imgH, cutPosition);//获取缩放尺寸

                //添加像素提示样式
                var pixTip = self.getSizeCls(cutPosition.width,cutPosition.height);
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
                    x: parseInt(cutPosition.x, 10),
                    y: parseInt(cutPosition.y, 10),
                    width: parseInt(cutPosition.width, 10),
                    height: parseInt(cutPosition.height, 10),
                    param: GLOBAL.orderInfo.texture,
                    goods: GLOBAL.orderInfo.id,
                    number: 1,
                    imageWidth: parseInt(size[0], 10),
                    imageHeight:  parseInt(size[1], 10),
                    length: 11,
                    orderID:GLOBAL.orderInfo.orderID
                });

                photos[fileGuid] = oPic;
                photos.length = (photos.length || 0) + 1;
                console.log(photos);

            } else {
                $.msg.tip('请检查旺旺名称，文件上传失败 :(','#alert-box',4000,'red');
            }
            startUpload();      //继续上传 未上传的文件
        }
        function uploadFailed(e) {
            //显示加载提示
            $('#loading-box').css('display','none');
            $.msg.tip('文件上传出错: ' + e.target.error,'#alert-box',4000,'red');
        }
    },
    sumAmount:function(){ /*计算照片数量*/
        var sum = 0;
        $('#pic-list-box').find('.amount').each(function () {
            sum = sum + parseInt($(this).text());
        });
        GLOBAL.orderInfo.total = sum;
        $('#sumAmount').text(sum);
        return sum;
    },
    getSizeCls:function(boxW,boxH){ /*像素判断*/
        var clsNum=1,self = this;
        switch(GLOBAL.orderInfo.id){
            case '5':
                clsNum=self.compareSize(boxW,boxH,1270,890);
            break;
            case '0':
                clsNum=self.compareSize(boxW,boxH,1520,1020);
            break;
            case '1':
                clsNum=self.compareSize(boxW,boxH,1520,1140);
            break;
            case '2':
                clsNum=self.compareSize(boxW,boxH,1780,1270);
            break;
            case '3':
                clsNum=self.compareSize(boxW,boxH,2030,1520);
            break;
            case '34':
                clsNum=self.compareSize(boxW,boxH,1270,890);
            break;
            case '30':
                clsNum=self.compareSize(boxW,boxH,1520,1020);
            break;
            case '31':
                clsNum=self.compareSize(boxW,boxH,1520,1140);
            break;
            case '32':
                clsNum=self.compareSize(boxW,boxH,1780,1270);
            break;
            case '33':
                clsNum=self.compareSize(boxW,boxH,2030,1520);
            break;
            case '8700':
                clsNum=self.compareSize(boxW,boxH,1520,1020);
            break;
            case '8701':
                clsNum=self.compareSize(boxW,boxH,2030,1520);
            break;
            case '8702':
                clsNum=self.compareSize(boxW,boxH,2540,2030);
            break;
            case '8694':
                clsNum=self.compareSize(boxW,boxH,1778,1270);
            break;
            case '8695':
                clsNum=self.compareSize(boxW,boxH,2030,1520);
            break;
            case '8696':
                clsNum=self.compareSize(boxW,boxH,2540,2030);
            break;
            case '8665':
                clsNum=self.compareSize(boxW,boxH,700,530);
            break;
            case '8667':
                clsNum=self.compareSize(boxW,boxH,830,650);
            break;
            case '8669':
                clsNum=self.compareSize(boxW,boxH,1000,750);
            break;
            case '8671':
                clsNum=self.compareSize(boxW,boxH,1200,900);
            break;
        }
        return { '1': ['img-ok',''], '0': ['img-waring','像素不足'], '-1': ['img-danger','像素严重不足'] }[clsNum];
    },
    compareSize:function(boxW,boxH,sizeW,sizeH){ /*比较尺寸*/
        if(boxW>sizeW && boxH>sizeH){
            return 1;
        }else if(boxW>=sizeW/2 && boxH>=sizeH/2){
            return 0;
        }else{
            return -1;
        }
    },
    autoScaleImg:function(imgboxID, boxW, sizeW, sizeH, w, h, cutPosition){ /*缩放尺寸*/
        //缩放图片尺寸 [参数：外层正方形盒子的宽，比例的长，比例的高，图片的长，图片的高,裁切的坐标]
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
    },
    picItemActionsEv:function(){ /*注册操作照片的事件*/
        var self = this;
        //center
        $('#pic-list-box').on('click','.pos-c', function () {
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
        $('#pic-list-box').on('click','.pos-r', function () {
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
        $('#pic-list-box').on('click','.pos-l', function () {
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
        $('#pic-list-box').on('click','.pos-t', function () {
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
        $('#pic-list-box').on('click','.pos-b', function () {
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
        $('#pic-list-box').on('click','.pos-lb', function () {
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
        $('#pic-list-box').on('click','.edit-position', function () {
            var $this = $(this);
            $(this).parents('.imgs-item-li').find('.action-btns').toggle();
        });

        //increase Num
        var autoIncreaseTimer = null;
        $('#pic-list-box').on('click', '.increase', function () {
            var $amoutWrap = $(this).parents('.mui-slider-cell').find('.amount');
            var guid = $(this).parents('.imgs-item-li').prop('id').substring(4);
            var amount = $amoutWrap.text();
            amount = (amount - 0 + 1);
            $amoutWrap.text(amount);
            photos[guid]['number'] = amount;
            self.sumAmount();
        });

        //decrease Num
        var autoDecreaseTimer = null;
        $('#pic-list-box').on('click','.decrease', function () {
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
            self.sumAmount();
        });

        //delete
        $('#pic-list-box').on('click','.btn-del', function(){
            if(confirm("是否确认删除相片？"))
            {
                var pBox = $(this).parents('.imgs-item-li');
                pBox.off().remove();
                var guid = pBox.prop('id').substring(4);
                photos[guid] = null;
                photos.length = photos.length - 1 === 0 ? 0 : photos.length - 1;
                var total = self.sumAmount();
                if(total===0){
                    Page.order.resetPicList();
                }
            }
        });
    }
};

Page.order = {
    options: {
        orderDatas: [], //orderID,paper,size,total
        subData: [],
        $orderListbox: $('#order-list-ul'),
        isFirstInit:true
    },
    init: function (photos) {
        this.options.$orderListbox.find('li+li').remove();
        if(this.options.isFirstInit){
           this.subOrder();
           this.addEvents();
           this.editUserEvent(); 
           this.options.isFirstInit=false;
        }


        $('.order-top-user span.taobao-name').text(GLOBAL.orderInfo.taobao);

        //显示订单信息：
        // 从缓存中取 判断是否已经上传照片,如果没有则不显示
        if (!photos.length) {
            this.options.$orderListbox.append('<li class="mui-table-view-cell mui-text-center c-888"><span>暂无订单信息</span></li>');
            return false;
        }

        var p, s, t, orderDatas = this.options.orderDatas;

        //从当前操作记录中取，或者更新
        if(GLOBAL.orderInfo.printType=='p'){
            p='拍立得'+GLOBAL.orderInfo.texture;
        }else if(GLOBAL.orderInfo.printType=='b'){
            p=GLOBAL.orderInfo.print+'版画';
        }else{
            p = { '柯达': '柯达皇家相纸', '富士': '富士晶彩相纸' }[GLOBAL.orderInfo.brand];
        }

        s = GLOBAL.orderInfo.size;
        t = GLOBAL.orderInfo.total;
        var orderId = GLOBAL.orderInfo.orderID;

        if (orderDatas.length) {//如果有历史订单信息
            for (var i in orderDatas) {
               if( orderDatas[i]==undefined ) continue;
                this.render(orderDatas[i]['paper'], orderDatas[i]['size'], orderDatas[i]['total'],i);
            }
        }

        if(GLOBAL.orderInfo.total<1) return false;
        if (GLOBAL.orderInfo.isNew) {//如果是新增记录
            orderDatas[orderId] = { 'paper': p, 'size': s, 'total': t };
            orderDatas.length = (orderDatas.length || 0) + 1;
            this.render(p, s, t, orderId);
            GLOBAL.orderInfo.isNew = false;
        } else {//如果是修改订单
            orderDatas[GLOBAL.orderInfo.orderID]['paper'] = p;
            orderDatas[GLOBAL.orderInfo.orderID]['size'] = s;
            orderDatas[GLOBAL.orderInfo.orderID]['total'] = t;
            $('#i' + GLOBAL.orderInfo.orderID).find('.paper').text('相纸：' +p);
            $('#i' + GLOBAL.orderInfo.orderID).find('.size').text('尺寸：' +s);
            $('#i' + GLOBAL.orderInfo.orderID).find('.total span').text('数量：' +t+'张');
        }
    },
    addEvents: function () {
        var oThis = this;
        $('#addOrder').off().on('click', function(){oThis.addOrder.bind(oThis)()});
        $('#page-subResult').on('click',function(){
            $(this).removeClass('in').addClass('out'); return false;
        });
    },
    render: function (paper, size, total, orderID) {
        var orderInfoHtml = [];
        orderInfoHtml.push('<li class="mui-table-view-cell" id="i' + orderID + '"><ul>');
        orderInfoHtml.push('<li class="paper">相纸：' + paper + '</li>');
        orderInfoHtml.push('<li class="size">尺寸：' + size + '</li>');
        orderInfoHtml.push('<li class="total"><span>数量：' + total + '张</span><a class="mui-inline mui-pull-right order-del" href="javascript:void(0)">删除</a></li></ul></li>');
        this.options.$orderListbox.append(orderInfoHtml.join(''));

        //注册删除事件
        this.delOrderEvent();
    },
    subOrder: function () {
        var oThis = this;
        $('#subOrder').off().click(function () {
            var $this = $(this);
            if($.trim($this.text())!='确认订单') return false;

            var data = oThis._buildData();
            if (!photos.length) {
                $.msg.tip('请上传照片，创建订单！','#alert-box',4000,'yellow');
                return false;
            }
            console.log(data);
            //异步提交数据，处理返回数据
            //禁用按钮
            $this.html('<span class="mui-icon mui-icon-spinner-cycle mui-spin"></span> 提交中');
            $.post(GLOBAL.ReqURL['orderSub'], data, function (res) {
                console.log(res);
                if (res.indexOf('|') > 0) {
                    // $.msg.tip('订单提交成功！','#alert-box',4000,'green');
                    var href = window.location.href;
                    $('#page-subResult').removeClass('out').addClass('in').find('.editeUrl')
                    .text(href.substring(0,href.indexOf('?')+1)+'id='+res.split('|')[1]);;

                    //清空数据：重置orderInfo, 清空图片列表, 清空Photos数据
                    var taobao = GLOBAL.orderInfo.taobao;
                    oThis.resetOrderInfo(taobao);
                    oThis.resetPicList();
                    oThis.resetOrderList();
                    photos = Page.cart.options.photos=[];
                    oThis.options.orderDatas=oThis.options.subData=[];
                } else {
                    $.msg.tip('提交失败：'+res.substring(0,20),'#alert-box',4000,'red');
                }
                //启用按钮
                 $this.html('确认订单');
            });
        });
    },
    addOrder: function () {
        //重置orderInfo
        var taobao = GLOBAL.orderInfo.taobao;
        this.resetOrderInfo(taobao);

        //回到首页
        $('section.page').removeClass('page-active page-prev').addClass('page-next').first().removeClass('page-next').addClass('page-active');

        //清空图片列表
        this.resetPicList();
    },
    delOrderEvent:function(){
        var oThis = this;
        $('#order-list-ul .order-del').off().on('click',function(){
            if(confirm('是否确认删除该订单？')){
                var $box = $(this).parents('.mui-table-view-cell');
                var orderID = $box.prop('id').substring(1);

                //循环photos,查找与orderID相匹配的记录，并清空
                for(var key in photos){
                    if(!photos[key]) continue;
                    if(photos[key]['orderID']==orderID){
                        photos[key]=undefined;
                        photos.length = photos.length===0?0:photos.length-1;
                    }
                }

                oThis.options.orderDatas[orderID]=undefined;
                oThis.options.orderDatas.length = oThis.options.orderDatas.length===0?0:oThis.options.orderDatas.length-1;
                //如果是历史订单
                //如果是当前订单
                if(orderID == GLOBAL.orderInfo.orderID){
                    var taobao = GLOBAL.orderInfo.taobao;
                    oThis.resetOrderInfo(taobao);
                    oThis.resetPicList();
                }
                $box.off().remove();

                //判断当前是否还有订单，没有订单，则提示暂无订单
                if(!($('#order-list-ul .mui-table-view-cell').length)){
                    oThis.resetOrderList();
                }
            }
        });
    },
    _buildData: function () {
        //获取数据，拼接数据
        var temp = [];
        temp.push('<photos>');
        for (var i in photos) {
            if(!photos[i]) continue;
            temp.push('<photo>');
            temp.push('<guid>' + i + '</guid>');
            temp.push('<state>' + photos[i]['state'] + '</state>');
            if(photos[i]['state']===1){
                temp.push('<x>' + photos[i]['x'] + '</x>');
                temp.push('<y>' + photos[i]['y'] + '</y>');
                temp.push('<width>' + photos[i]['width'] + '</width>');
                temp.push('<height>' + photos[i]['height'] + '</height>');
            }
            temp.push('<param>' + photos[i]['param'] + '</param>');
            temp.push('<goods>' + photos[i]['goods'] + '</goods>');
            temp.push('<number>' + photos[i]['number'] + '</number>');
            temp.push('<imageWidth>' + photos[i]['imageWidth'] + '</imageWidth>');
            temp.push('<imageHeight>' + photos[i]['imageHeight'] + '</imageHeight>');
            temp.push('</photo>');
        }
        temp.push('</photos>');

        temp = temp.join('');
        console.log(temp);
        temp = encodeURIComponent(temp);

        subData = {
            'name': GLOBAL.orderInfo.brand + GLOBAL.orderInfo.size,
            'taobao': GLOBAL.orderInfo.taobao,
            'order': temp,
            'editID': '',
            'editUrl': GLOBAL.orderInfo.editUrl
        };
        return subData;
    },
    resetOrderInfo:function(taobao){
        GLOBAL.orderInfo = $.extend({},GLOBAL.orderInfo_temp); 
        GLOBAL.orderInfo['taobao']=taobao;
        GLOBAL.orderInfo['isNew']=true;
        GLOBAL.orderInfo['orderID'] = Utils.newGuid().ToString('D'); 
        Page.index.init();
    },
    resetPicList:function(){
        $('#pic-list-box').html('<li id="cart-temp-info"><br><h3 class="mui-text-center c-888">请上传您的相片！</h3><br></li>');
        $('#sumAmount').text('0');
    },
    resetOrderList:function(){
        $('#order-list-ul').html('<li class="mui-table-view-divider">订单信息</li><li class="mui-table-view-cell mui-text-center c-888"><span>暂无订单信息</span></li>');
    },
    editUserEvent:function(){
        var $editDia = $('#dialog-editTB');
        $('#btn-editTB').on('click',function(){
            var $dialog = $('#dialog-editTB');
            $dialog.addClass('active');
            var $whichModal = $dialog.find('section.modal');
            $whichModal.css({ "display": "block" });
            setTimeout(function () { $whichModal.addClass('modal-in'); }, 100);
            $('#txt_editTB').val(Utils.getCookie('taobao')).focus();
        });

        $editDia.find('.btn-cancel').on('click',function(){
            modalHidden($editDia);
        });

        $editDia.find('.btn-primary').on('click',function(){
            var name = $.trim($('#txt_editTB').val());
           if(name!==''){
                GLOBAL.orderInfo.taobao =name;
                Utils.setCookie('taobao',name);
                //更新每个页面的旺旺名：
                $('#cart-taobao').text(name);
                $('.order-top-user span.taobao-name').text(name);
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
    }
};

/*-------------------------程序主入口-----------------------------*/
$(function () {
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

    preInit();

    /* === 对话框 === */
    var $overlay = $('#dialog-login');

    $('#index-ok').click(function () {  
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
                Utils.setCookie('taobao',uName);
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
            Page.order.init(photos);
        }
    }
    $.pageTransition.init();

    Page.index.addEvents();
    Page.index.init();

    Utils.toggleShow('#brand-sum-t', '#brand-sum-c');
    Utils.toggleShow('#texture-sum-t', '#texture-sum-c');
});

function modalHidden($modalBox) {
    var $con = $modalBox.find('section.modal');
    $con.removeClass('modal-in');
    $con.css({ "display": "none" });
    $modalBox.removeClass('active');
};

function preInit(){
    //判断请求类型，初始化页面
    if(req_Id && 'spb'.indexOf(req_Id)!==-1 ){
        switch(req_Id){
            case "b":   //木版和水晶画 木[6,8,10] 水[7,8,10]
                $('#index-title').text('版画照片定制');
                //隐藏光面和绒面, 显示木版和水晶选项
                $('#print-box').css('display','block');
                //修改orderInfo中的类型
                GLOBAL.orderInfo.printType='b';
                GLOBAL.orderInfo.size = '8寸';
                GLOBAL.orderInfo.print = '木质';
                GLOBAL.orderInfo.res = '木质 8寸';
                GLOBAL.orderInfo.editUrl = '';
                //默认选木版画
                $('#print-box button').first().addClass('active');
                //显示6，8，10的尺寸，隐藏其它尺寸
                $('#size6,#size8,#size10').css('display','block');
                break;
            case 'p':   //拍立得 [3,4,5,6]
                $('#texture-box').css('display','block');
                $('#index-title').text('拍立得照片定制');
                $('#texture-sum-box').css('display','block');
                $('.defferend-box').show();
                //修改orderInfo中的类型
                GLOBAL.orderInfo.printType='p';
                GLOBAL.orderInfo.size = '3寸';
                GLOBAL.orderInfo.texture = '光面';
                GLOBAL.orderInfo.res = '光面 3寸';
                GLOBAL.orderInfo.editUrl = '';
                //显示3,4,5,6的尺寸，隐藏其它尺寸
                $('#size3,#size4,#size5,#size6').css('display','block');
                break;
            case 's':
                //显示3,4,5,6的尺寸，隐藏其它尺寸
                $('#brand-box').css('display','block');
                $('#texture-box').css('display','block');
                $('#index-title').text('数码冲印照片定制');
                 $('#texture-sum-box').css('display','block');
                $('#brand-sum-box').css('display','block');
                $('.defferend-box').show();
                $('#size7,#size8,#size5,#size6,#sizeQ6').css('display','block');
                GLOBAL.orderInfo.res = '柯达 5寸 光面';
                GLOBAL.orderInfo.editUrl = '';
                break;
        }
    }else{ //数据冲印 [5,6,7,8,Q6]
        $.msg.tip('请求地址错误！','#alert-box',4000,'red');
    }
    GLOBAL.orderInfo.editUrl = window.location.href;
    GLOBAL.orderInfo_temp = $.extend({},GLOBAL.orderInfo); 
}

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

function updatePhotoCutInfo(guid, x, y, width, height, islb) {
    photos[guid]['x'] = Math.abs(parseFloat(x));
    photos[guid]['y'] = Math.abs(parseFloat(y));
    photos[guid]['width'] = parseFloat(width);
    photos[guid]['height'] = parseFloat(height);
    photos[guid]['state'] = islb ? 2 : 1;
    console.log('guid: '+guid+' x: ' + photos[guid]['x'] + ' y: ' + photos[guid]['y'] + ' w: ' + photos[guid]['width'] + ' h: ' + photos[guid]['height']+' sate: '+photos[guid]['state']);
}


