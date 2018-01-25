var express = require("express");
var router = express();
//var Search = require("../models/Search");
var User = require("../models/User");
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended:false}));

//get search
router.get("/", function(req, res){
  var target = [];
  res.render("search/index",{
    list:target
  });
});

//post search
router.post("/", function(req,res){
  var target = req.body.search_target;
  User.find({
  	"name":{$regex:target, $options:"$i"}
  },{"username":true})
  .sort({username:1})
  .exec(function(err, users){
    if(err) return res.json(err);
    res.render("search/index", {list:users});
  });
})

module.exports = router;