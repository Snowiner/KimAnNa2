var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require("../config/passport");
var mongoose = require("mongoose");
var fs = require('fs');

var Schema = mongoose.Schema;

router.get("/", isLoggedIn, function(req, res){
  res.render("rec/reco", { user : req.user });
});

module.exports = router;

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.render("home/welcome");
}
