var express = require('express');
var router = express.Router();
var User = require("../models/User");
var passport = require("../config/passport");
var mongoose = require("mongoose");
var fs = require('fs');
var recombee = require('recombee-api-client');
var rqs = recombee.requests;
var client = new recombee.ApiClient('csee', 'mkQHj8YcBaHnGyTimeUrsIPTtXNnL39s68ArLgkojjcGllJXOPacbQryBbVHI14R');


var Schema = mongoose.Schema;

router.get('/load/:name', isLoggedIn, function(req,res){
    res.render('rec/'+req.params.name);
});

router.get("/", isLoggedIn, function(req, res) {
  res.render("rec/reco", {
    user: req.user
  });
});

router.post("/sending", isLoggedIn, function(req, res) {

  var school = req.body.q21_input21;
  var career = req.body.q23_input23;
  var english = req.body.q22_input22;
  var score = req.body.q20_input20;
  var job = req.body.detail;
  var userID = req.user.username;


  console.log(school, career, english, score, userID, job);

  //client.send(new rqs.AddUser(userID));

  client.send(new rqs.Batch([new rqs.ResetDatabase(),
      new rqs.AddUserProperty('school', 'string'),
      new rqs.AddUserProperty('career', 'string'),
      new rqs.AddUserProperty('english', 'string'),
      new rqs.AddUserProperty('score', 'int'),
      new rqs.AddUserProperty('job', 'string')
    ]))
.then((responses) => {

      client.send(new rqs.SetUserValues(
        userID,
        {
            'school':  req.body.q21_input21,
            'career': req.body.q23_input23,
            'english': req.body.q22_input22,
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
    new rqs.AddItemProperty('english', 'string'),
    new rqs.AddItemProperty('job', 'string')
  ]))

  .then((responses) => {

        client.send(new rqs.SetItemValues(
          "Sony",
          {
              'school':  '4년제 대학 졸업',
              'career': '5년 이상',
              'english': 'TOEFL',
              'job': '의사'
            },
            //optional parameters:
            {
              'cascadeCreate': true // Use cascadeCreate for creating user
              // with given userId, if it doesn't exist
            }
          ));
            //return client.send(new rqs.Batch(requests));
  })

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
