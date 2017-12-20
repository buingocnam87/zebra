var user = require('../app/controllers/user');
var settingquestion = require('../app/controllers/settingquestion')
var images = require('../app/controllers/images');
var medicalhistory = require('../app/controllers/medicalhistory');
var answerdaily = require('../app/controllers/answerdaily');
var answerondemand = require('../app/controllers/answerondemand');
var pewscore = require('../app/controllers/pewscore');
var questionnairescore = require('../app/controllers/questionnairescore');
var machinelearningscore = require('../app/controllers/machinelearningscore');
var physiologicalsignal = require('../app/controllers/physiologicalsignal');
var physiologicalbaseline = require('../app/controllers/physiologicalbaseline');
var reward = require('../app/controllers/reward');
var code = require('../libs/code');
var config = require('../config/config');
var path = require('path');

module.exports = function (app, router) {
	router.get('/', function (req, res){
		console.log('ok');
		res.json({message: 'Hello! Welcome to Asthma Friend'});
	});

	router.post('/user/register', user.register);
	router.post('/user/login', user.login);
	router.post('/user/forgotPassword', user.forgotPassword);
	router.post('/user/updatestatus', user.updatestatus);
	
	router.post('/images/upload', images.uploadImages);

	router.post('/medicalhistory/uploadfiles', medicalhistory.uploadfiles);
	router.post('/medicalhistory/list-file-urls', medicalhistory.listFileUrl);
	
	router.use(function(req, res, next){
		var router = req.url;
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
	    var id = req.body.user_id || req.query.user_id || req.headers['x-user-id'];
	    if (token && id) {
	      	user.verifyToken(id, token, function(err, result) {      
		        if (err) {
			        return res.json({
			            "code" : code.INTERNAL_SERVER_ERROR,
			            "message" : message.MESSAGE_INTERNAL_SERVER_ERROR
			        });
		        } else {
		          	if (result) {
		            	next();
		          	} else {
		            	return res.status(200).send({ 
		                	code: "-9", 
		               		message: "Invalid token."
		            });
		          	}
		        }
	      	});
	    } else {
	      	return res.status(200).send({
	          	code: "-9", 
	          	message: 'No token provided.' 
	      	});
	    }
	});

	router.post('/user/logout', user.logout);
	router.post('/user/update', user.update);
	router.post('/user/updateEmergencyInfo', user.updateEmergencyInformation);
	router.post('/user/setting', settingquestion.save);
	router.post('/user/checkstatus', user.checkstatus);

	
	router.post('/medicalhistory/create', medicalhistory.create);
	router.post('/medicalhistory/update', medicalhistory.update);
	router.post('/medicalhistory/list', medicalhistory.list);
	
	router.post('/answerdaily/create', answerdaily.create);
	router.post('/answerdaily/list', answerdaily.list);
	router.post('/answerondemand/create', answerondemand.create);
	router.post('/answerondemand/list', answerondemand.list);

	router.post('/pew-score/create', pewscore.create);
	router.post('/machine-learning-score/create', machinelearningscore.create);
	router.post('/questionnaire-score/create', questionnairescore.create);
	router.post('/physiological-signal/create', physiologicalsignal.create);
	router.post('/physiological-baseline/create', physiologicalbaseline.create);
	router.post('/pew-score/list', pewscore.list);
	router.post('/machine-learning-score/list', machinelearningscore.list);
	router.post('/questionnaire-score/list', questionnairescore.list);
	// router.post('/physiological-signal/list', physiologicalsignal.list);
	router.post('/physiological-signal/lists', physiologicalsignal.lists);
	router.post('/physiological-baseline/lists', physiologicalbaseline.lists);

	router.post('/reward/create', reward.create);
	router.post('/reward/list', reward.list);


	app.use('/api', router);
};
