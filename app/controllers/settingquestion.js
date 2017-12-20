var mongoose = require('mongoose');
var SettingQuestion = mongoose.model('SettingQuestion');
var User = mongoose.model('User');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');

exports.save = function (req, res) {
	var params = ["user_id", "answer", "time_answer"];
	time_answer = req.body.time_answer;
	update = req.body;
	update.updated_at= Date.now();

	execAPI(params, req, res, function () {
		SettingQuestion.findOne({user_id: req.body.user_id}, function (error, founded) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (founded)
			{
				SettingQuestion.findByIdAndUpdate(founded._id, update, {
					upsert: false, new : true
				}, function (err, updatedSQ) {
					if (error || updatedSQ == null) {
	                            res.json({
	                                "code": code.INTERNAL_SERVER_ERROR,
	                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
	                            });
	                            return;
	                        }
	                        var data = {user_id: updatedSQ.user_id, answer: updatedSQ.answer, time_answer: updatedSQ.time_answer};
	                        res.json({
	                            "code": code.SUCCESS,
	                            "data": data
	                        });
				});
			} else
			{
				SettingQuestion.create(req.body, function (error, Answer) {
					if (error) {
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					var data = { user_id: Answer.user_id, answer: Answer.answer, time_answer: Answer.time_answer};
					res.json({
						"code" : code.SUCCESS,
						"data" : data
					});	
				});
			}
		});
	});
};