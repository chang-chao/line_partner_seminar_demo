/**
 * Copyright@ LINE 
 * by jounghunyoung@gmail.com
 * 
 */
// API key
// API key
var apiKey = "";
const seminarId = "20190313-01";
// elements
var userId = "";
var surveyQuestions = [];
var surveyAnswers = [];
var checkBoxVals = [];

$(document).ready(function(){
	$.get("/config/young").done(function( data ) {
		apiKey = JSON.parse(JSON.stringify(data)).apiKey;
		/**
		 * Initializing for LIFF
		 * 
		 * @returns
		 */
		liff.init(function(data) {
			// set userId from liff.init data
			userId = data.context.userId;
			
			// get seminar question data from a database through API
		    $.ajax({
	            url: 'https://www.changchao.me/api/sv/s?seminarId='+seminarId,
	            headers: {"api-key": apiKey},
	            type: 'GET',
	            contentType: "application/json",
	            dataType: 'json',
	            // if it could get user data
	            success: function(data_, status, xhr) { 
	            	let questions = JSON.parse(JSON.stringify(data_)).surveyInfo; // if it has not any survey data with seminar id -> []
	            	// set questions as new
	            	setSurveyQuestion(questions);
	            	// is it attendance?
	            	getUserSurveyInfo();
	            },
	            // if it couldn't get user data by error
	            error: function(xhr, status, err) { 
	            	// show error if it has
	            	showError(err);
	            },
	            complete: function (xhr, status) {
	            	// nothing to do
	            }
		    });
		
		}, err => {
			showError(err);
		});
	});
	// when range bar value changes, then the answer field  is changed follow to the range bar value
	// some of browser couldn't detect class selector
	$('input[type=range]').on('input', function () {
		var target_id = $(this).attr("id");
		var target_number = target_id.substring(1,2);
		console.log(target_number);
		// reset the data, and focus out from the range
		$("input[id=q"+target_number+"_answer]").val($(this).val()).blur();
	});
	
	// Synchronize with range bar
	$('input[type=text]').on('change', function () {
		var target_id = $(this).attr("id");
		var target_number = target_id.substring(1,2);
		// reset the data, and focus out from the range and input field
		$("input[id=q"+target_number+"]").val($(this).val()).blur();
		$(this).blur();
	});
	
	// Synchronize with hidden value
	$('input[type=hidden]').on('change', function () {
		checkBoxVals = ($(this).val()).replace('"','').replace('[','').replace(']','').split(',');
		for (var i=0; i<$("input[id=q4_multple_answer]").length; i++) {
			for (var j=0; j<checkBoxVals.length; j++) {
				if ($($("input[id=q4_multple_answer]").get(i)).val() == checkBoxVals[j]) {
					// reset the data, and focus out from the range and input field
					$($("input[id=q4_multple_answer]").get(i)).prop('checked', true).blur();
					$(this).blur();
				}
			}
		}
	});
	
	// gathering the check box values. 
	// If it has checked value then put into hidden element value. Otherwise, remove from the array.
	$('input#q4_multple_answer').on('change', function () {
		var isChecked = $(this).is(':checked');
		if (isChecked) {
			checkBoxVals.push($(this).val());
		} else {
			var idx = checkBoxVals.indexOf($(this).val());
			if (idx > -1) {
				checkBoxVals.splice(idx, 1);
			}
		}
	});
	
	// Submit survey answers
	$("button#submit").click(function(){
//		alert("アンケートはセミナー参加後に入力できます");
//		return;
		
		let surveyInfo = [];
		$('input#q4_answer').val(checkBoxVals);
		$(".survey_answers").each(function() {
			var target_id = $(this).attr("id");
			var target_number = target_id.substring(1,2);
		    
			for (var i=0; i<surveyQuestions.length; i++) {
				if ((i+1) == target_number) {
					var obj = {"surveyNo":(i+1),"surveyAnswer": $(this).val()};
					surveyInfo.push(obj);
					return;
				}
			}
		});
		
	    var sendData = {
	        "seminarId": seminarId,
	        "userId": userId,
	        "answers":surveyInfo
	    };

        $.ajax({
	            url: 'https://www.changchao.me/api/sv/answer',
	            headers: {"api-key": apiKey},
	            type: 'POST',
	            contentType: "application/json",
	            dataType: 'json',
	            data: JSON.stringify(sendData),
	            // if it could put user data
            success: function(data, status, xhr) { 
            	// nothing to do
            },
            // if it couldn't put user data by error
            error: function(xhr, status, err) { 
    			// show error if it has
            	showError(err);
            },
            // very necessary, if it is not work, then callback function never ending
            complete: function (xhr, status) {
            	liff.closeWindow();
            }
        });
	});
});

