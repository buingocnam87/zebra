var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var RewardSchema = new Schema({
	user_id			: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	created_at		: {type: Number, default: Date.now},
	updated_at		: {type: Number, default: Date.now},
	data 			: [{type: Number, default: 0}],
	total_point		: {type: Number, default: 0},
	total_reward	: {type: Number, default: 0}
});

module.exports = mongoose.model('Reward', RewardSchema);