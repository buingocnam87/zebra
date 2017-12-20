/**
 * Copyright(c) 2016 NIW
 * Util Class
 *
 **/
var config = require('../config/config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var formidable = require('formidable');
var client = require('scp2');
var _ = require('underscore');
var uid = require('uid');
var async = require('async');
var SSH2 = require('ssh2').Client;
var _this = this;
var conn = new SSH2();
// var underscore = require('underscore.string');

client.defaults({
    port: config.IMAGE_SERVER_PORT,
    host: config.IMAGE_SERVER,
    username: config.IMAGE_SERVER_USER,
   	password: config.IMAGE_SERVER_PASSWORD,
    path: config.IMAGE_SERVER_PATH
});
var mailServer = {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: true,
    auth: {
        user: config.SMTP_ACCOUNT,
        pass: config.SMTP_PASSWORD
    }
};
// send mail
var transporter = nodemailer.createTransport(smtpTransport(mailServer));

exports.sendMail = function(to, subject, body, callback) {
  var data = {
    from: config.SMTP_ACCOUNT,
      to: to,
      subject: subject,
      text: body
  };
  transporter.sendMail(data, function (error, info) {
    callback (error, info);
  });
}

//upload avatar 
exports.uploadImages = function(req, saveToPath, callback) {
  form = new formidable.IncomingForm();
  form.uploadDir = __dirname + '/../public';
  var content_type = req.headers ? req.headers["content-type"] : '';
  if (content_type.indexOf("multipart/form-data") != -1) {
    form.parse(req, function(err, fields, files) {
      if (err) {
        callback(err);
        return;
      }
      var uploaded_files = [];
      var keys = _.keys(files);
      var images = _.values(files);
      var upload_error = null;
      var command = "mkdir -p " + saveToPath;
      if (images.length > 0) {
        exports.executeRemoteCommand(command, function (error) {
          if (error) {
            callback(error);
            return;
          }
          async.each(keys, function (key, next) {
            var image = files[key];
            var resizedImg = image.path + config.IMAGE_EXTENSION;
            if (image.size > 0) {
              fs.rename(image.path, resizedImg, function (err) {
                if(err) {
                  upload_error = error;
                  next(null);
                } else {
                  lwip.open(resizedImg, function(err, img){
                    img
                    .batch()
                    .resize(600, (600 * img.height())/img.width())
                    .writeFile(resizedImg, function(error){
                      if(error) {
                        upload_error = error;
                        next(null);
                      } else {
                        var newfile = saveToPath + uid(25) + config.IMAGE_EXTENSION;
                        client.scp(resizedImg, {
                          port: config.IMAGE_SERVER_PORT,
                            host: config.IMAGE_SERVER,
                            username: config.IMAGE_SERVER_USER,
                            privateKey: fs.readFileSync(config.IMAGE_SERVER_KEYFILE),
                            path: newfile
                        }, function (error) {
                          if (error) {
                            upload_error = error;
                            next(null);
                          } else {
                            uploaded_files[key] = newfile;
                            fs.unlinkSync(resizedImg);
                            next(null);
                          }
                        });
                      }
                    });
                  });
                }
              });
            } else {
              next(null);
            }
          }, function (error) {
            if (upload_error) {
              _this.removeImages(uploaded_files, function (error) {

              });
              callback(error || upload_error);
            } else {
              callback(null, uploaded_files, fields);
            }
          });
        });
      } else {
        callback(null, uploaded_files, fields);
      }
    });
  } else { 
    callback(null, [], req.body);
  }
}

exports.removeImages = function (imagePaths, callback) {
  var command = "cd " + config.IMAGE_SERVER_PATH + " && rm -rf " + imagePaths.join(" ");
  exports.executeRemoteCommand(command);
}

exports.executeRemoteCommand = function (command, callback) {
  var conn = new SSH2();
  conn.on('ready', function() {
      conn.exec(command, function(err, stream) {
        if (err) {
            conn.end();
            callback(err);
            return;
        }
        conn.end();
        if (callback)
          callback(null);
      });
  }).connect({
      host: config.IMAGE_SERVER,
      username: config.IMAGE_SERVER_USER,
      password: config.IMAGE_SERVER_PASSWORD
      //privateKey: fs.readFileSync('/usr/src/wishlist_sv/public/filekey/lala_server.ppk')
  });
}

/**
 * Return an Object sorted by it's Key
 */
exports.sortObjectByKey = function(obj){
    var keys = [];
    var sorted_obj = {};

    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            keys.push(key);
        }
    }

    // sort keys
    keys.sort();
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      sorted_obj[key] = obj[key];
    }

    return sorted_obj;
};

exports.arrayUnion = function(arr1, arr2, equalityFunc) {
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i+1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}
