//绝对定位实现瀑布流效果
//定位算法
//滚动监听

window.onload = function(e){
	waterfall('main','pin');
	var timer = null,oldNum;
	window.onresize = function(){
		clearTimeout(timer);
		timer = setTimeout(waterfall('main','pin'),500);
	};

	var imgData = {'data':[{'src':'10.jpg'},{'src':'11.jpg'},{'src':'12.jpg'},{'src':'13.jpg'},{'src':'14.jpg'},{'src':'15.jpg'},{'src':'16.jpg'}]};

	window.onscroll = function(){
		if(checkScrollSide()){
			var newItems = [];
			for(var i in imgData.data){
				newItems.push('<div class="pin" style="position: static;">');
				newItems.push('<div class="box"><img src="../imgs/'+imgData.data[i]['src']+'" alt=""></div></div>');
			}
			getElebyId('main').innerHTML+=newItems.join('');
			waterfall('main','pin')
		}
	};
	function waterfall(parentID, pinCls){
		var oParent = getElebyId(parentID),
			oPins = getElsByCls(parentID,pinCls),
			pinW = oPins[0].offsetWidth,
			colNum = Math.floor(document.documentElement.clientWidth / pinW)||1;
		// if(!oldNum) oldNum =colNum;
		// if(oldNum === colNum || colNum===1) return false;
		// oldNum = colNum;

		console.log(colNum);
		// 设置盒子的大小
		oParent.style.cssText = 'width:'+(colNum*pinW+15)+'px; margin:0 auto;';

		var arrPinH = [],i=0,len=oPins.length;
		for(;i<len;i+=1){
			if(i<colNum){
				oPins[i].style.position='static';
				var pinH = oPins[i].offsetHeight
				arrPinH.push(pinH);
			}else{
				var minH = Math.min.apply(null,arrPinH);
				var minIndex = getMinIndex(arrPinH,minH);
				oPins[i].style.position = 'absolute';
				oPins[i].style.top = minH+'px';
				oPins[i].style.left = minIndex*pinW+'px';
				arrPinH[minIndex] += oPins[i].offsetHeight;
			}
		}

	}

	function checkScrollSide(){
		var oPins = getElsByCls('main','pin');
		var lastPinTop = oPins[oPins.length-1].offsetTop + Math.floor(oPins[oPins.length-1].offsetHeight/2);
		var scrollT = document.documentElement.scrollTop || document.body.scrollTop;
		var clientH = document.documentElement.clientHeight ||  document.body.clientHeight; 

		return lastPinTop < (scrollT + clientH);
	}

	function getMinIndex(arr,minVal){
		for(var i in arr){
			if(arr[i]==minVal)
				return i;
		}
	}


	function getElsByCls(parentID,clsName){
		var oParent = getElebyId(parentID);
		var oChildren = document.getElementsByTagName('*');
		var i=0,len=oChildren.length,objs=[];
		for(;i<len;i+=1){
			if(oChildren[i].className==clsName)
				objs.push(oChildren[i]);
		}
		return objs;
	}
	function getElebyId(id){
		return document.getElementById(id);
	}
};