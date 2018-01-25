var express = require('express');
var router = express.Router();
var User = require("../models/User");




router.get("/",function(req,res){
  if(req.isAuthenticated()){
    res.render("message/search");
  }else{
    //로그인 되어있지 않은 경우 => 로그인 페이지로 이동시킨다.
    var username = req.flash("username")[0];
    var errors = req.flash("errors")[0] || {};

    res.render("message/plzlogin",{username:username,
    errors:errors});
  }
});


router.post("/result",function(req,res){




  var username_ = req.body.userForm;

  console.log(username_);

  User.findOne({username:username_},function( err ,data ){


    if(err){

        res.send(err);

    }
    else{
      if( data === null ){

        res.render("message/nouser");
      }
      else {

        res.render("message/sending",{username_:username_});//username넘겨주고, 해당유저 체크 하게한후에
        //해당 유저에게 메세지 전송.

      }

    }
  });


/*
  User.findOne({_id:req.body.userForm}, function(err, post){
    if(err) return res.json(err);
    res.render("message/result", {post: });
  });
*/

});

router.post("/sending",function(req,res){

var content_ = req.body.messageForm;
var reciever = req.body.reciever;

console.log("쪽지내용 :"+content_);
console.log("수신자 :"+reciever);
if( content_ === null){
  //글자를 입력해 주세욧!
}
else{

  User.findOneAndUpdate({username:reciever},{$push:{"message":{sendFrom:req.user.username,content:content_}}}, {safe: true, upsert: true, new : true},function(err, post){
    if(err) return res.json(err);

    res.render("message/sendingSuccess",{username_:reciever});
  });


  }


//}




});

router.post("/sendMsg",function(req,res){
  res.render("message/sending",{username_:req.body.username_});
});

module.exports = router;
