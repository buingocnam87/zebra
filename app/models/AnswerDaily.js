var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var AnswerDailySchema = new Schema({
    user_id	: {type: Schema.Types.ObjectId, ref: 'User', default: null},
    // dailyquestionnaire_id : {type: Schema.Types.ObjectId, ref: 'DailyQuestionnaire', default: null},
    dailyquestionnaire_number : {type: Number, default: null},
    answer 		: {type: String, default: ""},
    total_score		: {type: Number, default: 0}
});

module.exports = mongoose.model('AnswerDaily', AnswerDailySchema);