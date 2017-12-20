/**
 * Copyright(c) 2016 NIW
 * Images Controller
 *
 **/
var mongoose = require('mongoose');
var Image = mongoose.model('Image');
var User = mongoose.model('User');
var message = require('../../libs/message');
var code = require('../../libs/code');
var utils = require('../../libs/utils');
var config = require('../../config/config');
var async = require('async');
var passwordHash = require('password-hash');
var formidable = require('formidable');
var sizeOf = require('image-size');
var fs = require('fs');
var path = require("path");
var _ = require('underscore');
// var lwip = require('lwip');

exports.uploadImages = function(req, res) {
	var params = [];
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
				var arr_url = [];
				async.each(images, function(key, next) {
					var timemiliseconds = Date.now();
					var newAvatarName = '';
					var filePath = '';
					var img_link = '';
					var dimensions = '';
					var url_server = config.IMAGE_SERVER_URL;

					var name_image = key.name.lastIndexOf(".");
					var filename_check = key.name.substr(key.name);

					newAvatarName = timemiliseconds + '_zebra' + filename_check;
					filePath = newPath + "/" + newAvatarName;
					fs.rename(key.path, newPath + '/' + newAvatarName, function(error) {
						if (error) {
							fs.unlinkSync(filePath);
							next();
						} else {
							var condition = {};
							condition.url = url_server + '/upload/' + newAvatarName;
							// condition.url_thumbnail = url_server + '/upload/' + 'thumbnail_' + newAvatarName;
							img_link = 'public/upload/' + newAvatarName;
							dimensions = sizeOf(img_link);
							condition.user_id = fields.user_id;
							console.log(condition.user_id);
							Image.create(condition, function(error, newImage) {
								if (error || newImage == null) {
									fs.unlinkSync(filePath);
									fs.unlinkSync(newPath + "/" + "thumbnail_" + newAvatarName);
								} else {
									// resize_image(newAvatarName, newPath);
									arr_url.push(newImage);
								}
								next();
							});

							User.update({_id: condition.user_id}, {image_url: condition.url}, function (error, updatedUser) {
								if (error) {
									res.json({
										"code" : INTERNAL_SERVER_ERROR,
										"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
									});
									return;
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
							"data" : arr_url
						});
					}
				});

			});
		}
	});
};

// function resize_image(filename, newPath) {
// 	fs.createReadStream(newPath + "/" + filename).pipe(fs.createWriteStream(newPath + "/" + "thumbnail_" + filename));
// 	lwip.open(newPath + "/" + "thumbnail_" + filename, function(err, img) {
// 		img.batch().resize(200, (200 * img.height()) / img.width()).writeFile(newPath + "/" + "thumbnail_" + filename, function(error) {
// 			if (error) {
// 				fs.unlinkSync(filePath);
// 				next();
// 			} else {
// 				console.log("success");
// 			}

// 		});
// 	});
// };

/*exports.update = function(req, res) {
	var params = ['image_id'];
	form = new formidable.IncomingForm();
	var newPath = path.join(__dirname, "../../public/upload");
	form.uploadDir = newPath;

	form.parse(req, function(err, fields, files) {
		if (err) {
			res.json({
				"code" : codeOperation.OPERATION_ERROR,
				"result" : message.MESSAGE_UNEXPECTED_ERROR
			});
			return;
		}
		req.body = fields;
		var images = _.values(files);
		if (images.length > 0) {
			var image_id = req.body.image_id;
			execAPI(params, req, res, function() {
				//console.log(req.body);
				var image = images[0];
				// console.log(image);
				var timemiliseconds = Date.now();
				var name_image = image.name.lastIndexOf(".");
				var filename_check = image.name.substr(name_image);
				var newAvatarName = timemiliseconds + '_zebra' + filename_check;
				fs.rename(image.path, newPath + '/' + newAvatarName, function(err) {
					var filePath = newPath + "/" + newAvatarName;
					if (err) {
						fs.unlinkSync(filePath);
						res.json({
							"code" : codeOperation.OPERATION_ERROR,
							"data" : message.MESSAGE_INTERNAL_SERVER_ERROR
						});
						return;
					} else {
						Image.findOne({
							_id : image_id
						}, function(error, foundData) {
							if (error) {
								fs.unlinkSync(filePath);
								res.status(500);
								res.json({
									"code" : codeOperation.OPERATION_ERROR,
									"data" : message.MESSAGE_INTERNAL_SERVER_ERROR
								});
								return;
							}
							if (foundData) {
								fs.createReadStream(newPath + "/" + newAvatarName).pipe(fs.createWriteStream(newPath + "/" + "thumbnail_" + newAvatarName));
								lwip.open(newPath + "/" + "thumbnail_" + newAvatarName, function(err, img) {
									img.batch().resize(150, (150 * img.height()) / img.width()).writeFile(newPath + "/" + "thumbnail_" + newAvatarName, function(error) {
										console.log('err2');
										console.log(err);
										if (error) {
											fs.unlinkSync(filePath);
											fs.unlinkSync(newPath + "/" + "thumbnail_" + newAvatarName);
											res.json({
												"code" : codeOperation.INTERNAL_SERVER_ERROR,
												"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
											});
											return;
										} else {
											var condition = {};
											var url_server = config.IMAGE_SERVER_URL;
											condition.url = url_server + '/upload/' + newAvatarName;
											condition.url_thumbnail = url_server + '/upload/' + 'thumbnail_' + newAvatarName;

											var img_link = 'public/upload/' + newAvatarName;
											var dimensions = sizeOf(img_link);
											condition.width = dimensions.width;
											condition.height = dimensions.height;
											//remove img
											var path_url = foundData.url;
											var name_image = path_url.lastIndexOf("/") + 1;
											var filename = path_url.substr(name_image);
											var filePath_img = newPath + "/" + filename;
											// tumbnail
											if (foundData.url_thumbnail != null) {
												var path_url_thumb = foundData.url_thumbnail;
												var name_image_thumb = path_url_thumb.lastIndexOf("/") + 1;
												var filename_thumb = path_url_thumb.substr(name_image_thumb);
												var filePath_img_thumb = newPath + "/" + filename_thumb;
											}

											Image.findByIdAndUpdate(foundData._id, condition,{
											upsert : false, new : true
											}, function(error, updatedImage) {
												if (error || updatedImage == null) {
													fs.unlinkSync(filePath);
													res.json({
														"code" : codeOperation.OPERATION_ERROR,
														"result" : message.MESSAGE_UNEXPECTED_ERROR
													});
													return;
												}
												fs.unlinkSync(filePath_img);
												if (foundData.url_thumbnail != null) {
													fs.unlinkSync(filePath_img_thumb);
												}
												res.json({
													"code" : codeOperation.SUCCESS,
													"result" : updatedImage
												});

											});

										}

									});
								});

							} else {
								fs.unlinkSync(filePath);
								res.json({
									"code" : codeOperation.DATA_NOT_FOUND,
									"message" : message.MESSAGE_DATA_NOT_FOUND
								});
							}
						});

					}
				});

			});
		}
	});

};
*/