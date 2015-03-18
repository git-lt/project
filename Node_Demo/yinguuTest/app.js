var server = require('./node/server');
var router = require('./node/router');
var requestHandler  = require('./node/requestHandler');


var handler = {};
handler['/'] = requestHandler.start;
handler['/start'] = requestHandler.start;
handler['/upload'] = requestHandler.upload;
handler['/show'] = requestHandler.show;

server.serverStart(router.route, handler);
