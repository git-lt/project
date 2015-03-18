define(function(require, exports, module) {
	var Mobilebone = require('mobilebone'), Fun = {};

	Fun.pageIndex = require("./moduls/p-index");
	Fun.pagePhoto = require("./moduls/p-photo");
	Fun.pagePreview = require("./moduls/p-preview");

	//页面首次加载的回调
	Mobilebone.onpagefirstinto = function(page_in) {
		if(page_in.id =='pageIndex' && Fun[page_in.id]){
			Fun['pageIndex'].preInit.init();
			Fun['pageIndex'].pIndex.init();
		}else{
			Fun[page_in.id] && Fun[page_in.id].init(page_in);
		}
	};

	Mobilebone.init();
	
	//页面跳转控制
	Mobilebone.transitionBefore = function(page_in){
		if(Fun[page_in.id]){
			switch(page_in.id){
				case 'pagePhoto':
					//是否已经选择模板 是否已经填写旺旺名
					var r = Fun['pagePhoto'].hasChkTplAndName();
					if(r===true){
						return true;
					}else if(r === 'tplNull'){
						Utils.debounce(function(){$('#tipBox').msgTip('请选择一个模板！',4000,'yellow');},400)();
						return false;
					}else if(r === 'nameNull'){
						$.msg.prompt({
								title:'asdfasdf',
								onConfirm:function($ipt){
									var tName = $ipt.val();
									if($.trim(tName)!==''){
						                GLOBAL.orderInfo.taobao = tName;
										Utils.setCookie('taobao',tName,30);
										$.msg.prompt().hide();
									}else{
										$ipt.addClass('ipt-error').one('webkitAnimationEnd',function(){
											$(this).removeClass('ipt-error');
										});
									}
								}
						}).show();
						return false;
					}
				case 'pagePreview':
					if(Fun['pagePreview'].hasPhotos()===true){//已经上传照片
						return true;
					}else{//没有上传照片
						Utils.debounce(function(){$('#tipBox').msgTip('请上传您的相片！',4000,'yellow');},400)();
						return false;
					}
				default: return true;
			}
		}
	}


	//页面跳转后的回调
	Mobilebone.callback = function(page_in, page_out) {
		// page_in
		var id_in = page_in.id, id_out = "";
		var ele_link_in = null, ele_link_out = null;

		if (ele_link_in = document.querySelector(".footer a[href$="+ id_in +"]")) {
			// ele_link_in.parentNode.classList.add("active");
			ele_link_in.classList.add("active");
		}

		if(page_in.id == 'pagePreview'){ Fun[page_in.id].init(); }

		// page_out
		if (page_out) {
			id_out = page_out.id;
			ele_link_out = id_out && document.querySelector(".footer a[href$="+ id_out +"]");
			// ele_link_out && ele_link_out.parentNode.classList.remove("active");
			ele_link_out && ele_link_out.classList.remove("active");
		}
	}
});