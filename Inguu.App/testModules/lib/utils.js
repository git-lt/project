/**
 * [Utils 工具类]
 * deps: jQuery2.0+
 */

window.Utils = {
    debounce: function (func, wait, immediate) {/*方法防抖*/
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
    newGuid: function (g, len) {/*生成唯一GUID*/
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
    refreshStringArr:function(sArr){/*刷新关联数组的数据，去掉空值，添加length*/
    	if(!sArr) return false;
    	var t=[],len=0;
    	for(var i in sArr){
    		if(sArr[i]){
    			t[i]=sArr[i];
    			len++;
    		}
    	}
    	t.length = len;
    	return t;
    },
    objectToXml:function (obj) {/*将json格式的模板数据转换为XML字符串*/
    	var xml = "";
    	for(var j in obj){
    		switch(j){
    			case "PageModel":
    			case "LayerModel":
    			case "Point":
    				xml += this.objectToXml(obj[j]);
    				break;
    			case "Layers":
    			case "Pages":
    			case "Points":
    				xml += "<" + j + ">";
	    			for (var item in obj[j]) {
	    				if(obj[j][item].length){
	    					for (var i = 0; i < obj[j][item].length; i++) {
	    						xml += "<" + item + ">" + this.objectToXml(obj[j][item][i]) + "</" + item + ">";
	    					};
	    				}else{
		    				xml += "<" + item + ">" + this.objectToXml(obj[j][item]) + "</" + item + ">";
	    				}
	    			};
    				
	    			xml += "</" + j + ">";
    				break;
    			case 'xmlns:xsi':
    			case 'xmlns:xsd':
    				break;
    			default:
    			xml+="<"+j+">" + obj[j] + "</"+j+">";

    		}
    	}
    	return xml;
    },
    isArray:function(obj){/*判断是否为数组*/
    	return  Array.isArray(obj);
    },
    objectToUrlpms:function(obj){/*将json数据转换为url参数字符串*/
    	var t = '?';
    	for(var i in obj){
    		t+=i+'='+obj[i]+'&';
    	}
    	return t.substring(0,t.length-1);
    },
    rgbToHex:function(rgbColor){/*将RGB颜色值转换为16进度颜色值*/
	   	rgb=rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

		function hex(x){ 
			return ("0"+parseInt(x).toString(16)).slice(-2); 
		} 

		rgb="#"+hex(rgb[1])+hex(rgb[2])+hex(rgb[3]); 

		return rgb; 
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
    },
    delCookie:function(name){/*删除cookie*/
        var exp = new Date();
	    exp.setTime(exp.getTime() - 1);
	    var cval=this.getCookie(name);
	    if(cval!='')
	        document.cookie= name + "="+escape(cval)+";expires="+exp.toGMTString();
    },
    getUrlQuery:function(url,queryName){/*根据key获取url中的参数值*/
        var reg = new RegExp("(^|&)" + queryName + "=([^&]*)(&|$)");
        var r = url.substring(url.indexOf("\?") + 1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },
    checkPicZize:function(tplW,tplH,picW,picH){
    	tplW = parseInt(tplW,10); tplH = parseInt(tplH,10);
    	picW = parseInt(picW,10); picH = parseInt(picH,10);

    	if(!(tplW && tplH && picW && picH)){
    		console.log('warn: one size is 0!');
    		return;
    	}

		if(picW<tplW && picH<tplH){
			if(picW<tplW/2 && picH<tplH/2){
				return -1; //像素严重不足
			}
			return 0; //像素不足
		}
		return 1; 	//像素正常
    },
    isSupportFixed:function(){/*判断浏览器是否支持fixed属性*/
	    var userAgent = window.navigator.userAgent, 
	        ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
	        ios5below = ios && ios[2] && (parseInt(ios[2].replace(/_/g, '.'), 10) < 5),
	        operaMini = /Opera Mini/i.test(userAgent),
	        body = document.body,
	        div, isFixed;

	    div = document.createElement('div');
	    div.style.cssText = 'display:none;position:fixed;z-index:100;';
	    body.appendChild(div);
	    isFixed = window.getComputedStyle(div).position != 'fixed';
	    body.removeChild(div);
	    div = null;

	    return !!(isFixed || ios5below || operaMini);
	},
    generateGUID:function(namespace) {/*生成带前缀的5位GUID*/
      var uid = namespace + '-' || 'ui-';
      do {
        uid += Math.random().toString(36).substring(2, 7);
      } while (document.getElementById(uid));

      return uid;
    },
    loadImg:function (url, callback) {
        var img = new Image();
        img.src = url;
        if (img.complete) {
            callback(img);
        } else {
            img.onload = function () {
                callback(img);
                img.onload = null;
            };
        };
    }
};


$.fn.emulateTransitionEnd = function(duration) {
  var called = false;
  var $el = this;

  $(this).one('webkitTransitionEnd', function() {
    called = true;
  });

  var callback = function() {
    if (!called) {
      $($el).trigger('webkitTransitionEnd');
    }
    $el.transitionEndTimmer = undefined;
  };
  this.transitionEndTimmer = setTimeout(callback, duration);
  return this;
};

$.fn.redraw = function() {
  $(this).each(function() {
    var redraw = this.offsetHeight;
  });
  return this;
};

