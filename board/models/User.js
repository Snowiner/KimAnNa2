// models/User.js

var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");  //1
var Schema = mongoose.Schema;

// schema // 1
var userSchema = mongoose.Schema({
        username:{
        type:String,
        trim:true,
        unique:true
      },
      password:{
        type:String,
        select:false
      },
      name:{
        type:String,
        match:[/^.{3,12}$/,"Should be 3-12 characters!"],
        trim:true
      },
      email:{
        type:String,
        match:[/^[a-zA-Z0-9,_%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,"Should be a valid email address!"],
        trim:true
      },
      message:[{
        sendFrom:String,
        content:String,
        date:{type: Date, default: Date.now}
      }],
      from: { type: String, defaultTo: 'local' },
      token: { type: String },
      friends:[String]
  },{
 toObject:{virtuals:true}
});

// virtuals // 2
userSchema.virtual("passwordConfirmation")
.get(function(){ return this._passwordConfirmation; })
.set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual("originalPassword")
.get(function(){ return this._originalPassword; })
.set(function(value){ this._originalPassword=value; });

userSchema.virtual("currentPassword")
.get(function(){ return this._currentPassword; })
.set(function(value){ this._currentPassword=value; });

userSchema.virtual("newPassword")
.get(function(){ return this._newPassword; })
.set(function(value){ this._newPassword=value; });

// password validation // 3
var passwordRegex = /^(?=.*[a-zA-Z])((?=.*\d)|(?=.*\W)).{6,20}$/; // 2-1
var passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!"; // 2-2

userSchema.path("password").validate(function(v) {
 var user = this;
/*
 // create user // 3-3
 if(user.isNew){
  if(!user.passwordConfirmation){
   user.invalidate("passwordConfirmation", "Password Confirmation is required!");
  }
  if(!passwordRegex.test(user.password)){ // 2-3
   user.invalidate("password", passwordRegexErrorMessage);
  } else if(user.password !== user.passwordConfirmation) {
   user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
  }
 }
*/
 // update user // 3-4
 if(!user.isNew){
  if(!user.currentPassword){
   user.invalidate("currentPassword", "Current Password is required!");
  }
  if(user.currentPassword && !user.authenticate(user.currentPassword, user.originalPassword)){ //bcrypt의 compareSync 함수를 사용해서 저장된 hash와 입력받은 password의 hash가 일치하는지 확인합니다.
   user.invalidate("currentPassword", "Current Password is invalid!");
  }
  if(user.newPassword && !passwordRegex.test(user.newPassword)){
    user.invalidate("newPassword", passwordRegexErrorMessage);
  } else if(user.newPassword !== user.passwordConfirmation) {
   user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
  }
 }
});

//hash password // Schema.pre 함수는 첫번째 파라미터로 설정된 event가 일어나기 전(pre)에 먼저 callback 함수를 실행시킵니다.
userSchema.pre("save", function (next){
  var user = this;
  if(!user.isModified("password")){ //isModified함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true를, 그렇지 않은 경우 false를 return하는 함수이다. user 생성시는 항상 true이며, user 수정시는 password가 변경되는 경우에만 true를 리턴한다.
    return next();
  } else{
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

//model methods //
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};


// model & export
var User = mongoose.model("user",userSchema);
module.exports = User;
