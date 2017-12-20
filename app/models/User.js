var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var UserSchema = new Schema({
	policy_number:{type: String, default: null},
	group_number: {type: String, default: null},
	member_id	: {type: String, default: null},
	phone_emergency: {type: String, default: ""},
	name_emergency : {type: String, default: null},
	password	: {type: String, default: ""},
	image_url	: {type: String, default: ""},
	firstname 	: {type: String, default: ""},
	lastname 	: {type: String, default: ""},
	birthday	: {type: Number, default: ""},
	gender		: {type: Boolean, default: 0},
	phone		: {type: String, default: ""},
	address		: {type: String, default: ""},
	blood_type	: {type: String, default: ""},
	allergies	: {type: String, default: ""},
	token		: {type: String, default: null},
	hash_token	: {type: String, default: null},
	push_token	: {type: String, default: null},
	email		: {type: String, default: ""},
	username	: {type: String, default: ""},
	created_at	: {type: Number, default: Date.now},
	status		: {type: String, default: "good"}
});

module.exports = mongoose.model('User', UserSchema);