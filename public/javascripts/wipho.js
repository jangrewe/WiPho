
var socket = io.connect();

$(document).ready(function() {

  $('body').height($(window).height());
  centerImage();

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

  socket.on('photo', function (data) {
    $('#latest').animate({opacity: 0}, 400, function() {
      $(this).attr('src', '/previews/'+data.path);
      socket.emit('display', {status: 'success'});
    });
  });

});

function centerImage() {
  $('#latest').css({
    position: 'absolute',
    left: ($(window).width() - $('#latest').outerWidth()) / 2,
    top: ($(window).height() - $('#latest').outerHeight()) / 2,
  });
}
