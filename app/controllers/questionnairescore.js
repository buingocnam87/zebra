var mongoose = require('mongoose');
var QuestionnaireScore = mongoose.model('QuestionnaireScore');
var User = mongoose.model('User');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');

exports.create = function(req, res) {
	var params = ["user_id"];
	execAPI(params, req, res, function () {
		var user_id = req.body.user_id;
		User.find({user_id: req.body.user_id}, function (error, User) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			} else {
				QuestionnaireScore.create(req.body, function (error, news) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					res.json({
						"code" : code.SUCCESS,
						"data" : news
					});	
				});
			}			
		});
	});
};

exports.list = function (req, res) {
	var params = ["user_id", "month", "year"];
	var user_id = req.body.user_id;
	var month = req.body.month;
	var year = req.body.year;
	var start_month = new Date(month+"/01/"+year+" 00:00:00");
	var mls_start_month = start_month.getTime();
	var end_month = new Date(month+"/30/"+year+ " 23:59:59");
	var mls_end_month = end_month.getTime();
	console.log("start month: "+start_month);
	console.log("start month miliseconds: "+mls_start_month);
	console.log("end month miliseconds: "+mls_end_month);
	console.log(Date.now());

	execAPI(params, req, res, function () {
		QuestionnaireScore
			.find({user_id: req.body.user_id, created_at: {$gt: mls_start_month, $lte: mls_end_month}})
			.select("score")
			.select("created_at")
			.exec(function (error, results) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			console.log(results.length);
			res.json({
				"code" : code.SUCCESS,
				"data" : results
			});
		});
	});
};
