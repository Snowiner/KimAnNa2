var mongoose = require('mongoose');

//Schema

var commentSchema = mongoose.Schema(
	{
		body:{type:String, required:[true, 'comment body not existing']},
		author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
		like_count:{type:Number, default:0},
    	like_users:[mongoose.Schema.Types.ObjectId]

	},
	{
		toObject:{virtuals:true}
	}
);

//Model & Export

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;