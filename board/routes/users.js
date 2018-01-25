var express = require("express");
var router = express.Router();
var User = require("../models/User");
var util = require("../util");

//Index //1
router.route("/").get(function(req, res){
  User.find({})
  .sort({username:1}) //sort는 username을 기준으로 내림차순한다.
  .exec(function(err, users){
    if(err) return res.json(err);
    res.render("users/index", {users:users});
  });
});

//New
router.get("/new", function(req, res){
  var user = req.flash("user")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("users/new", { user:user, errors:errors });
});

//create
router.post("/", function(req, res){
 User.create(req.body, function(err, user){
  if(err){
   req.flash("user", req.body);
   req.flash("errors", util.parseError(err)); // 1
   return res.redirect("/users/new");
  }
  res.render("users/confirm");
 });
});

//show
router.get("/:username", function(req, res){
  var ifFriend = "false";
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
      if(req.isAuthenticated())
      {
        if(!req.user.friends.indexOf(req.params.username))
        {
           ifFriend = "true";
        }
        res.render("users/show", {user:user, watcher:req.user, friend:ifFriend});
      }
      else
      {
        res.redirect("/login");
      }
  });
});

//쪽지 확인창.
router.get("/:username/checkmsg", function(req, res){

  User.findOne({_id:req.user._id}, function(err, user){
    if(err) return res.json(err);


    res.render("users/checkmsg", {user:user});
  });





});

router.post("/deletemsg",function(req,res){




  var checked = req.body.deleteCheck;
  var user = req.user.username;


  // console.log(checked);
  // console.log(user);
  if(isArray(checked)){
    checked.forEach(function(checked){

      User.findOneAndUpdate({username:user},{$pull:{"message":{'content':checked}}}
    ,function(err){
      if(err)throw err;


      });


  });
  }
  else{

    User.findOneAndUpdate({username:user},{$pull:{"message":{'content':checked}}}
  ,function(err){
    if(err)throw err;


    });
  }



  res.redirect("/users/"+user+"/checkmsg");
});

//edit
router.get("/:username/edit", function(req, res){
 var user = req.flash("user")[0];
 var errors = req.flash("errors")[0] || {};
 if(!user){
  User.findOne({username:req.params.username}, function(err, user){
   if(err) return res.json(err);
   res.render("users/edit", { username:req.params.username, user:user, errors:errors });
  });
 } else {
  res.render("users/edit", { username:req.params.username, user:user, errors:errors });
 }
});


//update //2
router.put("/:username",function(req, res, next){
 User.findOne({username:req.params.username})
 .select({password:1})
 .exec(function(err, user){
  if(err) return res.json(err);

    //update user object
    user.originalPassword = user.password;
    user.password = req.body.newPassword? req.body.newPassword : user.password; //2-3
    for(var p in req.body){ //2-4. user은 DB에서 읽어온 data이고, req.body가 실제 form으로 입력된 값이므로 각 항목을 덮어 쓰는 부분이다.
      user[p] = req.body[p];
    }

    //save updated user
    user.save(function(err, user){
     if(err){
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err)); // 1
      return res.redirect("/users/"+req.params.username+"/edit");
     }
     res.redirect("/users/"+req.params.username);
    });
   });
  });

module.exports = router;

//Functions
function parseError(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
  }
} else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0){
  parsed.username = { message:"This username already exists!" };
} else {
  parsed.unhandled = JSON.stringify(errors);
}
return parsed;
}

function isArray( val ){
  return val.constructor.toString().indexOf("Array")> -1;
}
