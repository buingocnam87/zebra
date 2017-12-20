var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var MedicalHistorySchema = new Schema({
	user_id			: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	created_at		: {type: Number, default: Date.now},
	updated_at		: {type: Number, default: Date.now},
	diagnosis		: {type: String, default: ''},
	treatment		: {type: String, default: ''},
	note			: {type: String, default: ''},
	is_using		: {type: Boolean, default: 1},
	is_taking		: {type: Boolean, default: 1},
	url_file		: [{type: String, default: ''}]
});

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);