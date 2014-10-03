$(document).ready(function() {

    $('body').height($(window).height());

	getLatest();
	setInterval(function() {
		getLatest();
	}, 3000);
	
});

function getLatest() {
	$.getJSON('/latest', function(data) {
		if('/previews/'+data.name != $('#latest').attr('src')) {
			$('#latest').attr('src', '/previews/'+data.name);
		}
	});
}