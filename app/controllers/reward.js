var mongoose = require('mongoose');
var Reward = mongoose.model('Reward');
var User = mongoose.model('User');

var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');
var moment = require('moment');
var date = require('date');
var async = require('async');

exports.create = function (req, res) {
	params = ["user_id", "points"];
	var str = req.body.points;
	var total_reward = req.body.total_reward;
	var point = str.split(";");
	var update = {};
		update.created_at = req.body.created_at;
		update.data = [];
	var now = new Date();
	var start_date = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
	var end_date = (new Date(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/"+"23:59:59")).getTime();
	update.total_point = 0;
	var k = 0;
	for (i in point) {
		update.data[k] = parseInt(point[i]);
		update.total_point += parseInt(point[i]);
		k++;
	}
	var data_return = {};

	execAPI(params, req, res, function () {
		Reward
		.findOne({user_id: req.body.user_id, created_at: {$gt: start_date, $lte: end_date}})
		.exec(function (error, reward) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (reward)
			{
				console.log("update trong ngay");
				update.updated_at= Date.now();
				var j = 0;
				var change_points = 0;
				async.each(reward.data, function(reward_criterion, next){
					if (update.data[j] != 0 ){
						console.log('khac');
						change_points += update.data[j];
						update.data[j] += reward_criterion;
					} else {
						console.log('giu nguyen');
						update.data[j] = reward_criterion;
					}
					j++;
					next();
				}, function (error) {
					if (error) {
						res.json({
							"code " : code.OPERATION_ERROR
						});
						return;
					} else {
					console.log(change_points);
						console.log(update.data);
						update.total_point = reward.total_point + change_points;
						update.total_reward = reward.total_reward + change_points;
						Reward.findByIdAndUpdate(reward._id, {updated_at: update.updated_at, data: update.data, total_point: update.total_point, total_reward: update.total_reward}
												, {upsert: false, new : true}
							, function (err, updateReward) {
							if (error || updateReward == null) {
								console.log(JSON.stringify(updateReward));
			                            res.json({
			                                "code": code.INTERNAL_SERVER_ERROR,
			                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
			                            });
			                            return;
			                }
			                var arr_point=updateReward.data;
			                data_return = { user_id: updateReward.user_id,
			                					updated_at: updateReward.updated_at,  
			                					// points: updateReward.data.toString(), 
			                					points: arr_point.toString(), 
			                					total_point: updateReward.total_point,
			                					total_reward: updateReward.total_reward
			                					};
			                res.json({
			                    "code": code.SUCCESS,
			                    "data": data_return
			                });
						});
					}
				});
						console.log('total_point = '+update.total_point);
						console.log(JSON.stringify(update));
			}
			else
			{
				update.user_id = req.body.user_id;
				Reward
				.findOne({user_id: req.body.user_id})
				.sort({created_at: -1})
				.exec(function (error, found) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					if (found)
					{
						console.log("tao moi trong ngay: ");
						update.total_reward = found.total_reward + update.total_point;
					} else {
						console.log("tao moi");
						update.total_reward = update.total_point;
					}
						console.log(update.total_reward);
						Reward
						.create(update, function (error, news) {
							if (error) {
								res.json({
									"code" : code.INTERNAL_SERVER_ERROR,
									"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
								});
								return;
							}
							var arr_point=news.data;
							data_return = { user_id: news.user_id,  
												created_at: news.created_at,
												updated_at: news.updated_at,
				                				// points: news.data.toString(), 
				                				points: arr_point.toString(),
				                				total_point: news.total_point,
				                				total_reward: news.total_reward
				                				};
							res.json({
								"code" : code.SUCCESS,
								"data" : data_return
							});	
						});
				});
			}
		});

			
	});
};


exports.list = function (req, res) {
	var params = ["user_id"];
	var user_id = req.body.user_id;
	var end_time = Date.now();
	var start = new Date(end_time - 30*24*60*60*1000);
	var start_time = start.getTime();
	
	execAPI(params, req, res, function () {
		Reward
			.find({user_id: req.body.user_id, updated_at: {$gt: start_time, $lte: end_time}})
			.select("total_point")
			.select("data")
			.select("updated_at")
			.select("user_id")
			.exec(function (error, foundedRewards) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			res.json({
				"code" : code.SUCCESS,
				"data" : foundedRewards
			});
		});
	});
};

/*exports.create = function (req, res) {
	params = ["user_id", "points"];
	var str = req.body.points;
	var total_reward = req.body.total_reward;
	var point = str.split(";");
	var update = {};
		update.user_id = req.body.user_id;
		update.data = [];
		// update.data = str;
	var now = new Date();
	var start_date = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
	var end_date = (new Date(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/"+"23:59:59")).getTime();
	update.total_point = 0;
	// update.data = point;
	var i = 0;
	async.each(point, function(ele, next){
		update.data[i] = parseInt(ele);
		update.total_point += parseInt(ele);
		i++;
		next();
	}, function (error) {
		if(error) {
			res.json({
				"code" : code.OPERATION_ERROR
			});
		} else {

		}
	});
	update.total_reward = parseInt(total_reward) + parseInt(update.total_point);
	// console.log(update.data);
	var data_return = {};

	execAPI(params, req, res, function () {
		Reward
			.find({user_id: req.body.user_id, updated_at: {$lte: end_date}})
			.sort({updated_at:-1})
			.exec(function (error, reward) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (reward)
			{

				var last_reward = reward[0].data;
				update.updated_at= Date.now();
				var j = 1;
				console.log(last_reward);
				async.each(last_reward, function(ele, next){
					update.data[j] = parseInt(update.data[j]) + parseInt(last_reward[j]);
					j++;
					next();
				}, function (error) {
					if(error) {
						res.json({
							"code" : code.OPERATION_ERROR
						});
					} else {

					}
				});
				console.log(update.data);
				update.total_reward += reward.total_reward;
				Reward.create(update, function (err, updateReward) {
						if (error || updateReward == null) {
		                            res.json({
		                            	"false" : "loi",
		                                "code": code.INTERNAL_SERVER_ERROR,
		                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
		                            });
		                            return;
		                }
		                data_return = { user_id: updateReward.user_id,
		                					updated_at: updateReward.updated_at,  
		                					points: updateReward.data, 
		                					total_point: updateReward.total_point,
		                					total_reward: updateReward.total_reward
		                					};
		                res.json({
		                    "code": code.SUCCESS,
		                    "data": data_return
		                });
					});
			}
			else
			{
								console.log(update.data);
				Reward.create(update, function (error, news) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					data_return = { user_id: news.user_id,  
										updated_at: news.updated_at,
		                				points: news.data, 
		                				total_point: news.total_point,
		                				total_reward: news.total_reward
		                				};
					res.json({
						"code" : code.SUCCESS,
						"data" : data_return
					});	
				});
			}
		});

			
	});
};*/