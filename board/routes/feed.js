var express = require("express");
var router = express.Router();
var Feed = require("../models/Feed");
var User = require("../models/User");
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

// router.get('/:number', function(req,res){
//   Feed.find({})
//   .populate('auther')
//   .sort('-createdAt')
//   .limit(parseInt(req.params.number))
//   .exec(function(err,feed){
//     if(err) return res.json(err);
//     res.send(feed);
//   })
// })
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
      res.send(feed[0]);
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

router.get('addLike/:number',function(req,res){
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



module.exports = router;
