/**
 * Copyright@ LINE 
 * by jounghunyoung@gmail.com
 * 
 **/
const http = require('http');
const https = require('https');
const express = require('express');
const request = require('request');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const bodyParser = require('body-parser');
const aes256 = require('nodejs-aes256');
const app = express();
const apiKey = 'test'; // Could not publish the apiKey
var router = express.Router();
// For json data parsing
app.use(bodyParser.json());
// For html form data parsing
app.use(bodyParser.urlencoded());
// Define default html path
app.use(express.static(__dirname + '/public'));
// Define privacy policy html path
app.use(express.static(__dirname + '/public/policy'));
// Define personal information html path
app.use(express.static(__dirname + '/public/personal_information'));
//Define source html path
app.use(express.static(__dirname + '/public/source'));
// Define survey function html path
app.use(express.static(__dirname + '/public/survey'));
// Define images path
app.use(express.static(__dirname + '/public/img'));
// Define script path
app.use(express.static(__dirname + '/public/script'));
// Define CSS path
app.use(express.static(__dirname + '/public/stylesheets'));

/**
 * initialize
 * @returns
 */
app.listen(process.env.PORT || 5000, function() {
	console.log("# Express server listening on port %d in %s mode", this.address().port, app.settings.env);
	// make survey data
	let sendMessageObject = [
			{ "surveyNo": 1, "surveyContent":"勉強会内容について、理解できましたでしょうか"},
			{ "surveyNo": 2, "surveyContent":"勉強会内容について、満足できましたでしょうか"},
			{ "surveyNo": 3, "surveyContent":"勉強会の時間について、適切な長さでしたでしょうか"},
			{ "surveyNo": 4, "surveyContent":"勉強会で参考になったアジェンダはございますか。（複数可）"},
			{ "surveyNo": 5, "surveyContent":"後の勉強会で取り上げて欲しいテーマ等のご希望がございましたら、お聞かせ下さい"},
			{ "surveyNo": 6, "surveyContent":"その他にご意見、ご要望がございましたら、お聞かせ下さい"}
		];
	let options = {
			url: 'https://www.changchao.me/api/sv/set',
		    method: 'POST',
		    headers: {
		    	'Content-Type': 'application/json',
		        'api-key': apiKey
		    },
		    json: { 'seminarId': '20190313-01', "surveyInfo": sendMessageObject }
	};

	// publish request
	request(options, function (error, response, body) {
			console.log('# Request body' + JSON.stringify(options));	
			if (!error) {
		        console.log("# Survey information putted");
				console.log('# Response body? ' + JSON.stringify(body));	
			} else {
		        console.log("# Survey information puting is failed");
				console.log('# Response body? ' + JSON.stringify(body));	
		    }
	});
});

/**
 * Forward to callback function
 * 
 * @param req
 * @param res
 * @returns
 */
app.get('/', function(req, res){
	   res.redirect('/callback');
});

/**
 * callback function
 * 
 * 
 * @param req
 * @param res
 * @returns void
 */
app.post('/callback', function(req, res) {
	
	console.log('## Request headers? ' + JSON.stringify(req.headers));
	console.log('## Request body? ' + JSON.stringify(req.body));	

	// Type of events
	let eventObj = req.body.events[0];
	
	// Received follow event
	if (eventObj.type === 'follow') {
		console.log("I have got followed ChatBot? "+res.body);
		// get flex message
		let sendMessageObject = getFlextMessage();
		let options = {
				url: process.env.LINE_PUSH_URL,
			    method: 'POST',
			    headers: {
			    	'Content-Type': 'application/json',
			        'Authorization': `Bearer ${process.env.MSG_CHANNEL_ACCESS_TOKEN}`
			    },
			    json: { to: eventObj.source.userId, messages: sendMessageObject }
			};

			// publish request
			request(options, function (error, response, body) {
				if (!error) {
			        console.log("Message pushed from LINE server");
					console.log("Response body? " + JSON.stringify(body));	
				} else {
			        console.log("LINE Push failed!");
					console.log('Response body? ' + JSON.stringify(body));	
			    }
			});
	
	} else {
		// To do nothing
	}
	res.status(200);
});

