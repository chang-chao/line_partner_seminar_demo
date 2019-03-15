/**
 * Copyright@ LINE 
 * by jounghunyoung@gmail.com
 * 
 */
// API key
// API key
var apiKey = "";
// elements
var userId = "";
var seminarId = "";
var category = "";
var content = "";

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
			// get user data from a database use to CLOVA API
			
	        $.ajax({
	            url: 'https://www.changchao.me/api/u/s/'+userId,
	            headers: {"api-key": apiKey},
	            type: 'GET',
	            contentType: "application/json",
	            dataType: 'json',
	            // if it could get user data
	            success: function(data_, status, xhr) { 
	            	seminarId = JSON.parse(JSON.stringify(data_)).seminarId;
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
	
	$("a#show_map").click(function(){
        liff.openWindow({
            url: 'https://www.relo-kaigi.jp/comfort/shinjyuku/',
            external: true
        });
	});
	
	$("textarea#content").mouseover(function(){
		$(this).val("");
	}).mouseleave(function(){
		if ($(this).val() == "") {
			$(this).val("セミナー内容に対して質問をしてください");
		}
	});
	
	// send question
	$("button#submit").click(function(){
		category = $($('select#category').find(":selected")).val();
		content = $("textarea#content").val();
		
		if ((content == "") || (content == "セミナー内容に対して質問をしてください") || (category == "0")) {
			showError("エラー：カテゴリーが選択されていないか、質問が入力されていません");
//			$("textarea#content").val("エラー：カテゴリーが選択されていないか、質問が入力されていません");
			return;
		}
		
	    var sendData = {
	    	"userId":userId,
	    	"seminarId":seminarId,
	    	"category":category,
	    	"content":content
	    }

        $.ajax({
            url: 'https://www.changchao.me/api/q/add',
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
            	$("textarea#content").val("セミナー内容に対して質問をしてください");
            	$('select#category').val("0");
            	$("div.error_division").text("");
            }
        });
	});
});

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