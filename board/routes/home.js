var express = require("express");
var router = express.Router();
var passport = require("../config/passport");
var User = require("../models/User");
var mongoose = require("mongoose");
var fs = require('fs');

var job_list = require("./job_list");

var Schema = mongoose.Schema;

//home
router.get("/", isLoggedIn, function(req, res) {




  var rand_arr = [];
  var rand = [];

  for(var i =0 ; i < job_list.length ; i++){
    if( i%2 == 0){
      rand_arr.push(i);
    }
  }


  for (var i = 0; i < 4; i++) {
    var ident = 0;
    var rand_num = Math.floor((Math.random() * (rand_arr.length)));
    for (var j = 0; j < rand.length; j++) {

      if (rand[j] == rand_arr[rand_num] ) {
        ident = 1;
        i--;
        break;
      }


    }
     if(ident == 0){
      rand.push(rand_arr[rand_num]);
    }

  }
  console.log(rand, job_list.length);

  res.render("home/welcome", {
    user: req.user,
    job_list: job_list,
    rand : rand
  });
});

router.get("/google594bfaf90762a8d5.html", function(req, res) {
  fs.readFile(`google594bfaf90762a8d5.html`, function(error, data) {
    if (error) {
      console.log(error);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(data);
    }
  })
})

//addFriend
router.post("/addFriend", function(req, res) {
  User.update({
      _id: req.user._id
    }, {
      $push: {
        friends: req.body.target
      }
    },
    function(err, post) {
      if (err) return res.json(err);
      res.redirect("/users/" + req.user.id);
    }
  );
});

//login
router.get("/login", function(req, res) {
  var username = req.flash("username")[0];
  var errors = req.flash("errors")[0] || {};
  res.render("home/login", {
    username: username,
    errors: errors
  });
});

//Post login
router.post("/login",
  function(req, res, next) {
    var errors = {};
    var isValid = true;
    if (!req.body.username) {
      isValid = false;
      errors.username = "Username is required!";
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = "Password is requierd!";
    }

    if (isValid) {
      next();
    } else {
      req.flash("errors", errors);
      res.redirect("/login");
    }
  },
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login"
  }));

router.get("/facebook", passport.authenticate("facebook-login", {
  scope: ['public_profile', 'email']
}));
router.get("/facebook/callback", passport.authenticate("facebook-login", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

router.get("/google", passport.authenticate("google-login", {
  scope: ['profile', 'email']
}));
router.get("/google/callback", passport.authenticate("google-login", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

router.get("/naver", passport.authenticate("naver-login", {
  scope: ['naver']
}));
router.get("/naver/callback", passport.authenticate("naver-login", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

router.get("/kakao", passport.authenticate("kakao-login", {
  scope: ['profile']
}));
router.get("/kakao/callback", passport.authenticate("kakao-login", {
  successRedirect: "/",
  failureRedirect: "/login"
}));
//logout
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


module.exports = router;

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.render("home/welcome");
}