function getFlextMessage() {
	let sendMessageObject = [
		{
			  "type": "flex",
			  "altText": "Flex Message",
			  "contents": {
			    "type": "bubble",
			    "header": {
			      "type": "box",
			      "layout": "horizontal",
			      "flex": 10,
			      "spacing": "xxl",
			      "margin": "xxl",
			      "contents": [
			        {
			          "type": "image",
			          "url": "https://line-young.herokuapp.com/img/header.png",
			          "gravity": "center"
			        },
			        {
			          "type": "text",
			          "text": "LINE",
			          "margin": "lg",
			          "size": "xxl",
			          "align": "center",
			          "gravity": "center",
			          "weight": "bold",
			          "color": "#2E7D32",
			          "wrap": false
			        },
			        {
			          "type": "text",
			          "text": "Partner Seminar ChatBot",
			          "margin": "xxl",
			          "size": "xs",
			          "align": "start",
			          "gravity": "center",
			          "color": "#1B5E20",
			          "wrap": true
			        }
			      ]
			    },
			    "hero": {
			      "type": "image",
			      "url": "https://line-young.herokuapp.com/img/hero_.png",
			      "margin": "none",
			      "align": "center",
			      "gravity": "top",
			      "size": "full",
			      "aspectRatio": "4:3",
			      "aspectMode": "fit",
			      "action": {
			        "type": "uri",
			        "label": "ActionToLine",
			        "uri": "https://linecorp.com/"
			      }
			    },
			    "body": {
			      "type": "box",
			      "layout": "horizontal",
			      "spacing": "md",
			      "contents": [
			        {
			          "type": "box",
			          "layout": "vertical",
			          "flex": 1,
			          "contents": [
			            {
			              "type": "image",
			              "url": "https://line-young.herokuapp.com/img/body.gif",
			              "align": "start",
			              "gravity": "center",
			              "size": "full",
			              "aspectRatio": "9:16",
			              "aspectMode": "fit"
			            }
			          ]
			        },
			        {
			          "type": "box",
			          "layout": "vertical",
			          "flex": 2,
			          "contents": [
			            {
			              "type": "separator",
			              "margin": "md",
			              "color": "#2E7D32"
			            },
			            {
			              "type": "text",
			              "text": "参加者情報登録",
			              "flex": 2,
			              "margin": "md",
			              "size": "md",
			              "align": "start",
			              "gravity": "center",
			              "weight": "regular",
			              "color": "#43A047",
			              "action": {
			                "type": "uri",
			                "label": "Personal Information",
			                "uri": "line://app/1588275184-r5pg4k5X"
			              }
			            },
			            {
			              "type": "separator",
			              "margin": "md",
			              "color": "#2E7D32"
			            },
			            {
			              "type": "text",
			              "text": "セミナー情報・質問投稿",
			              "flex": 2,
			              "margin": "md",
			              "size": "md",
			              "align": "start",
			              "gravity": "center",
			              "weight": "regular",
			              "color": "#43A047",
			              "action": {
				                "type": "uri",
				                "label": "Sminar Information",
				                "uri": "line://app/1588275184-P5vVgL1m"
				              }
			            },
			            {
			              "type": "separator",
			              "margin": "md",
			              "color": "#2E7D32"
			            },
			            {
			              "type": "text",
			              "text": "ChatBot情報",
			              "flex": 2,
			              "margin": "md",
			              "size": "md",
			              "align": "start",
			              "gravity": "center",
			              "weight": "regular",
			              "color": "#43A047",
			              "action": {
				                "type": "uri",
				                "label": "Source Information",
				                "uri": "line://app/1588275184-Pj9Z8Lbm"
				              }
			            },
			            {
			              "type": "separator",
			              "margin": "md",
			              "color": "#2E7D32"
			            }
			          ]
			        }
			      ]
			    },
			    "footer": {
			      "type": "box",
			      "layout": "vertical",
			      "contents": [
			        {
			          "type": "button",
			          "action": {
			            "type": "uri",
			            "label": "アンケートはこちら",
			            "uri": "line://app/1588275184-pjaV2vAo"
			          }
			        }
			      ]
			    },
			    "styles": {
			      "header": {
			        "backgroundColor": "#FFFFFF"
			      },
			      "hero": {
			        "backgroundColor": "#FFFFFF",
			        "separator": false,
			        "separatorColor": "#000000"
			      },
			      "body": {
			        "backgroundColor": "#FFFFFF",
			        "separator": false,
			        "separatorColor": "#000000"
			      },
			      "footer": {
			        "backgroundColor": "#FFFFFF",
			        "separator": false,
			        "separatorColor": "#000000"
			      }
			    }
			  }
			}
	];
	return sendMessageObject;
}

/**
 * Get apiKey
 * 
 * @param req id is dummy
 * @param res
 * @param next
 * @returns
 */
app.get('/config/:id', function(req, res, next){
	var refer = req.headers.referer;
	console.log(refer);
	console.log(req.params);
	// var id = req.params.id;
	// TO DO: encrypted key set with data storage
	if ((refer == 'https://line-young.herokuapp.com/survey/') 
			|| (refer == 'https://line-young.herokuapp.com/personal_information/') 
			|| (refer == 'https://line-young.herokuapp.com/seminar/') ){
		var param = {"apiKey":apiKey};
	} else {
		var param = {"apiKey":"error"};
	}
	res.header('Content-Type', 'application/json; charset=utf-8')
	res.send(param);
});
module.exports = router;