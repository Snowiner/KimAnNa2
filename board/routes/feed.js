var express = require("express");
var router = express.Router();
var Feed = require("../models/Feed");
var util = require("../util");

feednumber = 0;

router.get("/", function(req, res){
  Feed.find({})
  .populate("author")
  .sort("-createdAt")
  .limit(3)
  .exec(function(err, feed){
    if(err) return res.json(err);
    res.render("feed/index", {feed:feed, user : req.user });
  });
});

router.get('/:number', function(req,res){
  Feed.find({})
  .populate('auther')
  .sort('-createdAt')
  .limit(parseInt(req.params.number))
  .exec(function(err,feed){
    if(err) return res.json(err);
    res.send(feed);
  })
})

//create feed

router.post("/create", function(req, res){
 Feed.create(req.body, function(err, feed){
  if(err){
    res.json(err);
    req.flash("feed", req.body);
    req.flash("errors", util.parseError(err));
    console.log("feed create fail");
  }
  feednumber++;
  res.redirect("/feed");
 });
});



module.exports = router;
