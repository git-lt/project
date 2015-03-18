var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours()].join(''));

fis.config.set('modules.postpackager', 'simple');
fis.config.set('pack', {
    'pkg/main.css':[
    	'/css/animate.css',
    	'/css/com.css',
    	'/css/base.css',
    	'/css/page.css'
    ]
});
fis.config.set('settings.postpackager.simple.autoCombine', true);
fis.config.merge({
    roadmap : {
        project : {
            fileType : {
                text : 'js, css'
            }
        },
        path:[{
		        reg: /.*\.(js|css)$/,
		        query: '?t=${timestamp}',
		        release:'/Scripts$&',
		        useHash: false,
                useSprite: true,
                needWrap : false        //需要自动define包装
		    },{
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
                    drop_console:true
                },
                mangle:{
                    //export, module, require不压缩变量名
                    except: 'exports, module, require, define'
                }
            }
        }
    }
});
