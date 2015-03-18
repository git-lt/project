define(function(require, exports, module){
	require('jquery');

	var DragSort = function(ele,option,index){
		this.$ele = $(ele);
		this.o = option;
		this.init(index);
	};
	var Pointer = function(x, y){
		this.x = x ;
		this.y = y ;
	};
	var Position = function(left, top){
		this.left = left ;
		this.top = top ;
	};

	DragSort.DEFAULTS={
		wrap:'.item_content',
		item:'li'
	};

	DragSort.prototype={
		init:function(i){
			//获取所有子项，将位置信息存储起来
			//将所有的子项绝对定位
			this.$ele.css('position','relative');

			this.setPosition();

			this.drag() ;
		},
		move:function(currentItem, callback){
			var $currItem = $(currentItem), i = $currItem.attr('index')>>0;
			$currItem.stop(true).animate({
				left : this.startPos[i][0],
				top : this.startPos[i][1]
			}, 200, function() {
				if(callback) callback.call(currentItem);
			}) ;
		},
		collisionCheck:function(currentItem){
			var direction = null,
				self = this,
				o = this.o,
				$currentItem = $(currentItem),
				i = $currentItem.attr('index');
			var cx = currentItem.pointer.x, cy = currentItem.pointer.y;
			$currentItem.siblings(o.imgItem).each(function() {
				var $this = $(this), 
					tIndex = $this.attr('index'), 
					tx = self.startPos[tIndex][0], ty = self.startPos[tIndex][1],
					offsetX = $this.offset().left, offsetY = $this.offset().top;

				// 返回对象和方向
				if( cx > offsetX && cy > offsetY && (cx < offsetX + $this.width()) && (cy < offsetY + $this.height()) ) {
					if(self.startPos[i][1] < ty) {
						direction = "down" ;
					} else if(self.startPos[i][1] > ty) {
						direction = "up" ;
					} else {
						direction = "normal" ;
					}
					self.swap(currentItem, direction, this) ;
				}
			});
		},
		swap:function(currentItem, direction, targetItem){
			if(targetItem.moveing) return false ;
			var o = this.o, self = this;
			var directions = {
				normal : function() {
					var ci = $(currentItem).attr('index'), ti = $(targetItem).attr('index');
					var temp = targetItem;
					targetItem = currentItem;
					currentItem = temp;

					$(targetItem).attr('index', ti);
					$(currentItem).attr('index', ci);
					self.move(currentItem);
				},
				down : function() {
					var startIndex = $(currentItem).attr('index')>>0;
					var endIndex = $(targetItem).attr('index')>>0;
					for(var i = endIndex; i > startIndex ; i--) {
						var prevNode = $(o.wrap+' '+o.item+'[index='+ (i-1) +']')[0];
						$(targetItem).attr("index", $(prevNode).attr('index')) ;
						self.move(targetItem);
						targetItem = prevNode ;
					}

					$(currentItem).attr("index", endIndex);
				},
				up : function() {
					var startIndex = $(targetItem).attr('index')>>0;
					var endIndex = $(currentItem).attr('index')>>0;
					for(var i = startIndex; i < endIndex; i++) {
						var nextNode = $(o.wrap+' '+o.item+'[index='+ (i + 1) +']')[0];
						$(targetItem).attr("index", $(nextNode).attr('index')) ;
						self.move(targetItem) ;
						targetItem = nextNode ;
					}
					$(currentItem).attr("index", startIndex) ;
				}
			}

			directions[direction]() ;
		},
		drag:function(){
			var oldPosition = new Position() ;
			var oldPointer = new Pointer() ;
			var isDrag = false ;
			var currentItem = null ;
			var o = this.o,self = this;

			this.$ele.on('touchstart', o.item, function(e){
				e.preventDefault() ;
				e = e.originalEvent.touches[0];
				oldPosition.left = $(this).position().left ;
				oldPosition.top =  $(this).position().top ;
				oldPointer.x = e.clientX ;
				oldPointer.y = e.clientY ;
				isDrag = true ;
				currentItem = this ;
			});



			$(document)[0].addEventListener('touchmove',function(e){
				e = e.touches[0];
				var currentPointer = new Pointer(e.clientX, e.clientY) ;
				if(!isDrag) return false ;
				$(currentItem).css({
					"opacity" : "0.8",
					"z-index" : 999
				}) ;
				var left = currentPointer.x - oldPointer.x + oldPosition.left ;
				var top = currentPointer.y - oldPointer.y + oldPosition.top ;
				$(currentItem).css({
					left : left,
					top : top
				});
				currentItem.pointer = currentPointer ;

				self.collisionCheck(currentItem);// 开始交换位置
			});
			
			$(document)[0].addEventListener('touchend',function(){
				if(!isDrag) return false ;
				isDrag = false ;
				self.move(currentItem, function() {
					$(this).css({
						"opacity" : "1",
						"z-index" : 0
					}) ;
				}) ;
			});
		},
		setPosition:function(){
			var self = this, items = this.$ele.find(this.o.item);
			
			self.startPos = [];

			items.each(function(){
				var $this = $(this);
				self.startPos.push([$(this).position().left,$(this).position().top])
			});

			items.each(function(i){
				$(this).attr('index',i).css({
					'position':'absolute',
					'left':self.startPos[i][0],
					'top':self.startPos[i][1]
				});
			});
		}
	};

	$.fn.dragSort = function(options){
		return this.each(function(index){
			var $this = $(this);
			var option = $.extend({},DragSort.DEFAULTS,typeof options == 'object' && options);
			var data = $this.data('dragSort');
			if(!data){
				$this.data('dragSort',(data = new DragSort(this,option,index)));
			}else{
				data.setPosition();
			}
		});
	}


});