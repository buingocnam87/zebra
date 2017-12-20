var mongoose = require('mongoose');
var PhysiologicalSignal = mongoose.model('PhysiologicalSignal');
var User = mongoose.model('User');

var code = require('../../libs/code');
var config = require('../../config/config');
var utils = require('../../libs/utils');
var message = require('../../libs/message');
var async = require('async');
var math = require('mathjs');
var deepcopy = require("deepcopy");
var fs = require('fs');

exports.createWithDate = function(req, res) {
	var params = ["user_id", "ps_records"];
	var str = req.body.ps_records;
	var arrs = str.split(";");
	var news = [];
	var newdata = [];
	var to_day = Date.now();
if (arrs.length > 0){
execAPI(params, req, res, function(){
	async.each(arrs, function (arr, next) {
			var arr = arr.split(",");
			var ps_create = {};
				ps_create.created_at = arr[0];
				ps_create.hr = arr[1];
				ps_create.rr = arr[2];
				ps_create.bl = arr[3];
				ps_create.temp = arr[4];
				ps_create.spo2 = arr[5];
				ps_create.bm = arr[6];
				ps_create.dwr = arr[7];
				ps_create.dc = arr[8];
				ps_create.dwc = arr[9];
				ps_create.beb = arr[10];
				ps_create.aeb = arr[11];
				ps_create.fc = arr[12];
				ps_create.nf = arr[13];
				ps_create.aet = arr[14];
				ps_create.pc = arr[15];
				ps_create.user_id = req.body.user_id;

			PhysiologicalSignal.create(ps_create, function (error, newPS) {
				if (error) {
					fs.writeFile(config.root+'/logs/'+to_day+'-ps-create-error.log', error, function (err,data) {
						if (err) {
						   return console.log("failed to write log ps : "+err);
						}
						// console.log(data);
					});
					res.json({
						"code" : code.INTERNAL_SERVER_ERROR,
						"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
					});
					return;
				}
				var data = {created_at: newPS.created_at, hr: newPS.hr, rr: newPS.rr, bl: newPS.bl, temp: newPS.temp, spo2: newPS.spo2, bm: newPS.bm};
				newdata.push(data);
				news.push(newPS);
				next();
			});	
	}, function (error) {
		if (error) {
			res.json({
				"code" : code.OPERATION_ERROR
			});
		} else {
			// var ps_file = fs.createWriteStream(config.root+'/logs/'+to_day+'-ps-create.log');
			// ps_file.on('error', function(error){
			// 	console.log("Error open file ps: "+error);
			// });
			// news.forEach(function(v){
			// 	ps_file.write(v.join(', ')+'\n');
			// });
			// ps_file.end();
		
			res.json({
				"code" : code.SUCCESS,
				"data" : newdata
			});
		}
	});
	});
}
};

exports.create = function(req, res) {
	var params = ["user_id", "ps_records"];
	var str = req.body.ps_records;
	var arrs = str.split(";");
	var news = [];
	var newdata = [];
	var to_day = Date.now();
if (arrs.length > 0){
execAPI(params, req, res, function(){
	async.each(arrs, function (arr, next) {
			var arr = arr.split(",");
			var ps_create = {};
				ps_create.created_at = arr[0];
				ps_create.hr = arr[1];
				ps_create.rr = arr[2];
				ps_create.bl = arr[3];
				ps_create.temp = arr[4];
				ps_create.spo2 = arr[5];
				ps_create.bm = arr[6];
				ps_create.dwr = arr[7];
				ps_create.dc = arr[8];
				ps_create.dwc = arr[9];
				ps_create.beb = arr[10];
				ps_create.aeb = arr[11];
				ps_create.fc = arr[12];
				ps_create.nf = arr[13];
				ps_create.aet = arr[14];
				ps_create.pc = arr[15];
				ps_create.user_id = req.body.user_id;

			PhysiologicalSignal.create(ps_create, function (error, newPS) {
				if (error) {
					fs.writeFile(config.root+'/logs/'+to_day+'-ps-create-error.log', error, function (err,data) {
						if (err) {
						   return console.log("failed to write log ps : "+err);
						}
						// console.log(data);
					});
					res.json({
						"code" : code.INTERNAL_SERVER_ERROR,
						"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
					});
					return;
				}
				var data = {created_at: newPS.created_at, hr: newPS.hr, rr: newPS.rr, bl: newPS.bl, temp: newPS.temp, spo2: newPS.spo2, bm: newPS.bm};
				newdata.push(data);
				news.push(newPS);
				next();
			});	
	}, function (error) {
		if (error) {
			res.json({
				"code" : code.OPERATION_ERROR
			});
		} else {
			// var ps_file = fs.createWriteStream(config.root+'/logs/'+to_day+'-ps-create.log');
			// ps_file.on('error', function(error){
			// 	console.log("Error open file ps: "+error);
			// });
			// news.forEach(function(v){
			// 	ps_file.write(v.join(', ')+'\n');
			// });
			// ps_file.end();
		
			res.json({
				"code" : code.SUCCESS,
				"data" : newdata
			});
		}
	});
	});
}
};

