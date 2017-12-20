var mongoose = require('mongoose');
var PewScore = mongoose.model('PewScore');
var User = mongoose.model('User');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');
var random = require("random-js")(); // uses the nativeMath engine
var async = require('async');

exports.create = function(req, res) {
	var params = [];
	execAPI(params, req, res, function () {
		User
		.find()
		.exec(function (error, userarray) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			} else
			{	 
				async.each(userarray, function (ele, next) {
					PewScore
						.find({user_id: ele._id})
						.sort({created_at: -1})
						.exec(function (error, found) {
							if (error) {
								console.log("error find pew :"+ error);
								res.json({
									"code" : code.INTERNAL_SERVER_ERROR,
									"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
								});
								return;
							}
							console.log("number pews of "+ele._id+" = " + found.length);
							if (found.length > 0){
								var pew = {
									user_id : ele._id,
									score: random.integer(0, 10),
									created_at: found[0].created_at + 86400000,
									updated_at: found[0].created_at + 86400000
								}
								console.log("tao moi da co" + pew.toString());
								PewScore.create(pew, function (error, news) {
									if (error) {
										console.log("error create pew: "+error);
										res.json({
											"code" : code.INTERNAL_SERVER_ERROR,
											"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
										});
										return;
									}
									if (news) {
										console.log('tao moi pew da co thanh cong');
									}
								});
							} else 
							if (found.length == 0) {
								var pew_2 = {
									user_id : ele._id,
									score: random.integer(0, 10),
									created_at: Date.now(),
									updated_at: Date.now()
								}
								
								console.log("tao moi: " + pew_2.toString());
								PewScore.create(pew_2, function (error, news) {
									if (error) {
										console.log(error);
										res.json({
											"code" : code.INTERNAL_SERVER_ERROR,
											"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
										});
										return;
									}
									if (news) {
										console.log("thanh cong");
									}
								});
							}
						});
						next();
				}, function(error){
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					} else {
						res.json({
							"code" : code.SUCCESS
						});
					}
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
	console.log(Date.now());
	console.log("end month miliseconds: "+mls_end_month);

	execAPI(params, req, res, function () {
		PewScore
			.find({user_id: req.body.user_id, created_at: {$gt: mls_start_month, $lte: mls_end_month}})
			.select("score")
			.select("created_at")		
			.exec(function (error, results) {
			if (error) {
				// console.log('1');
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

exports.update = function (req, res) {
	var params = ["user_id", "score"];
	execAPI(params, req, res, function () {
		// body...
	});

};