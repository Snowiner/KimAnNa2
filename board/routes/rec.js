var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require("../config/passport");
var mongoose = require("mongoose");
var fs = require('fs');
var recombee = require('recombee-api-client');
var rqs = recombee.requests;
var client = new recombee.ApiClient('uderrick', 'yV2p6Ds2MLbXE3WRCrGTGHl6J3H3XyZ1uP38xbqUXkIthp1WIKV1FCEWaTEAgwWp');

var job_list = require("./job_list");

var Schema = mongoose.Schema;

router.get('/load/:name', isLoggedIn, function(req, res) {
  res.render('rec/' + req.params.name);
});

router.get("/", isLoggedIn, function(req, res) {
  res.render("rec/reco", {
    user: req.user
  });
});

router.post("/sending", isLoggedIn, function(req, res) {
  var school = 0;
  if (req.body.q21_input21 == "4년제 대학 졸업") {
    school = 4;
  } else if (req.body.q21_input21 == "전문 대학 졸업") {
    school = 2;
  } else {
    school = 1;
  }

  var career = 0;
  if (req.body.q23_input23 == "신입") {
    career = 1;
  } else if (req.body.q23_input23 == "3년 미만") {
    career = 3;
  } else if (req.body.q23_input23 == "5년 미만") {
    career = 5;
  } else {
    career = 7;
  }

  var english = req.body.q22_input22;
  var score = req.body.q20_input20;
  var job = req.body.detail;
  var userID = req.user.username;



  //client.send(new rqs.AddUser(userID));


  client.send(new rqs.Batch([ //new rqs.ResetDatabase(),
      new rqs.AddUserProperty('school', 'string'),
      new rqs.AddUserProperty('career', 'string'),
      new rqs.AddUserProperty('english', 'string'),
      new rqs.AddUserProperty('score', 'int'),
      new rqs.AddUserProperty('job', 'string'),
      new rqs.AddUserProperty('field', 'string')
    ]))
    .then((responses) => {

      client.send(new rqs.SetUserValues(
        userID, {
          'school': req.body.q21_input21,
          'career': req.body.q23_input23,
          'english': req.body.q22_input22,
          'score': score,
          'job': req.body.detail,
          'field': req.body.field
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      //return client.send(new rqs.Batch(requests));
    })

  client.send(new rqs.Batch([ //new rqs.ResetDatabase(),
      new rqs.AddItemProperty('school', 'int'),
      new rqs.AddItemProperty('career', 'int'),
      new rqs.AddItemProperty('TOEIC', 'int'),
      new rqs.AddItemProperty('TOEFL', 'int'),
      new rqs.AddItemProperty('TEPS', 'int'),
      new rqs.AddItemProperty('job', 'string'),
      new rqs.AddItemProperty('field', 'string'),
      new rqs.AddItemProperty('img', 'string')
    ]))
    .then((responses) => {


      console.log("자 갑니다~");


      console.log(job_list.length);

      for (var i = 0; i < job_list.length; i = i + 2) {
        client.send(new rqs.SetItemValues(
          job_list[i], job_list[i + 1], {
            'cascadeCreate': true
          }
        ));

      }
    });

  // client.send(new rqs.AddPurchase(userID,itemID, {
  //   'cascadeCreate': true
  // }));

  var english_filter = "'" + req.body.q22_input22 + "'" + "<=" + score;
  var school_filter = "'" + 'school' + "'" + "<=" + school;
  var career_filter = "'" + 'career' + "'" + "<=" + career;

  client.send(new rqs.UserBasedRecommendation(userID, 10, {
      'filter': english_filter,
      school_filter,
      career_filter,
      'returnProperties': true
    }))
    .then((recommended) => {

      // console.log(recommended);
      res.render("rec/sending", {
        recommended: recommended
      });


    });



  // res.render("rec/sending");
});



module.exports = router;

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.render("home/welcome");
}
