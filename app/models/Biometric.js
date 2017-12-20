var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var BiometricSchema = new Schema({
	user_id				: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	created_at			: {type: Number, default: Date.now},
	updated_at			: {type: Number, default: Date.now}
});

module.exports = mongoose.model('Biometric', BiometricSchema);