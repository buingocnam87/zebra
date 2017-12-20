var mongoose = require('mongoose');
var Biometric = mongoose.model('Biometric');
var User = mongoose.model('User');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');

exports.create = function(req, res) {
	var params = ["user_id"];
	execAPI(params, req, res, function () {
		var user_id = req.body.user_id;
		User.find({user_id: req.body.user_id}, function (error, Score) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			} else {
				Biometric.create(req.body, function (error, news) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					res.json({
						"code" : code.SUCCES,
						"data" : news
					});	
				});
			}			
	});
});
};


exports.list = function (req, res) {
	var params = ["user_id", "month", "year"];
	execAPI(params, req, res, function (err) {
		Biometric.find({user_id: req.body.user_id}, function (error, Biometric) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			res.json({
				"code" : code.SUCCES,
				"data" : Biometric
			});
		});
	});
};