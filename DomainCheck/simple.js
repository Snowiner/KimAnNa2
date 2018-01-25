var express = require('express');
var app = express();

app.listen(80, function(req, res){
	console.log("server running at 80");
});

app.get("/",function(req,res){
	res.send("HelloWOrld");
});

