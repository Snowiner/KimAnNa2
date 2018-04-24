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
    if(req.user != null){
      res.render("feed/index", {feed:feed, user : req.user });
    }
    else{
      res.redirect("login");
    }
    
  });
});

//Getting feeds

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

// Like and disLike
router.get('/disLike/:number',function(req,res){
  User.update(
    {_id:req.user._id},
    {
      $pull:
      {
        like_feeds:req.params.number
      }
    }
  ).exec(function(err,user){
    if(err) return res.json(err);
  });

  Feed.update(
    {_id:req.params.number},
    {
      $pull:
      {
        like_users:req.user._id
      },
      $inc:
      {
        like_count:-1
      }
    }
    ).exec(function(err,feed){
        if(err) return res.json(err);
      }
    );
});

router.get('/addLike/:number',function(req,res){
  User.update(
    {_id:req.user._id},
    {
      $push:
      {
        like_feeds:req.params.number
      }
    }
  ).exec(function(err,user){
    if(err) return res.json(err);
  });

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

// like check
router.get('/ifLike/:number', function(req,res){
  var query = Feed.find({_id:req.params.number});

  query.exec(function(err,feed){
    if(err) return res.json(err);

    console.log(feed[0].commentIdList);
    if( ArrayInclude(req.user._id,feed[0].commentIdList) ){
      res.send('true');
    }
    else{
      res.send('false');
    }
  })
})

// get Comments
router.get('/getComments/:number',function(req,res){
  var query = Feed.find({_id:req.params.number});

  query.exec(function(err,feed){
    if(err) return res.json(err);

    console.log(feed[0].commentIdList)

    if (feed[0].commentIdList == '[]'){
      res.send('[]');
    }else{
      res.send(feed[0].commentIdList);
    }
    

  });
})

//get single comment
router.get('/getComment/:number',function(req,res){
  console.log(req.params.number);
  var query = Comment.find({_id:req.params.number});

  query.exec(function(err,comment){
    if(err) return res.json(err);

    console.log(comment[0]);

    if(comment[0] != null)
    {
      var resText = '';
      resText += `<#_id#>`+comment[0]._id+`<@_id@>`;
      resText += `<#body#>`+comment[0].body.replace(/\r\n/gi,'<br>')+`<@body@>`;
      resText += `<#author#>`+comment[0].author+`<@author@>`;
      resText += `<#like_users#>`+comment[0].like_users+`<@like_users@>`;
      resText += `<#like_count#>`+comment[0].like_count+`<@like_count@>`;
      console.log(resText);
      res.send(resText);
    }
    else
    {
      res.send('noData');
    }
  });
})

//create comment
router.post("/:number/comment", function(req,res){
  Comment.create(req.body, function(err,comment){
    
    if(err){
      res.json(err);
      req.flash("comment",req.body);
      req.flash("errors", util.parseError(err));
      console.log("comment create fail");
    }

    else
    {
      console.log(comment._id);
      console.log(req.params.number);
      
      Feed.update
      (
        {_id:req.params.number},
        {
          $push:
          {
            commentIdList:comment._id
          }
        }
      ).exec(function(err,feed){
        if(err) return res.json(err);
        else{
          console.log(comment);
          res.redirect("/feed");
        }
      });
    }

    
  });
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

function ArrayInclude(value,array){
  for(i in array){
    if(array[i] == value){
      return true;
    }
  }
  return false;
}