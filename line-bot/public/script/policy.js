/**
 * Copyright@ LINE 
 * by jounghunyoung@gmail.com
 * 
 */
var userName = "";
var companyName = "";
var jobType = "";

$(document).ready(function(){
	/**
	 * Initializing for LIFF
	 * 
	 * @returns
	 */
	liff.init(function(data) {
		param = decodeURIComponent(window.location.search.substring(1));
		userName = param.split("&")[0].split("=")[1];
		companyName = param.split("&")[1].split("=")[1];
		jobType = param.split("&")[2].split("=")[1];
		
		}, err => {
			showError(err);
		}
	);
	
	$("a#show_line_policy").click(function(){
        liff.openWindow({
            url: 'https://terms.line.me/line_rules/?lang=ja',
            external: true
        });
	});
	
	$("input#confirmation").click(function(){
		if($("input#confirmation").is(':checked'))
	        liff.openWindow({
	            url: 'line://app/1588275184-r5pg4k5X?confirmation=true&user_name='
	            	+userName+'&company_name='+companyName
	            	+'&job_type='+jobType,
	            external: true
	        });
		else
			liff.closeWindow();
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
	$("div.error_division").text(err);
}