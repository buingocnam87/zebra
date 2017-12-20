/**
 * Copyright(c) 2016 NIW
 * Application Helper
 *
 **/
var message = require('../../libs/message');
var codeOperation = require('../../libs/code');

module.exports = {
  "execAPI" : function(params, req, res, callback) {
    "use strict";
    try {
      var miss = [];
      if (params.length > 0) {
        for (var i = params.length - 1; i >= 0; i--) {
          if (!req.body[params[i]]) {
            miss.push(params[i]);
          }
        };
      }
      if (miss.length > 0) {
        res.json({"code" : codeOperation.MISSING_PARAMETERS, "message" : message.MESSAGE_MISSING_PARAMS_ERROR + miss.join(", ")});
        } else {
          callback();
        }
    } catch (error) {
      console.log(error);
        res.json({"code" : codeOperation.INTERNAL_SERVER_ERROR, "message" : message.MESSAGE_INTERNAL_SERVER_ERROR});
    }
  }
};
