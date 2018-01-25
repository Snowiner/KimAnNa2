var express = require("express");
var router = express.Router();
var Post = require("../models/Post");
var util = require("../util");

//index
router.get("/", function(req, res){
  Post.find({})
  .populate("author")
  .sort("-createdAt")
  .exec(function(err, posts){
    if(err) return res.json(err);
    res.render("posts/index", {posts:posts});
  });
});

//new
router.get("/new", function(req, res){
  if(req.isAuthenticated())
  {
    var author = req.user._id;
    var post = req.flash("post")[0] || {};
 var errors = req.flash("errors")[0] || {};
 res.render("posts/new", { author:author, post:post, errors:errors });
  }
  else
  {
    res.redirect("/login");
  }
});



//create
router.post("/create", function(req, res){
 Post.create(req.body, function(err, post){
  if(err){
    res.json(err);
   req.flash("post", req.body);
   req.flash("errors", util.parseError(err));
   console.log("post create fail");
   //return res.redirect("/posts/new");
  }
  res.redirect("/posts");
 });
});

//show
router.get("/:id", function(req, res){
  if(req.isAuthenticated())
  {
    watcher = req.user._id;
  }
  else
  {
    watcher = 1;
  }
  Post.findOne({_id:req.params.id})
  .populate("author")
  .exec(function(err, post){
    if(err) return res.json(err);
    if(!post.author)
      {
        res.redirect("/posts");
      }
      else
      {
        res.render("posts/show", {post:post, watcher:watcher});
      }
  });
});

//edit
router.get("/:id/edit", function(req, res){
 var post = req.flash("post")[0];
 var errors = req.flash("errors")[0] || {};
 if(!post){
  Post.findOne({_id:req.params.id}, function(err, post){
   if(err) return res.json(err);
   res.render("posts/edit", { post:post, errors:errors });
  });
 } else {
  post._id = req.params.id;
  res.render("posts/edit", { post:post, errors:errors });
 }
});

//updated
router.put("/:id", function(req, res){
 req.body.updatedAt = Date.now();
 Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
  if(err){
   req.flash("post", req.body);
   req.flash("errors", util.parseError(err));
   return res.redirect("/posts/"+req.params.id+"/edit");
  }
  res.redirect("/posts/"+req.params.id);
 });
});
//destroy
router.delete("/:id", function(req, res){
  Post.remove({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect("/posts");
  });
});

module.exports = router;
