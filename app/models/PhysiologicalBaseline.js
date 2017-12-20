var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
var config = require('../../config/config');

var PhysiologicalBaseLineSchema = new Schema({
	user_id			: {type: Schema.Types.ObjectId, ref: 'User', default: null},
	created_at		: {type: Number, default: Date.now},
	hr 				: {type: String, default: 0},
	rr 				: {type: String, default: 0},
	bl 				: {type: String, default: 0},
	temp			: {type: String, default: 0},
	spo2			: {type: String, default: 0},
	bm 				: {type: String, default: 0},
	dwr				: {type: String, default: 0},
	dc				: {type: String, default: 0},
	dwc				: {type: String, default: 0},
	beb				: {type: String, default: 0},
	aeb				: {type: String, default: 0},
	fc 				: {type: String, default: 0},
	nf 				: {type: String, default: 0},
	aet				: {type: String, default: 0},
	pc 				: {type: String, default: 0}
});

module.exports = mongoose.model('PhysiologicalBaseLine', PhysiologicalBaseLineSchema);