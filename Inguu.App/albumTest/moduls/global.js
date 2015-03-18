/* 全局对象 */
window.GLOBAL={
	orderInfo:{		//订单信息 [会在p-index.js中的 preinit中重置]
			orderID: '',    			//订单编号
		    proID: 0,       			//产品id
		    tplID: null,				//当前模板ID
		    tplXmlUrl:'',				//模板的xmlurl
		    typeName:'',
		    typeID: null,
		    pageCount:5,
		    currPage:0,
		    pageTotal:0,
		    taobao: '',  				//旺旺名
		    total: 0,   				//照片总数量
		    isNew: true,    			//是否为当前订单
		    editUrl:'',
		    autoAddPic:false
	},
	reqURL:{ 		//请求的地址
		root:'http://api.inguu.com',
		// getStyleURL:'http://api.inguu.com/Mould/GetTypeList?typeclass=2&shop=64',
		getStyleURL:'http://api.inguu.com/Mould/GetTypeList?typeclass=2',
		getTplsURL:'http://api.inguu.com/Mould/getlist',
	    ttfURL:'http://api.inguu.com/font/GetList',
	    getFontPicURL:'http://api.inguu.com/font/GetFontPic',
	    proxyURL:'/tool/ProxyXml',
	    picSubURL: '/photo/UploadPhoto',
	    orderSubURL:'/Photo/UploadOrder',
	    imgSrc:'/Temp/'
	},
	Photo:function(pms){	//图片信息对象
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
	},
	photos:[] 		//图片在模板中的位置信息
}
