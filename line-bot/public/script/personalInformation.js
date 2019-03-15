/**
 * Copyright@ LINE 
 * by jounghunyoung@gmail.com
 * 
 */
// API key
var apiKey = "";
// parameters from privacy policy viewer
var param = "";
// elements
var userId = "";
var displayName = "";
var userName = "";
var companyName = "";
var jobType = "";
var isConfirmed = false;

$(document).ready(function(){
	$.get("/config/young").done(function( data ) {
		apiKey = JSON.parse(JSON.stringify(data)).apiKey;
		/**
		 * Initializing for LIFF
		 * 
		 * @returns null
		 */
		liff.init( function (data) {
			// from privacy policy viewer
			if ("" != window.location.search.substring(1)) {
				param = decodeURIComponent(window.location.search.substring(1));
				isConfirmed = param.split("&")[0].split("=")[1];
				userName = param.split("&")[1].split("=")[1];
				companyName = param.split("&")[2].split("=")[1];
				jobType = param.split("&")[3].split("=")[1];
			}
			// set userId from liff.init data
			userId = data.context.userId;
			// get user data from a database use to CLOVA API
	        $.ajax({
	            url: 'https://www.changchao.me/api/u/'+userId,
	            headers: {"api-key": apiKey},
	            type: 'GET',
	            contentType: "application/json",
	            dataType: 'json',
	            // if it could get user data
	            success: function(data_, status, xhr) { 
	            	setProfile(data_, isConfirmed); 
	            },
	            // if it couldn't get user data by error
	            error: function(xhr, status, err) { 
	    			// show error if it has
	            	console.log("--------LIFF");
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
	// show privacy policy viewer
	$("a#show_privacy_policy").click(function(){
        liff.openWindow({
            url: 'line://app/1588275184-MOX7DGRm/?user_name='
            	+$("input#user_name").val()+'&company_name='+$("input#company_name").val()
            	+'&job_type='+$($('select#position_name').find(":selected")).val(),
            external: false
        });
	});
	
	// seminar join
	$("button#confirm").click(function(){
	    var sendData = {
	    	"userId":userId,
	    	"displayName":displayName,
	    	"userName":$("input#user_name").val(),
	    	"companyName":$("input#company_name").val(),
	    	"jobType":$($('select#position_name').find(":selected")).val(),
	    	"policyFlag":($("span#confirmation").text() == "済み")?"y":"n"
	    }

        $.ajax({
            url: 'https://www.changchao.me/api/u/join',
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
	
	// leave from seminar join
	$(document).on("click", "button#remove", function(){
	    var sendData = {
	    	"userId":userId
	    }

        $.ajax({
            url: 'https://www.changchao.me/api/u/quit',
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
 * getProfile
 * 
 * @returns null
 */
function getProfile() {
	liff.getProfile().then(function(profile) {
		displayName = profile.displayName;
		$("img#user_photo").attr("src",profile.pictureUrl);
		$("p#display_name").text(displayName);
	}).catch((err) => {
		showError(err);
	});
}

/**
 * setProfile
 * 
 * @returns null
 */
function setProfile(data_, isConfirmed) {
	// get user profile from LIFF API
	getProfile();
	// if it has not user data
	if ('{}' == JSON.stringify(data_)) {
		// show the privacy policy confirmation
		if ("" != isConfirmed) {
			$("input#user_name").val(userName);
			$("input#company_name").val(companyName);
			$("select#position_name").val(jobType);
			togglePrivacyPolicyConfirmation(true);
		}
	} else {
		var data = JSON.parse(JSON.stringify(data_));
		$("input#user_name").val(data.userName);
		$("input#company_name").val(data.companyName);
		$("select#position_name").val(data.jobType);
		// from privacy policy
		if ("" != isConfirmed) {
			togglePrivacyPolicyConfirmation(true)
		} else {
			(data.policyFlag == "y")?togglePrivacyPolicyConfirmation(true):togglePrivacyPolicyConfirmation(false);
		}
		$("button#confirm").text("　修　正　").after("　<button class='btn remove' id='remove'>　不参加　</button>");
	}
}

/**
 * 
 * @param isConfirmed
 * @returns
 */
function togglePrivacyPolicyConfirmation(isConfirmed) {
	if (isConfirmed == true) {
		$("span#confirmation").text("済み");
		$("a#show_privacy_policy").text("");
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