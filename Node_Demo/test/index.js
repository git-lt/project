var server = require('./server');
var router = require('./router');
var requestHandlers = require('./repuestHandlers');

var handler = {};
handler['/'] = requestHandlers.start;
handler['/start'] = requestHandlers.start;
handler['/upload'] = requestHandlers.upload;

server.serverStart(router.route,handler);