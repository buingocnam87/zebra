var mongoose = require('mongoose');
var AnswerDaily = mongoose.model('AnswerDaily');
var QuestionnaireScore = mongoose.model('QuestionnaireScore');
var User = mongoose.model('User');
var code = require('../../libs/code');
var message = require('../../libs/message');

exports.create = function(req, res) {
	var params = ["user_id", "answer", "dailyquestionnaire_number", "total_score"];
	var update = {};
		update.score = req.body.total_score;
		update.user_id = req.body.user_id;
	var now = new Date();
	var start_date = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
	var end_date = (new Date(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/"+"23:59:59")).getTime();
	
	execAPI(params, req, res, function(){
		AnswerDaily.create(req.body, function(error, newAnswer){
			if(error){
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message": message.MESSAGE_INTERNAL_SERVER_ERROR
				});
			}
			QuestionnaireScore.findOne({user_id: req.body.user_id, created_at: {$gt: start_date, $lte: end_date}}, function (error, reward) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (reward)
			{
				console.log('tim thay');
				update.updated_at= Date.now();
				QuestionnaireScore.findByIdAndUpdate(reward._id, update, {
						upsert: false, new : true
					}, function (err, updateQS) {
						if (error || updateQS == null) {
		                            res.json({
		                                "code": code.INTERNAL_SERVER_ERROR,
		                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
		                            });
		                            return;
		                }
		                // data_return = { user_id: updateQS.user_id,
		                // 					updated_at: updateQS.updated_at,  
		                // 					points: updateQS.data, 
		                // 					total_point: updateQS.total_point,
		                // 					total_reward: updateQS.total_reward
		                // 					};
		                // res.json({
		                //     "code": code.SUCCESS,
		                //     "data": data_return
		                // });
					});
			}
			else
			{
				QuestionnaireScore.create(update, function (error, news) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					// data_return = { user_id: news.user_id,  
					// 					updated_at: news.updated_at,
		   //              				points: news.data, 
		   //              				total_point: news.total_point,
		   //              				total_reward: news.total_reward
		   //              				};
					// // res.json({
					// 	"code" : code.SUCCESS,
					// 	"data" : data_return
					// });	
				});
			}
		});
			res.json({
				"code" : code.SUCCESS,
				"data" : newAnswer
			});
		});
	});
};

exports.list = function (req, res) {
	var params = ["answer_id"];
	execAPI(params, req, res, function (err) {
		AnswerDaily.find({_id: req.body.answer_id}, function (error, Answer) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			res.json({
				"code" : code.SUCCES,
				"data" : Answer
			});
		});
	});
};