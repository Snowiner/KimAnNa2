var express = require("express");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();
var MongoStore = require('connect-mongo')(session);

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);

});


//DB setting

mongoose.connect(process.env.MONGO_DB,{useMongoClient: true});


var db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

//Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:"MySecret",
                store: new MongoStore({mongooseConnection: mongoose.connection,
                                       ttl: 2 * 24 * 60 * 60})}));  // session은 서버에서 접속자를 구분시키는 역할을 한다. user1과 user2가 웹사이트를 보고 있는 경우
//해당 유저들을 구분하여 서버에서 필요한 값들을 따로 관리하게 된다. flash에 저장되는 값 역시 user1이 생성한 flash는 user1에게,
//user2가 생성한 flash는 user2에게 보여져야 하기 때문에 session이 필요하다.

//passport
app.use(passport.initialize());
app.use(passport.session());

//Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

//routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));
app.use("/search", require("./routes/search"));
app.use("/message", require("./routes/message"));
app.use("/news", require("./routes/news"));
app.use("/feed", require("./routes/feed"));


//Port setting
app.listen(80, function(){
  console.log("server on!");
});
