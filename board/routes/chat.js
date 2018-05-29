// fundamental requirements
var express = require("express");
var router = express.Router();

// including socket.io
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// built in functions
var path = require('path');

// exporting
module.exports = router;

// CODES

// home page
router.get("/", function(req, res){
    res.render(path.join(__dirname, '../views/chat', 'index.ejs'));
    
});

// chat basic
io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('chat message', function(msg)
	{
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});

	socket.on('disconnect',function()
	{
		console.log('a user disconnected');
	});
});