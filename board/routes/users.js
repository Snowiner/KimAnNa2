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
  var friendList = [];

  User.findOne({_id:req.params.username}, function(err, user){
    if(err) return res.json(err);
      if(req.isAuthenticated())
      {
        if(!user){
          console.log('userless');
        }
        if(!req.user.friends.indexOf(req.params.username))
        {
           ifFriend = "true";
        }
        console.log(user.friends);

        // var findName = function(userId){
        //   return new Promise(function(resolved,rejected){
        //     if(){

        //     }
        //     else
        //     {
        //       rejected(Error(err));
        //     }
        //   });
        // }
        var ready1 = function(userId){
          return new Promise(function(res,rej){
              User.find({_id:userId}).exec(function(err,users){
                if(err) return rej(new Error('ready1 error '+userId+'\n'));
                friendList.push({id:userId, name:users[0].username});
                console.log('ready : '+users[0].id);
                res();
              });
          });
        }

        // var ready2 = function(list){
        //   return new Promise.all(list.map(function(user){
        //       return ready1(user);
        //     }));
        // }
       
        // ready2(user.friends).then(function(){
        //   console.log('done');
        // })
        Promise.all(user.friends.map(function(users){
          return ready1(users);
        })).then(function(){
          console.log('done');
          console.log(friendList);
          res.render('users/show',{user:user, watcher:req.user, friend:ifFriend, list:friendList});
        })

        // var p1 = Promise.resolve(3);
        // var p2 = 1337;
        // var p3 = new Promise(function(res,rej){
        //   setTimeout(res,100,'foo');
        // });

        // Promise.all([p1,p2,p3]).then(function(values){
        //   console.log(values);
        // })

        //ready1(user.friends[0]);
        //res.render("users/show", {user:user, watcher:req.user, friend:ifFriend, User : User});
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
  if(checked != null)
  {
    // console.log("not null");
    if(isArray(checked))
    {
      checked.forEach(function(checked)
      {

        User.findOneAndUpdate(
          {username:user},
          {$pull:
            {"message":
            {'content':checked}}}
          ,function(err)
          {
            if(err)throw err;

          });
      });
    }
    else
    {
      User.findOneAndUpdate({username:user},{$pull:{"message":{'content':checked}}}
    ,function(err){
      if(err)throw err;
      });
    }
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
  if(val != null)
  {
    return val.constructor.toString().indexOf("Array")> -1;
  }
  else
  {
    return;
  }
}
