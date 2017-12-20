var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/config.js');

// mongoose.Promise = global.Promise;
mongoose.connect(config.database, function(err) {
  if (err) {
    console.log(config.database);
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('dev'));


var shopmodels_path = __dirname + '/app/models/';
fs.readdirSync(shopmodels_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(shopmodels_path + '/' + file);
});

var ApplicationHelper = require('./app/helpers/ApplicationHelper');
for (var key in ApplicationHelper) {
    global[key] = ApplicationHelper[key];
}

var router = express.Router();
require('./config/router')(app, router);

http.createServer(app).listen(config.port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("listening on port "+config.port);
  }
});

