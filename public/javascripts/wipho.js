$(document).ready(function() {

  $('body').height($(window).height());
  centerImage();

  getLatest();
  setInterval(function() {
    getLatest();
  }, 1000);

  $(window).resize(function () {
    centerImage();
  });

  $('#latest').one('load', function(){
    $(this).one('load', function(){
      $(this).addClass('imgBorder');
    });
  });

  $('#latest').on('load', function(){
    centerImage();
    $(this).animate({opacity: 1}, 400);
  });
  
});

function getLatest() {
  $.getJSON('/latest', function(data) {
    if('/previews/'+data.name != $('#latest').attr('src')) {
      $('#latest').animate({opacity: 0}, 400, function() {
        $(this).attr('src', '/previews/'+data.name);
      });
    }
  });
}

function centerImage() {
  $('#latest').css({
    position: 'absolute',
    left: ($(window).width() - $('#latest').outerWidth()) / 2,
    top: ($(window).height() - $('#latest').outerHeight()) / 2,
  });
}