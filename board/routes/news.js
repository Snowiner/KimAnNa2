var express = require('express');
var router = express.Router();
var User = require("../models/User");

var cheerio = require('cheerio');
var request = require('request');

var async = require('async');
var url = 'http://www.jobkorea.co.kr/goodjob/news';



router.get('/', function(req, ress) {





  request(url, function(err, response, html) {


    var link = [];
    var title = [];
    var des = [];
    var img = [];
    var imgg = []; //png빼버리기

    if (err) {
      throw err
    };

    var $ = cheerio.load(html);

    const $test = $('ul.joodJobList');



    // $('.cont_thumb .tit_thumb > a').each(function( i , elem){
    //   link[i] = $(this).attr("href");
    //   title[i] = $(this).text();
    // })
    $('dl > dt > a').each(function(i, elem) {
      link[i] = 'http://www.jobkorea.co.kr'+$(this).attr("href");
      title[i] = $(this).text();
    })


    $('dl > dd > a').each(function(i, elem) {
      des[i] = $(this).text();
    })

    $('p.thumb > a > img').each(function(i, elem) {
      img[i] = $(this).attr("src");


    });

    for (var i = 0; i < img.length; i++) {

      if (img[i].search(".png") == -1) {
        imgg.push(img[i]);

      }
    }



    console.log(title, link, imgg);
    ress.render("news/news", {
      link: link,
      title: title,
      des: des,
      img: imgg
    });


  })

});



module.exports = router;