exports.lists = function (req, res) {
	
	var params = ["user_id","day", "month", "year"];
	var user_id = req.body.user_id;
	var	day = req.body.day,
		month = req.body.month,
		year = req.body.year;
	var gmt = parseInt(req.body.gmt);
	if (req.body.cycle){
		var cycle = req.body.cycle;
	} else cycle = 3600000;
	 	cycle = parseInt(cycle);
	// console.log('cycle='+cycle);
	var to_day = Date.now();
	var start_day = new Date(month+"/"+day+"/"+year+" 00:00:00");
	var mls_start_day = start_day.getTime() - gmt*60*60*1000;
	var end_day = new Date(month+"/"+day+"/"+year+ " 23:59:59");
	var mls_end_day = end_day.getTime() - gmt*60*60*1000;

	// console.log(mls_start_day);
	// console.log(mls_end_day);
	var n = Math.floor(86400000/ cycle);
	var data_out = [];
	execAPI(params, req, res, function () {
		console.log(start_day.getTime()+'  '+end_day.getTime());
		console.log(month+'  '+day+'  '+year);
		console.log(req.body.user_id);
		//req.body.user_id "5a160cbb351c9c3a04c5f806"
		PhysiologicalSignal
		.find({user_id: req.body.user_id, created_at: {$gt: mls_start_day, $lte: mls_end_day}})
		.exec(function (error, scores) {
			if (error) {
				fs.writeFile(config.root+'/logs/'+to_day+'-ps-find.log',
				 error + "start_day-" + mls_start_day + "end_day-"+mls_end_day,
				 function (err,data) {
					if (err) {
					   return console.log("failed to write log ps : "+err);
					}
					// console.log(data);
				});
				res.json({
					"code" : code.INTERNAL_SERVER_ERROR,                        
					"message" : message.MESSAGE_INTERNAL_SERVER_ERROR
				});
				return;
			}
			console.log('Helloaa');
			async.each(scores, function (score, next) {
				console.log('Hellonn');
				var number_cycle = Math.floor((parseInt(score.created_at)-parseInt(mls_start_day))/cycle);
				console.log('number_cycle:'+number_cycle);
				
				if (data_out[number_cycle] == undefined){
					score.count = 1;
					score.count_hr=1;
					score.count_rr=1;
					score.count_spo2=1;
					score.hr=0;
					score.rr=0;
					score.spo2=0;
					data_out[number_cycle] = {};
					data_out[number_cycle] = score;
				} else {
					data_out[number_cycle].count += 1;
					var result = (data_out[number_cycle]);
					var count_ = data_out[number_cycle].count;	
					console.log(count_+" "+parseFloat(result.hr));
					/*
					data_out[number_cycle].hr = (parseFloat(result.hr) + parseFloat(score.hr))/count_;
					data_out[number_cycle].rr = (parseFloat(result.rr) + parseFloat(score.rr))/count_;
					data_out[number_cycle].bl = (parseFloat(result.bl) + parseFloat(score.bl))/count_;
					data_out[number_cycle].temp = (parseFloat(result.temp) + parseFloat(score.temp))/count_;
					data_out[number_cycle].spo2 = (parseFloat(result.spo2) + parseFloat(score.spo2))/count_;
					data_out[number_cycle].bm = (parseFloat(result.bm) + parseFloat(score.bm))/count_;
					*/
					if(parseFloat(score.hr)>0)
					{
						data_out[number_cycle].hr = (parseFloat(result.hr) + parseFloat(score.hr));
						data_out[number_cycle].count_hr +=1 ;
					}
					if(parseFloat(score.rr)>0)
					{
						data_out[number_cycle].rr = (parseFloat(result.rr) + parseFloat(score.rr));
						data_out[number_cycle].count_rr +=1;
					}
					data_out[number_cycle].bl = (parseFloat(result.bl) + parseFloat(score.bl));
					data_out[number_cycle].temp = (parseFloat(result.temp) + parseFloat(score.temp));
					if(parseFloat(score.spo2)>0)
					{
						data_out[number_cycle].spo2 = (parseFloat(result.spo2) + parseFloat(score.spo2));
						data_out[number_cycle].count_spo2 +=1;
						console.log("count_sp: "+data_out[number_cycle].count_spo2+" "+parseFloat(score.spo2));
					}
					data_out[number_cycle].bm = (parseFloat(result.bm) + parseFloat(score.bm));
				}
				next();
			}, function (error) {
				console.log('Hellonn');
				if (error) {
					console.log('Hellonnnnnn');
					fs.writeFile(config.root+'/logs/'+to_day+'-ps-async.log', error, function (err,data) {
						if (err) {
						   return console.log("failed to write log ps : "+err);
						}
						// console.log(data);
					});
					res.json({
						"code" : code.OPERATION_ERROR
					});
				} else {
					var outPut = [];
					for (var i = 0; i < n; i++) {
						if (data_out[i] != undefined) {
							var count_=data_out[i].count;
							data_out[i].count_hr+=1;
							data_out[i].count_rr+=1;
							data_out[i].count_spo2+=1;
							console.log("count_hr: "+data_out[i].count_hr+" "+data_out[i].hr);
							console.log("count_sp: "+data_out[i].count_spo2+" "+data_out[i].spo2);
							data_out[i].hr = data_out[i].hr/data_out[i].count_hr;
							data_out[i].rr = data_out[i].rr/data_out[i].count_rr;
							data_out[i].bl = data_out[i].bl/count_;
							data_out[i].temp = data_out[i].temp/count_;
							data_out[i].spo2 = data_out[i].spo2/data_out[i].count_spo2;
							data_out[i].bm = data_out[i].bm/count_;
							outPut.push(data_out[i]);
						} else {
							outPut.push({
										"hr":"0",
										"rr":"0",
										"bl":"0",
										"temp":"0",
										"spo2":"0",
										"bm":"0"
										});
						}
					}
					res.json({
						"code" : code.SUCCESS,
						"data" : outPut
					});
				}
			});
		});
	});
};

