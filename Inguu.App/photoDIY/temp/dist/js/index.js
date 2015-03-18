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
    }
};

//全局对象
GLOBAL.orderInfo = {
    orderID: Utils.newGuid().ToString('D'),    //订单编号
    id: "5",            //产品id
    brand: '柯达',    //品牌
    texture: '光面',  //材质
    size: '5寸',         //尺寸
    taobao: window.localStorage.taobao || '',   //旺旺名
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

//页面类 
Page.index = {
    default: {
        $brand: $('#brand-chk-box .brand'),
        $brandImg: $('#brand-chk-box .brand-img'),
        $texture: $('#brand-chk-box .texture'),
        $textureImg: $('#brand-chk-box .texture-img'),
        $print:$('#print-box .print'),
        $printImg:$('#print-box .print-img'),
        $size: $('#size-chk-box button.size'),
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
        o.$size.filter('button[data-val="' + GLOBAL.orderInfo.size + '"]').click();
        // .addClass('checked').find('span').addClass('mui-icon-checkmarkempty');

        o.$resBox.text('定制信息：' + GLOBAL.orderInfo.res)
    },
    addEvents: function () {
        var o = this.default, oThis = this;

        o.$brand.on('click', function (e) { oThis._choiceBrandImg.bind(this, o, oThis)();return false;}  );
        o.$texture.on('click', function (e) { oThis._choiceTextureImg.bind(this, o, oThis)(); return false;}  );
        o.$size.on('click', function (e) { oThis._choiceSize.bind(this, o, oThis)(); return false;}  );
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
        o.$brandImg.attr('src', imgUrl);

        var rm = $(this).parent().siblings().find('button');
        rm.removeClass('checked');
        rm.find('span').removeClass('mui-icon-checkmarkempty');

        $(this).addClass('checked');
        $(this).find('span').addClass('mui-icon-checkmarkempty');
        console.log(GLOBAL.orderInfo);
    },
    _choiceTextureImg: function (o, oThis) {
        var val = $(this).data('val'),
            imgUrl = val == '光面' ? "/images/paperface-g.jpg":"/images/paperface-r.jpg";
        GLOBAL.orderInfo.texture = val;

        oThis.showSelected(o);
        o.$textureImg.attr('src', imgUrl);

        var rm = $(this).parent().siblings().find('button');
        rm.removeClass('checked');
        rm.find('span').removeClass('mui-icon-checkmarkempty');

        $(this).addClass('checked');
        $(this).find('span').addClass('mui-icon-checkmarkempty');

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
                o.$size.filter('button[data-val="6寸"]').click();
            }
        }else{
            $('#size6').css('display','none');
            $('#size7').css('display','block');
            if(GLOBAL.orderInfo.size=='6寸'){
                GLOBAL.orderInfo.size = '7寸';
                o.$size.filter('button[data-val="7寸"]').click();
            }
        }


        var rm = $(this).parent().siblings().find('button');
        rm.removeClass('checked');
        rm.find('span').removeClass('mui-icon-checkmarkempty');

        $(this).addClass('checked');
        $(this).find('span').addClass('mui-icon-checkmarkempty');
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
        var rm = $(this).parent().siblings().find('button');
        rm.removeClass('checked');
        rm.find('span').removeClass('mui-icon-checkmarkempty');

        $(this).addClass('checked');
        $(this).find('span').addClass('mui-icon-checkmarkempty');

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
        photos: []
    },
    init: function () {
        $('#cart-paper').text(GLOBAL.orderInfo.res);
        $('#cart-taobao').text(GLOBAL.orderInfo.taobao);
        sumAmount();
    }
};

Page.order = {
    options: {
        orderDatas: [], //orderID,paper,size,total
        subData: [],
        $orderListbox: $('#order-list-ul')
    },
    init: function (photos) {
        this.options.$orderListbox.find('li+li').remove();
        this.subOrder();
        this.addEvents();
        this.editUserEvent();
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
            var data = oThis._buildData();
            if (!photos.length) {
                alert('请上传照片，创建订单！');
                return false;
            }
            console.log(data);
            //异步提交数据，处理返回数据
            $.post(GLOBAL.ReqURL['orderSub'], data, function (res) {
                console.log(res);
                if (res.indexOf('|') > 0) {
                    alert('订单提交成功！');
                    //清空数据：重置orderInfo, 清空图片列表, 清空Photos数据
                    var taobao = GLOBAL.orderInfo.taobao;
                    oThis.resetOrderInfo(taobao);
                    oThis.resetPicList();
                    oThis.resetOrderList();
                    photos = Page.cart.options.photos=[];
                    oThis.options.orderDatas=oThis.options.subData=[];
                } else {
                    alert('提交失败：'+res.substring(0,20));
                }
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
        temp.push('<photos><mobile></mobile>');
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
    // FastClick.attach(document.body);
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
            Page.order.init(Page.cart.options.photos);
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
    // var req = Utils.getUrlQuery(window.location.href,'req');
    if(req_Id &&req_Id in ['s','p','b']){
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
                $('#size7,#size8,#size5,#size6,#sizeQ6').css('display','block');
                GLOBAL.orderInfo.res = '柯达 5寸 光面';
                GLOBAL.orderInfo.editUrl = '';
                break;
        }
        $('#size-sum-box').css('display','block');

    }else{ //数据冲印 [5,6,7,8,Q6]
        alert('请求地址错误！');
    }
    GLOBAL.orderInfo.editUrl = window.location.href;
    GLOBAL.orderInfo_temp = $.extend({},GLOBAL.orderInfo); 
}
