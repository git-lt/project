//基于Bootstrap3.0的分页插件
;(function(window,document,$,undefined){ 'use strict';
	$.fn.buildNavPages=function(options){
		return this.each(function(){
			var $this = $(this);
			var data = $this.data('pageSettings');
			if(!data) $this.data('pageSettings',(data=new BuildNavPages(this,options)));
		});
	};

	var BuildNavPages=function(element,options){
		this.$element = $(element);
		this.options = $.extend({},$.fn.buildNavPages.defaults,options);
		this.init(this.options);
	}
	BuildNavPages.prototype = {
		constructor:BuildNavPages,

		init:function(options){
			this.options = options,
			this.currentPages = this.getPages(this.options.startPage);

			if(this.options.startPage<1||this.options.startPage>this.options.totalPages){
				throw new Error ('起始页码配置不正确');
			}

			if(this.options.totalPages<=0){
				throw new Error('总页数不能小于0');
			}

			//如果不设置可显示的页数或者设置的页数不为数字，那么显示所有的页码
			if(!$.isNumeric(this.options.visiblePages)&&!this.options.visiblePages){
				this.options.visiblePages = this.options.totalPages;
			}

			if(this.options.onPageClick instanceof Function){
				this.$element.bind('page',this.options.onPageClick);
			}

			var tagName = this.$element.prop('tagName');
			if(tagName==="UL"){
				this.$listContainer = this.$element;
			}else{
				this.$listContainer = $('<ul></ul>');
			}

			this.$listContainer.addClass(this.options.paginationClass);

			this.$listContainer.append(this.buildListItems(this.currentPages.numeric));

			if(tagName!=='UL'){
				this.$element.append(this.$listContainer);
			}

			this.show(this.options.startPage);
		},
		show:function(page){
			if (page < 1 || page > this.options.totalPages) {
                throw new Error('页码错误');
            }

			this.render(this.getPages(page));

			this.setEvents();

			this.$element.trigger('page',page);//给自定义的page事件传递一个参数：当前页码
		},
		buildListItems:function(pages){
			var $listItems=$();

			if(this.options.first){/*首页*/
				$listItems = $listItems.add(this.buildItem('first',1));
			}

			if(this.options.prev){/*上一页*/
				$listItems = $listItems.add(this.buildItem('prev',1));
			}

			for (var i = 0; i < pages.length; i++) {/*中间的页码*/
				$listItems = $listItems.add(this.buildItem('page',pages[i]));
			};

			if(this.options.next){/*下一页*/
				$listItems = $listItems.add(this.buildItem('next',2));
			}

			if(this.options.last){/*尾页*/
				$listItems = $listItems.add(this.buildItem('last',this.options.totalPages));
			}

			return $listItems;
		},
		buildItem:function(type,page){
			var itemContainer = $('<li></li>'),
				itemContent = $('<a></a>'),
				itemText=null;
			itemContainer.addClass(type);
			itemContainer.attr('data-page',page);
			switch (type) {
				case 'page':
					itemText = page;
					break;
				case 'first':
					itemText = this.options.first;
					break;
				case 'last':
					itemText = this.options.last;
					break;
				case 'prev':
					itemText = this.options.prev;
					break;
				case 'next':
					itemText = this.options.next;
					break;
				default:
					break;
			}

			itemContainer.append(itemContent.attr('href',this.options.href).text(itemText));

			return itemContainer;
		},
		getPages:function(currentPage){
			var pages = [],
				half = Math.floor(this.options.visiblePages/2),
				start = currentPage - half+1 - this.options.visiblePages%2,
				end = currentPage+half;
			if(start<=0){
				start=1;
				end = this.options.visiblePages;
			}
			if(end>this.options.totalPages){
				end= this.options.totalPages;
				start = this.options.totalPages - this.options.visiblePages+1;
			}
			while (start<=end){
				pages.push(start);
				start++;
			}

			return {'currentPage':currentPage,'numeric':pages}
		},
		render:function(pages){
			//比较上一次与这一次生成的页码数组是否相同，不同，则移除容器中的内容，重新生成页码
			if(!this.equals(this.currentPages.numeric,pages.numeric)){
				this.$listContainer.children().remove();
				this.$listContainer.append(this.buildListItems(pages.numeric));
				this.currentPages = pages;
			}

			//设置样式
			this.$listContainer.find('.page').removeClass('active');
			this.$listContainer.find('.page').filter('[data-page="'+pages.currentPage+'"]').addClass('active');
			this.$listContainer.find('.first').toggleClass('disabled',pages.currentPage===1);
			this.$listContainer.find('.last').toggleClass('disabled',pages.currentPage===this.options.totalPages);

			var prev = pages.currentPage-1;
			this.$listContainer.find('.prev').toggleClass('disabled',pages.currentPage===1).data('page',prev>1?prev:1);
			var next = pages.currentPage+1;
			this.$listContainer.find('.next').toggleClass('disabled',pages.currentPage===this.options.totalPages)
			.data('page',next <this.options.totalPages?next:this.options.totalPages);
		},
		setEvents:function(){
			var base = this;
			this.$listContainer.find('li').each(function(){
				var $this= $(this);
				$this.off();
				if($this.hasClass('disabled')||$this.hasClass('active')) return;
				$this.click(function(){
					base.show(parseInt($this.data('page'),10));
				});
			});
		},
		equals:function(oldArray,newArray){
			var i=0;
			while((i<oldArray.length)||(i<newArray.length)){
				if(oldArray[i]!== newArray[i]){
					return false;
				}
				i++;
			}
			return true;
		},
		href:function(){}
	};

	var old = $.fn.buildNavPages;
	$.fn.buildNavPages.defaults={
		totalPages:10,
		startPage:1,
		visiblePages:7,
		href:'javascript:void(0)',
		prev:'上一页',
		next:'下一页',
		first:'首页',
		last:'尾页',
		paginationClass:'pagination',
		onPageClick:null
	};

	$.fn.buildNavPages.prototype.Constructor=BuildNavPages;

	//调用这个方法，可以防止与其它插件冲突
	$.fn.buildNavPages.noConfict=function(){
		$.fn.buildNavPages=old;
		return this;
	}

})(window,document,jQuery);
	