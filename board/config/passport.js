var passport = require("passport");
var mongoose = require("mongoose");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require("../models/User");
var NaverStrategy = require('passport-naver').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;

//serialize & deserialize User
passport.serializeUser(function(user, done){
  done(null, user);
}); //passport.serializeUser는 login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분. 효율을 위해 user의 id만 session에 저장.
passport.deserializeUser(function(id, done){
  User.findOne({_id:id}, function(err, user){
    done(err, user);
  });
}); //passport.deserializeUser는 request시에 session에서 어떻게 user object를 만들지를 정하는 부분. 매번 request마다 user 정보를 db에서 새로 읽어오는데, user가 변경되면 바로 변경된 정보가 반영되는 장점이 있다.

//local Strategy
passport.use("local-login",
new LocalStrategy({
  usernameField : "username",
  passwordField : "password",
  passReqToCallback : true
},
function(req, username, password, done){
  User.findOne({username:username})
  .select({password:1})
  .exec(function(err, user) {
    if (err) return done(err);

    if(user && user.authenticate(password)){
      return done(null, user);
    } else {
      req.flash("username", username);
      req.flash("errors", {login:"Incorrect username or password"});
      return done(null, false);
    }
  });
}
)
);

passport.use('facebook-login',
new FacebookStrategy({
  clientID : '317250528715679',
  clientSecret : 'a44cae406ceea7acc78ad729b736201f',
  callbackURL : 'http://salarian.cf/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne({username:profile.id})
    .exec(function(err, user) {
      if (err) return done(err);

      if(user){
        return done(null, user);
      } else {
        var newUser = new User();
        newUser.username = profile.id;
        newUser.name = profile.displayName;
        newUser.token = accessToken;
        newUser.email = profile.email;
        newUser.from = 'facebook';
        newUser.password = '123caute$%^';

        newUser.save(function(err) {
          if (err) throw err;
          return done(null, newUser);
        });
      }
    });
  });
}));

passport.use('google-login',
new GoogleStrategy({
  clientID : '735938911453-c19fhctjdfjivld16tvvnrll4mh15ne8.apps.googleusercontent.com',
  clientSecret : 'ME6nAecXeQUHHdYUaD4WbAAL',
  callbackURL : 'http://salarian.cf/google/callback'
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    User.findOne({username:profile.id})
    .exec(function(err, user) {
      if (err) return done(err);

      if(user){
        return done(null, user);
      } else {
        var newUser = new User();
        newUser.username = profile.id;
        newUser.name = profile.displayName;
        newUser.token = accessToken;
        newUser.email = profile.email;
        newUser.from = 'google';
        //newUser.password = '123caute$%^';

        newUser.save(function(err) {
          if (err) throw err;
          return done(null, newUser);
        });
      }
    });
  });
}));

  passport.use('naver-login',
  new NaverStrategy({
    clientID : 'amP5NrxDbUTlFP_7PLUt',
    clientSecret : 'BSCHs6UXzL',
    callbackURL : 'http://salarian.cf/naver/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({username:profile.id})
      .exec(function(err, user) {
        if (err) return done(err);

        if(user){
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.username = profile.displayName;
          newUser.name = profile.displayName;
          newUser.token = accessToken;
          newUser.naver = profile._json;
          //newUser.from = 'naver';
          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use('kakao-login',
  new KakaoStrategy({
    clientID : '3603ce231cabc45f2e6e97b87eadaf7c',
    clientSecret : 'aoD4lATyvzrsR2NyN3OzJjnXCRP6coFu',
    callbackURL : 'http://salarian.cf/kakao/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({username:profile.id})
      .exec(function(err, user) {
        if (err) return done(err);

        if(user){
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.username = profile.id;
          newUser.name = profile.username;
          newUser.token = accessToken;
          newUser.kakao = profile.json;


          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));


module.exports = passport;
