var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var MachineLearningScoreSchema = new Schema({
	user_id				: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	score 				: {type: Number, default: null},
	created_at			: {type: Number, default: Date.now},
	updated_at			: {type: Number, default: null}
});

module.exports = mongoose.model('MachineLearningScore', MachineLearningScoreSchema);
