//Step 1. 取消下面的注释开启simple插件，注意需要先进行插件安装 npm install -g fis-postpackager-simple
fis.config.set('modules.postpackager', 'simple');

//通过pack设置干预自动合并结果，将公用资源合并成一个文件，更加利于页面间的共用

//Step 2. 取消下面的注释开启pack人工干预
fis.config.set('pack', {
    'pkg/mui.css':[
        '/lib/mui-0.5.9/css/mui.min.css',
        '/lib/mui-0.5.9/css/oa.css'
    ]
});

//Step 3. 取消下面的注释可以开启simple对零散资源的自动合并
fis.config.set('settings.postpackager.simple.autoCombine', true);


//设置文件后缀为时间缀
var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours()].join(''));

// domain : "http://zhigui.inguu.com",
fis.config.merge({
	project : {
        fileType : {
            text : 'js, css'
        }
    },
    roadmap : {
        // domain : "http://115.236.10.222:8000/test",
        path:[{
		        reg: /.*\.(js|css)$/,
		        query: '?t=${timestamp}',
		        release:'/Scripts$&',
		        useHash: false
		    }
		    ,{
		        reg: '**.html',
		        useCache: false
		    },{
		        reg: /.*\.(jpg|png|gif)$/,
		        useHash: false
		    }]
    },
    settings:{
        optimizer:{
            'uglify-js':{
                compress:{
                    //压缩时过滤console.log调整信息
                    drop_console:false
                }
            }
        }
    }
});

//Step 4. 取消下面的注释开启图片合并功能
// fis.config.set('roadmap.path', [{
//     reg: '**.css',
//     useSprite: true
// }]);
// fis.config.set('settings.spriter.csssprites.margin', 20);

//后缀名的less的文件使用fis-parser-less编译
// fis.config.set('modules.parser.styl', 'stylus');
// //将less文件编译为css
// fis.config.set('roadmap.ext.styl', 'css');

