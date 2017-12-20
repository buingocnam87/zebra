var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var SettingQuestionSchema = new Schema({
	user_id		: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	answer 		: {type: String, default: ""},
	time_answer	: {type: String, default: ""},
	created_at	: {type: String, default: Date.now}
});

module.exports = mongoose.model('SettingQuestion', SettingQuestionSchema);