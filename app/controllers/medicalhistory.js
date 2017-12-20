var mongoose = require('mongoose');
var MedicalHistory = mongoose.model('MedicalHistory');
var code = require('../../libs/code');
var message = require('../../libs/message');
var utils = require('../../libs/utils');
var config = require('../../config/config');

var async = require('async');
var passwordHash = require('password-hash');
var formidable = require('formidable');
// var sizeOf = require('image-size');
var fs = require('fs');
var path = require("path");
var _ = require('underscore');
// var lwip = require('lwip');

exports.create = function (req, res) {
	params = ["user_id"];
	execAPI(params, req, res, function () {
		MedicalHistory.create(req.body, function (error, news) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			console.log(news);
			res.json({
				"code" : code.SUCCESS,
				"data" : news
			});	
		});
	});
};

exports.update = function (req, res) {
	params = ["record_id"];
	record_id = req.body.record_id;
	console.log(req.body);
	execAPI(params, req, res, function () {
		MedicalHistory.findByIdAndUpdate(record_id, req.body, {
                        upsert: false, new : true
                    }, function (error, MedicalHistorys) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			res.json({
				"code" : code.SUCCESS,
				"data" : MedicalHistorys
			});
		});
	});
};

exports.list = function (req, res) {
	params = ["user_id"];
	execAPI(params, req, res, function () {
		MedicalHistory.find({user_id: req.body.user_id}, function (error, Medicals) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			console.log(Medicals[0]);
			res.json({
				"code" : code.SUCCESS,
				"data" : Medicals
			});
		});
	});
};

exports.uploadfiles = function (req, res) {
	var params = [];
	var data = {};
	form = new formidable.IncomingForm();
	var newPath = path.join(__dirname, "../../public/upload");
	form.uploadDir = newPath;
	form.parse(req, function(err, fields, files) {
		if (err) {
			res.json({
				"code" : code.OPERATION_ERROR,
				"data" : message.MESSAGE_INTERNAL_SERVER_ERROR
			});
			return;
		}
		req.body = fields;
		var images = _.values(files);
		if (images.length > 0) {
			execAPI(params, req, res, function() {
				var condition = {};
					condition.url=[];
				async.each(images, function(key, next) {
					var timemiliseconds = Date.now();
					var newFileName = '';
					var filePath = '';
					var url_server = config.IMAGE_SERVER_URL;
					var name_file = key.name.substr(key.name);
					var arr_url = [];
					newFileName = timemiliseconds + '_zebra_' + name_file;
					filePath = newPath + "/" + newFileName;

					
					fs.rename(key.path, newPath + '/' + newFileName, function(error) {
						if (error) {
							fs.unlinkSync(filePath);
							next();
						} else
						{
							condition.url.push(url_server + '/upload/' + newFileName);
							// console.log(condition.url);
							condition.record_id = fields.record_id;
							MedicalHistory.findOne({_id: fields.record_id}, function (error, foundMH) {
								if (error) {
									res.json({
										"code" : code.INTERNAL_SERVER_ERROR,
										"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
									});
									return;
								} else{
									condition.url = condition.url.concat(foundMH.url_file);
									MedicalHistory.findByIdAndUpdate(condition.record_id
										, {url_file: condition.url}
										, function(error, updatedMedicalhistory) {
										if (error || updatedMedicalhistory == null) {
											fs.unlinkSync(filePath);
											console.log('update null');
										} 
										data = updatedMedicalhistory;
										next();
									});
								}
							});
							
						}
					});
				}, function(error) {
					if (error) {
						res.json({
							"code" : code.OPERATION_ERROR
						});
					} else {
						res.json({
							"code" : code.SUCCESS,
							// "data" : data
						});
					}
				});

			});
		}
	});	
};

exports.listFileUrl = function (req, res) {
	params = ["record_id"];
	var record_id = req.body.record_id;
	execAPI(params, req, res, function () {
		MedicalHistory
			.findById(record_id)
			.select('url_file')
			.exec(function (error, urls) {
			if (error) {
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			res.json({
				"code" : code.SUCCESS,
				"file_urls" : urls
			});
		});
	});
};