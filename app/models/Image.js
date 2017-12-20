var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var ImageSchema = new Schema({
	user_id			: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	url				: {type: String, default: null},
	url_thumbnail	: {type: String, default: null},
	uploaded_at		: {type: Number, default: Date.now}
});

module.exports = mongoose.model('Image', ImageSchema);	