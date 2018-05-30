var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require("../config/passport");
var mongoose = require("mongoose");
var fs = require('fs');
var recombee = require('recombee-api-client');
var rqs = recombee.requests;
var client = new recombee.ApiClient('cseee', 'Iu0vEolBBN87uoMc0AeNdLAFv8itYuf3RnJRgGOoT3mLbumnjAJKW1f332CBMymT');

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

  var field = 0;
  if (req.body.field == "business") {
    field = 1;
  } else if (req.body.field == "construction") {
    field = 2;
  } else if (req.body.field == "contents") {
    field = 3;
  } else if (req.body.field == "design") {
    field = 4;
  } else if (req.body.field == "developer") {
    field = 5;
  } else if (req.body.field == "engineering") {
    field = 6;
  } else if (req.body.field == "game_developer") {
    field = 7;
  } else if (req.body.field == "investigation") {
    field = 8;
  } else if (req.body.field == "law") {
    field = 9;
  } else if (req.body.field == "marketing") {
    field = 10;
  } else {
    field = 11;
  }

  var english = req.body.q22_input22;
  var score = req.body.q20_input20;
  var job = req.body.detail;
  var userID = req.user.username;



  //client.send(new rqs.AddUser(userID));


  client.send(new rqs.Batch([// new rqs.ResetDatabase(),
      new rqs.AddUserProperty('school', 'int'),
      new rqs.AddUserProperty('career', 'int'),
      new rqs.AddUserProperty('english', 'string'),
      new rqs.AddUserProperty('score', 'int'),
      new rqs.AddUserProperty('job', 'string'),
      new rqs.AddUserProperty('field', 'int')
    ]))
    .then((responses) => {

      client.send(new rqs.SetUserValues(
        userID, {
          'school': school,
          'career': career,
          'english': req.body.q22_input22,
          'score': score,
          'job': req.body.detail,
          'field': field
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
      new rqs.AddItemProperty('id_', 'string'),
      new rqs.AddItemProperty('school', 'int'),
      new rqs.AddItemProperty('career', 'int'),
      new rqs.AddItemProperty('TOEIC', 'int'),
      new rqs.AddItemProperty('TOEFL', 'int'),
      new rqs.AddItemProperty('TEPS', 'int'),
      new rqs.AddItemProperty('job', 'string'),
      new rqs.AddItemProperty('field', 'int'),
      new rqs.AddItemProperty('img', 'string')
    ]))
    .then((responses) => {

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
///////////////////////////////////////////////////////////////////////
var english_filter = "'" + req.body.q22_input22 + "'" + "<=" + score;
var school_filter = "'" + 'school' + "'" + "<=" + school ;
var career_filter = "'" + 'career'+ "'"  + "<=" + career ;
 var field_filter = "'" + 'field' + "'" + "==" + field ;

console.log(field);
  client.send(new rqs.RecommendItemsToUser(userID, 4, {
    'filter':
   '('+ english_filter +')and('+
   school_filter +')and('+
   career_filter +')and('+
   field_filter +')',
   'returnProperties': true,
   'cascadeCreate': true

    }))
    .then((recommended) => {

      // var rec = recommended;
      // console.log(rec[0].itemId);
      // User.findOneAndUpdate({
      //     username: req.user.username
      //   }, {
      //     $push: {
      //       "recommendation": {
      //         job: rec[0].itemId
      //       }
      //     }
      //   }, {
      //     safe: true,
      //     upsert: true,
      //     new: true,
      //     strict: false
      //   },
      //   function(err, post) {
      //
      //     if (err) return res.json(err);
      //   });
      //
      var company_list = [];
      for( var i=0; i< recommended.recomms.length; i++){
        console.log(recommended.recomms[i].values.id_);

        company_list.push(recommended.recomms[i].values.id_)
      }

      res.render("rec/sending", {
        recommended: recommended,company_list:company_list
      });


    });



  // res.render("rec/sending");
});



router.post("/result", function(req, res) {
  var itemId_r = req.body.itemId;
  // var job_r = req.body.job;

  console.log(itemId_r);

  client.send(new rqs.AddPurchase(req.user.username, itemId_r, { //optional parameters:
    'cascadeCreate': true,
  }));


  res.render("rec/result", {
    itemId_r: itemId_r
  });
});



module.exports = router;

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.render("home/welcome");
}
