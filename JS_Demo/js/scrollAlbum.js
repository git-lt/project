/**
 * Created by LT on 2014/9/14.
 * Plugin Name: scrollAlbum.js -v1.0.0.
 * Email: 935486956@qq.com
 */

var util={
    query: function(selector, ele){
        var ele = ele || document,
            firstStr = selector.charAt(0),
            eleSelector = selector.substring(1);

        this.eles=[];

        if(ele.querySelectorAll){
            return this.eles = ele.querySelectorAll(selector);
        }
        switch (firstStr){
            case '#':
                return this.eles.push( ele.getElementById(eleSelector));
            case '.':
                if(ele.getElementsByClassName){
                    return this.eles = ele.getElementsByClassName(eleSelector);
                }else{
                    return this.eles = getByClass(eleSelector,document);
                }
            default :
                return this.eles = ele.getElementsByTagName(selector);
        }
        var getByClass=function(sClass,oParent){
            var oParent = oParent || document,
                allEle = oParent.getElementsByTagName('*'),
                resultEle=[];

            for(var i= 0,len = allEle.length; i<len; i++){
                if(sClass.indexOf(allEle[i].className)>0){
                    resultEle.push(allEle[i]);
                }
            }

            return resultEle;
        }
    },
    css: function(){},
    addClass: function(){},
    removeClass: function(){}
}

util.event={
    getEvent:function(e){return e || window.event;},
    getTarget:function(e){return e.target|| e.srcElement;},
    preventDefault:function(e){e.preventDefault ? e.preventDefault() : e.returnValue = false;},
    stopPropagation:function(e){e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;},
    getButton:function(e){
        if(document.implementation.hasFeature('MouseEvents','2.0')){
            return e.button;
        }else{
            switch (e.button){
                case 0:
                case 1:
                case 3:
                case 5:
                case 7:
                    return 0;//左键
                case 2:
                case 6:
                    return 2;//中键
                case 4:
                    return 1;//右键
            }
        }
    },
    getRelatedTarget:function(e){
        if(e.relatedTarget){
            return e.relatedTarget;
        }else if(e.toElement){
            return e.toElement;
        }else if(e.fromElement){
            return e.fromElement;
        }else{
            return null;
        }
    },
    addHandler:function(ele,type,fn){
        if(ele.addEventListener){
            ele.addEventListener(type,fn,false)
        }else if(ele.attachEvent){
            ele.attachEvent('on' + type,fn);
        }else{
            ele['on' + type] = handler;
        }
    },
    removeHandler:function(ele,type,fn){
        if(ele.removeEventListener){
            ele.removeEventListener(type,fn,false);
        }else if(ele.detachEvent){
            ele.detachEvent('on' + type,fn);
        }else{
            ele['on' + type] = null;
        }
    },
    once:function(){},
    debunce:function(){}
};
