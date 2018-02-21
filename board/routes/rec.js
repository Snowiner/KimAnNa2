var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require("../config/passport");
var mongoose = require("mongoose");
var fs = require('fs');
var recombee = require('recombee-api-client');
var rqs = recombee.requests;
var client = new recombee.ApiClient('uderrick', 'yV2p6Ds2MLbXE3WRCrGTGHl6J3H3XyZ1uP38xbqUXkIthp1WIKV1FCEWaTEAgwWp');


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

  var school = req.body.q21_input21;
  var career = req.body.q23_input23;
  var english = req.body.q22_input22.toLowerCase();
  var score = req.body.q20_input20;
  var job = req.body.detail;
  var userID = req.user.username;


  console.log(school, career, english, score, userID, job);

  //client.send(new rqs.AddUser(userID));

  client.send(new rqs.Batch([ //new rqs.ResetDatabase(),
      new rqs.AddUserProperty('school', 'string'),
      new rqs.AddUserProperty('career', 'string'),
      new rqs.AddUserProperty('english', 'string'),
      new rqs.AddUserProperty('score', 'int'),
      new rqs.AddUserProperty('job', 'string')
    ]))
    .then((responses) => {

      client.send(new rqs.SetUserValues(
        userID, {
          'school': req.body.q21_input21,
          'career': req.body.q23_input23,
          'english': req.body.q22_input22.toLowerCase(),
          'score': score,
          'job': req.body.detail
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      //return client.send(new rqs.Batch(requests));
    })

  client.send(new rqs.Batch([
      new rqs.AddItemProperty('school', 'string'),
      new rqs.AddItemProperty('career', 'string'),
      new rqs.AddItemProperty('toeic', 'int'),
      new rqs.AddItemProperty('toefl', 'int'),
      new rqs.AddItemProperty('teps', 'int'),
      new rqs.AddItemProperty('job', 'string')
    ]))

    .then((responses) => {

      client.send(new rqs.SetItemValues(
        "Johnshopkins", {
          'school': '4년제 대학 졸업',
          'career': '5년 이상',
          'toeic': 900,
          'toefl': 100,
          'teps': 880,
          'job': '의사'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      client.send(new rqs.SetItemValues(
        "Samsung-sds", {
          'school': '4년제 대학 졸업',
          'career': '5년 이상',
          'toeic': 700,
          'toefl': 80,
          'teps': 700,
          'job': '보안 개발자'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      client.send(new rqs.SetItemValues(
        "LG-CNS", {
          'school': '4년제 대학 졸업',
          'career': '3년 이상',
          'toeic': 750,
          'toefl': 70,
          'teps': 800,
          'job': '파이썬 개발자'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      client.send(new rqs.SetItemValues(
        "SK", {
          'school': '4년제 대학 졸업',
          'career': '신입',
          'toeic': 750,
          'toefl': 80,
          'teps': 700,
          'job': 'PHP 개발자'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      client.send(new rqs.SetItemValues(
        "Google_korea", {
          'school': '4년제 대학 졸업',
          'career': '5년 이상',
          'toeic': 900,
          'toefl': 120,
          'teps': 800,
          'job': '네트워크 관리자'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      client.send(new rqs.SetItemValues(
        "Nexon", {
          'school': '4년제 대학 졸업',
          'career': '3년 이상',
          'toeic': 700,
          'toefl': 80,
          'teps': 700,
          'job': '유니티 개발자'
        },
        //optional parameters:
        {
          'cascadeCreate': true // Use cascadeCreate for creating user
          // with given userId, if it doesn't exist
        }
      ));
      //return client.send(new rqs.Batch(requests));
    })

//console.log("갺",english,score);
  client.send(new rqs.ItemBasedRecommendation('LG-CNS', 1, {
    'targetUserId':userID,
    //'filter': "'job' = job"
  }))
  .then((recommended) => {
    console.log(recommended);
  });






  res.render("rec/sending");
});



module.exports = router;

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.render("home/welcome");
}
