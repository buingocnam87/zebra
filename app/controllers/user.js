var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var User = mongoose.model('User');
var Reward = mongoose.model('Reward');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var message = require('../../libs/message');
var config = require('../../config/config');

var _this = this;
var md5 = require('MD5');
var async = require('async');
var formidable = require('formidable');
var _ = require('underscore');
var randomString = require('random-string');

exports.register = function(req, res) {
	var params = ["username", "password", "email"];
	execAPI(params, req, res, function(){
		req.body.password = passwordHash.generate(req.body.password);
		User.findOne({
			username: req.body.username,
		}, function(error, foundUser){
			if(error){
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message": message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (foundUser) {
				res.json({
					"code" : code.USERNAME_EXISTED,
					"message" : message.MESSAGE_USERNAME_EXISTED_ERROR
				});
				return;
			}
			else 
			{
				User.findOne({
					email: req.body.email
				}, function (error, foundUser) {
					if(error){
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					if (foundUser) {
						res.json({
							"code" : code.EMAIL_EXISTED,
							"message" : message.MESSAGE_EMAIL_EXISTED_ERROR
						});
						return;
					}
					else
					{
						var user = new User(req.body);
						user.save(function (error, newUser) {
							if(error) {
								res.json({
									"code" : code.INTERNAL_SERVER_ERROR,
									"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
								});
								return;
							}
							var token = md5(Date.now());
							// console.log(newUser);
		                    var hash_token = passwordHash.generate(token);
		                    newUser.token = token;
		                    newUser.hash_token = hash_token;
							newUser.save(function(error){
								if(error) {
									res.json({
										"code" : code.INTERNAL_SERVER_ERROR,
										"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
									});
									return;
								}	
								res.json({
									"code" : code.SUCCESS,
									"token": token,
									"data" : newUser
								});
							});
						});
					}
				});
			}
		});
	});
};

exports.login = function(req, res) {
	var params = ["username", "password"];
	var data = {};
		data.total_reward = 0;
	console.log(req.body);
	execAPI(params, req, res, function() {
		User.findOne({
			username: req.body.username,
		}, function(error, foundUser){
			if(error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			if (foundUser) {
				if (passwordHash.verify(req.body.password, foundUser.password) === true) {
					var token = md5(Date.now());
					var hash_token = passwordHash.generate(token);
				
					var update = {
						token: token,
						hash_token: hash_token
					};
					User.findByIdAndUpdate(foundUser.id, update, function(error, updateUser) {
						if(error || updateUser == null) {
							res.json({
								"code" : code.INTERNAL_SERVER_ERROR,
								"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
							});
							return;
						}
						var now = new Date();
						console.log(now.getMonth());
						// var todayAtMidn = new Date(now.getFullYear(), now.getMonth(), now.getDate());
						// var start_date = new Date(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/"+"23:59:59");
						var start_date = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
						var end_date = (new Date(now.getFullYear()+"/"+(now.getMonth()+1)+"/"+now.getDate()+"/"+"23:59:59")).getTime();
						Reward
							.find({user_id: updateUser._id, updated_at : {$lte: end_date}})
							.sort({updated_at:-1})
							.exec(function (error, foundReward) {
								if(error) {
									res.json({
										"code" : code.INTERNAL_SERVER_ERROR,
										"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
									});
									return;
								}
								if (foundReward[0]){
								data.total_reward = foundReward[0].total_reward;
								} else {
									data.total_reward = 0;
									console.log('chua co reward');
								}
							});
						User
							.findById(updateUser._id)
						 	.exec(function(error, foundDataLogin){
							if (error) {
								res.json({
									"code" : code.INTERNAL_SERVER_ERROR,
									"message": message.MESSAGE_INTERNAL_SERVER_ERROR
								});	
								return;
							}
							data.User = foundDataLogin;
							res.json({
								"code" : code.SUCCESS,
								"token": token,
								// "data" : foundDataLogin,
								"data" : data
							});
						});
					});

				} else {
					res.json({
						"code" : code.AUTHENTICATE_FAILED,
						"message" : message.MESSAGE_AUTHENTICATE_FAILED
					});
				}
			} else {
				res.json({
					"code" : code.AUTHENTICATE_FAILED,
					"message": message.MESSAGE_AUTHENTICATE_FAILED
				});
			}
		});
	});
};

exports.verifyToken = function (id, token, callback) {
	User.findById(id, function(error, user) {
		if (error) {
			console.log('1');
			callback(error, null);
			return;
		}
		if (user) {
			if (passwordHash.verify(token, user.hash_token) === true) {
				User.findByIdAndUpdate(user.id, {

				}, function (error, updateUser) {
					if (error) {
						console.log('2');
						callback(error, null);
						return;
					}
					console.log('3');
					callback(null, true);
				});
			} else {
					console.log('4');
				callback(null, false);
			}
		} else {
					console.log('5');
			callback(null, false);
		}
	});
};

exports.forgotPassword = function (req, res) {
	var params = [];
	execAPI(params, req, res, function() {
		if (req.body.email != null) {
			User.findOne({email: req.body.email}, function(error, foundUser) {
				if (error) {
					res.json({
						"code" : code.INTERNAL_SERVER_ERROR,
						"message" : message.INTERNAL_SERVER_ERROR
					});
					return;
				}

				if (foundUser) {
					console.log(foundUser);
					var new_password = randomString({length: 6, numeric: false, letters: true, special: false});
					var password_hash = md5(new_password);

					password_hash = passwordHash.generate(password_hash);
					var condition = {};
					condition.password = password_hash;

					User.findByIdAndUpdate(foundUser.id, condition, function(error, updatedUser) {
						if (error || updatedUser == null) {
							res.json({
								"code": code.INTERNAL_SERVER_ERROR,
								"message": message.INTERNAL_SERVER_ERROR
							});
							return;
						}
						var subject = "Forgotten password";
                        var body = "Dear " + updatedUser.username + ", \n\n";
                        body+= "Your password has been changed! \n\n";
                        body+= "To log on to Asthma Friend, use the following credentials: \n\n";
                        body+= "Email: " + updatedUser.email + "\n\n"
                        body+= "Password: " + new_password + "\n\n";
                        body+= "If you have any questions or encounter any problems logging in, please contact a site administrator. \n\n"
                        body+= "Thank you for using Asthma Friend application";
                        utils.sendMail(req.body.email, subject, body, function (error) {
                            if (error) {
                            	console.log(error);
                                res.json({
                                    "code": code.INTERNAL_SERVER_ERROR,
                                    "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                                });
                                return;
                            }
                            res.json({
                                "code": code.SUCCESS
                            });
                        });	
					});
				} else {
					res.json({
						"code" : code.DATA_NOT_FOUND,
						"message" : message.MESSAGE_DATA_NOT_FOUND
					});
				}
			});
		}
	});
};

exports.logout = function(req, res) {
	// var id = req.body.user_id;
	console.log("test logout");
	var token = req.body.token;
	var update = {};
	update = {token : ''};
	User.findOneAndUpdate({token: token}, update, function(error, updatedUser) {
		if (error) {
			res.json({
				"code" : code.INTERNAL_SERVER_ERROR,
				"message" : message.INTERNAL_SERVER_ERROR
			});
			return;
		}
		if (updatedUser){
			res.json({
				"code" : code.SUCCESS
			});
		} else{
			res.json({
				"code" : code.DATA_NOT_FOUND,
				"message" : message.MESSAGE_DATA_NOT_FOUND
			});
		}
	});	
};


exports.update = function(req, res) {
    var params = ["user_id"];
    execAPI(params, req, res, function() {
        var user_id = req.body.user_id;
        delete req.body["user_id"];
        if (req.body.password) {
            req.body.password = passwordHash.generate(req.body.password);   
        }
        
        if (req.body.email != null) {
            User.findOne({email: req.body.email}, function (error, foundUser) {
                if (error) {
                    res.json({
                        "code": code.INTERNAL_SERVER_ERROR,
                        "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (foundUser && foundUser._id != user_id) {
                    res.json({
                        "code": code.EMAIL_EXISTED,
                        "message": message.MESSAGE_EMAIL_EXISTED_ERROR
                    });
                } else {
                    User.findByIdAndUpdate(user_id, req.body, {
                        upsert: false, new : true
                    }, function (error, updatedUser) {
                        if (error || updatedUser == null) {
                            res.json({
                                "code": code.INTERNAL_SERVER_ERROR,
                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                            });
                            return;
                        }
                        res.json({
                            "code": code.SUCCESS,
                            "data": updatedUser
                        });
                    });
                }
            });
            
        } else {
                User.findByIdAndUpdate(user_id, req.body, {
                    upsert: false, new : true
                }, function (error, updatedUser) {
                    if (error || updatedUser == null) {
                        res.json({
                            "code": code.INTERNAL_SERVER_ERROR,
                            "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    res.json({
                        "code": code.SUCCESS,
                        "data": updatedUser,
                        "image_url": config.IMAGE_SERVER_URL
                    });
                });
            };
        
    });
};

exports.updateEmergencyInformation = function(req, res) {
    var params = ["user_id"];
    execAPI(params, req, res, function() {
        var user_id = req.body.user_id;
        delete req.body["user_id"];       
        {
            User.findByIdAndUpdate(user_id, req.body, {
                upsert: false, new : true
            })
            .select("name_emergency")
            .select("phone_emergency")
            .select("policy_number")
            .select("group_number")
            .select("member_id")
            .exec(function (error, updatedUser) {
                if (error || updatedUser == null) {
                    res.json({
                        "code": code.INTERNAL_SERVER_ERROR,
                        "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                res.json({
                    "code": code.SUCCESS,
                    "data": updatedUser,
                });
            });
        };
        
    });
};

exports.checkstatus = function (req, res) {
	params = ["user_id"];
	execAPI(params, req, res, function () {
		User.findOne({_id: req.body.user_id}, function (err, foundUser) {
			if (err) {
				res.json({
					"code" : INTERNAL_SERVER_ERROR,
					"message" : MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			var data = {user_id: foundUser._id, status: foundUser.status};
			if (foundUser.status == "bad") {
				User.findByIdAndUpdate({_id: req.body.user_id}, {status: "good"}, {upset: false, new: true}, function (err, updatedUser) {
					if (err){
						res.json({
							"code" : code.INTERNAL_SERVER_ERROR,
							"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					}
					console.log("Completed");
				});
			}
			res.json({
				"code" : code.SUCCESS,
				"data" : data
			});
		});
	});
};

exports.updatestatus = function (req, res) {
	params = ["user_id", "status"];
	execAPI(params, req, res, function () {

		User.findByIdAndUpdate({_id: req.body.user_id}, {status: req.body.status}, {
                        upsert: false, new : true
                    }, function (error, updatedUser) {
                        if (error || updatedUser == null) {
                            res.json({
                                "code": code.INTERNAL_SERVER_ERROR,
                                "message": message.MESSAGE_INTERNAL_SERVER_ERROR
                            });
                            return;
                        }
                        data = {user_id: updatedUser._id, status: updatedUser.status};
                        res.json({
                            "code": code.SUCCESS,
                            "data": data
                        });
                    });
	});
};