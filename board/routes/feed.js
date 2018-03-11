var express = require("express");
var router = express.Router();
var Feed = require("../models/Feed");
var User = require("../models/User");
var util = require("../util");
var Comment = require("../models/Comment");

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

router.get('/get/:number',function(req,res){
  if(req.user)
  {
    if(req.user.friends[0] != null)
    {
      if(req.user.friends.find(function(element){
        return element == req.user._id;
      }) != req.user._id)
      {
        req.user.friends.push(req.user._id);
        console.log('self friended');
        console.log(req.user.friends);
      }
      else
      {
        console.log('already done');
      }
      console.log(req.user.friends);
       var query = Feed.find({author: req.user.friends});
    
    }
    else
    {
      var query = Feed.find({});
    }
   
  }
  else
  {
    var query = Feed.find({});
  }
  
  query.sort('-createdAt');
  query.skip(parseInt(req.params.number));
  query.limit(1);

  query.exec(function(err,feed){
    if(err) return res.json(err);
    

    console.log(feed[0]);
    if(feed[0] != null)
    {
      var resText = '';
      resText += `<#_id#>`+feed[0]._id+`<@_id@>`;
      resText += `<#body#>`+feed[0].body.replace(/\r\n/gi,'<br>')+`<@body@>`;
      resText += `<#author#>`+feed[0].author+`<@author@>`;
      resText += `<#like_users#>`+feed[0].like_users+`<@like_users@>`;
      resText += `<#like_count#>`+feed[0].like_count+`<@like_count@>`;
      resText += `<#createdDate#>`+feed[0].createdDate+`<@createdDate@>`;
      console.log(resText);
      res.send(resText);
    }
    else
    {
      res.send('noData');
    }
    
  })
})

router.get('/getId/:number',function(req,res){
  var query = User.find({_id:req.params.number});
  query.exec(function(err,user){
    if(err){
      res.send("Invalid User");
      return res.json(err);
    }

    res.send(user[0].username);
  })
})

router.get('/addLike/:number',function(req,res){
  
  console.log('liking');
  Feed.update(
    {_id:req.params.number},
    {
      $push:
      {
        like_users:req.user._id
      },
      $inc:
      {
        like_count:1
      }
    }
    ).exec(function(err,feed){
        if(err) return res.json(err);
      }
    );
});

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

router.post("/:number/comment",function(req,res){
  Comment.create(req.body,function(err,comment){
    if(err) res.json(err);

    res.redirect('/feed');
  })
})


module.exports = router;
