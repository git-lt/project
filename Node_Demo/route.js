

var parseURL = require('url').parse;

var routes = {get:[], post:[], head:[], put:[], delete:[]};

//注册路由规则：
exports.map = function(dict){
	if(dict && dict.url && dict.controller){
		var method = dict.method ? dict.method.toLowerCase(): 'get';

		routes[method].push({
			u:dict.url,
			c:dict.controller,
			a:dict.action || 'index'
		});
	}
}

//获取请求信息
exports.getActionInfo = function (url, method){
	var r = {controller:null, action:null, args:null},
		method = method ? method.toLowerCase() : 'get',
		pathname = parseURL(url).pathname;
	var m_routes = routes[method];

	for(var i in m_routes){
		r.args = m_routes[i].u.exec(pathname);
		if(r.args){
			r.controller = m_routes[i].c;
			r.action = m_routes[i].a;
			r.args.shift();
			break;
		}
	}

	return r;


}