/**
 * 
 * @returns
 */
function getUserSurveyInfo() {
	// try to get user data who joined the seminar.
    $.ajax({
            url: 'https://www.changchao.me/api/u/s/'+userId,
            headers: {"api-key": apiKey},
            type: 'GET',
            contentType: "application/json",
            dataType: 'json',
            // if it could get user's answer data
            success: function(data, status, xhr) { 
            	if (("{}" != JSON.stringify(data)) && (seminarId == JSON.parse(JSON.stringify(data)).seminarId)) {
            		// try to get user answer
            		setSurveyAnswer();
//            		$("button#submit").text("　修　正　")
            	}
            },
            // if it couldn't get user data by error
            error: function(xhr, status, err) { 
    			// show error if it has
            	showError(err);
            },
            complete: function (xhr, status) {
            	// nothing to do
            }
    });
}

/**
 * survey answers set up to each answer field
 * 
 * @returns
 */
function setSurveyAnswer() {
    $.ajax({
        url: 'https://www.changchao.me/api/sv/u?userId='+userId+'&seminarId='+seminarId,
        headers: {"api-key": apiKey},
        type: 'GET',
        contentType: "application/json",
        dataType: 'json',
        // if it could get user data even if it empty
        success: function(data_, status, xhr) { 
        	// set each answers with question number
        	let answers = JSON.parse(JSON.stringify(data_)).answers; // if it has not any survey data with seminar id -> []
        	// There are answers already being.
            for(var i=0; i<answers.length; i++) {
            	surveyAnswers[i] = JSON.parse(JSON.stringify(answers[i]));
            }
            	
        	// fill out to answer filed follow answer length
        	var answerFieldLength = $(".survey_answers").length;
        	for(var i=0; i<answerFieldLength; i++) {
        		if (surveyAnswers[i].surveyNo == (i+1)) {
        			$($(".survey_answers").get(i)).val(surveyAnswers[i].surveyAnswer).trigger("change");
        		}
        	}
        	// answers are being
        	if (answers.length > 0) {
        			
        	}
        },
        // if it couldn't get user data by error
        error: function(xhr, status, err) { 
        	// show error if it has
        	showError(err);
        },
        complete: function (xhr, status) {
        	// nothing to do
        }
    });
}

/**
 * survey questions set up to each HTML question field
 * 
 * @param questions
 * @returns
 */
function setSurveyQuestion(questions) {
	// questions filed length
	var questionsFieldLength = $(".survey_question").length;
	// validate questions count
	if (questionsFieldLength != questions.length) {
		showError("アンケート問題に不正があります");
		return;
	}
	// the HTML question field already has been field value as the default.
	// As this function make a reset to renewal each field through the got data.
	for(var i=0; i<questions.length; i++) {
		surveyQuestions[i] = JSON.parse(JSON.stringify(questions[i].surveyContent));
		$($(".survey_question").get(i)).text("Q"+(i+1)+". "+surveyQuestions[i]);
	}
}

/**
 * 
 * Error response
 * 
 * @param err
 * @returns
 */
function showError(err) {
	$("div.error_division").text(err).attr("tabindex",-1).focus();
}