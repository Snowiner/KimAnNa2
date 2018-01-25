var mongoose = require("mongoose");
var util = require("../util");

//Schema
var feedSchema = mongoose.Schema({
  body:{type:String, required:[true, "Body is required!"]},
  author:{type:mongoose.Schema.Types.ObjectId, ref:"user", required:true},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
  feednumber:{type:Number}
},{
  toObject:{virtuals:true}
});

feedSchema.virtual("createdDate")
.get(function(){
 return util.getDate(this.createdAt); // 1
});


feedSchema.virtual("createdTime")
.get(function(){
 return util.getTime(this.createdAt); // 1
});

feedSchema.virtual("updatedDate")
.get(function(){
 return util.getDate(this.updatedAt); // 1
});

feedSchema.virtual("updatedTime")
.get(function(){
 return util.getTime(this.updatedAt); // 1
});

//model & exports
var Feed = mongoose.model("feed", feedSchema);
module.exports = Feed;

//functions
function getDate(dateObj){
  if(dateObj instanceof Date)
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
  if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num){
  return ("0" + num).slice(-2);
}
