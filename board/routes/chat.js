// fundamental requirements
var express = require("express");
var router = express.Router();

// built in functions
var path = require('path');

// exporting
module.exports = router;

// CODES

// home page
router.get("/", function(req, res){
    res.render(path.join(__dirname, '../views/chat', 'index.ejs'));
    
});

router.get("/getUser", function(req,res){
	if(req.user)
	{
		console.log(req.user);
		res.send(req.user._id);
	}
	else
	{
		console.log("anonymous");
		res.send("anonymous");
	}
});

router.get("/getUserName", function(req,res){
	if(req.user)
	{
		console.log(req.user);
		res.send(req.user.name);
	}
	else
	{
		console.log("anonymous");
		res.send("anonymous");
	}
});