
var config = require('./config.json');

var pathPhotos = config.pathPhotos;
var cardAddr = config.broadcastAddr;
var pathPreviews = "./public/previews";

var itvPing = null;
var cardFound = false;
var alreadySearching = false;

var http = require('http');
var path = require('path');
var net = require('net');
var dgram = require('dgram');
var fs = require('fs');
var gm = require('gm');

/* Express */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var latestPhoto = require('./routes/latest');
var allPhotos = require('./routes/all');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/latest', latestPhoto);
app.use('/all', allPhotos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

/* WiPho */

photos = new Array();
photoIndex = 0;

console.log("#########################################");
console.log("# Make sure you shoot JPEG or RAW+JPEG! #");
console.log("#########################################");

findCard();

function downloadPhoto(path) {

	path = path.substr(5).replace(/\0/g, '');
	var photo = path.split('/').pop();
	var localFile = pathPhotos+'/'+photo;
	var localPreview = pathPreviews+'/'+photo;
	console.log("---");
	console.log('Downloading http://'+cardAddr+path);
	
	var file = fs.createWriteStream(localFile);
		
	file.on('error', function(err) {
		console.log("FS: "+err);
	});
	
	file.on('finish', function() {
		file.close();
		console.log('Photo '+photo+' written to '+localFile);
		
		gm(localFile).autoOrient().resize(1920, 1080).write(localPreview, function (err) {
			if (!err) {
				console.log('Photo resized!');						
				if(photos.length == 0 || photo != photos[photos.length-1].name) {
					photos.push({id: photoIndex, name: photo});
					photoIndex++;
				}
			
			}else{
				console.log('Photo resize error: '+err);
			}
			
			console.log("---");
			
		});
		
	});
	
	var options = {
		hostname: cardAddr,
		port: 80,
		path: path,
		method: 'GET'
	};
	
	var request = http.get(options, function(response) {
	  response.pipe(file);
	});
	
	request.on('error', function(e) {
		console.log("HTTP Error: " + e.message);
	});

}


function enableShootAndView(ip) {

	var client = net.connect({port: 5566, host: ip}, function() {
		console.log('Enabling Shoot & View...');
	});
	
	client.on('connect', function() {
		console.log('Shoot & View enabled, waiting for photos...');
	});
	
	client.on('error', function(err) {
		console.log('Shoot & View error: '+err);
		findCard();
	});
	
	client.on('data', function(data) {
		downloadPhoto(data.toString());
	});

	client.on('end', function() {
		console.log('Shoot & View stopped!');
	});

}


function pingCard(ip) {

	req = http.get('http://'+ip+'/', function(res) {
		//console.log('Card is alive!');
		req.destroy();
	});
	
	req.on('error', function(err) {
		cardFound = false;
		console.log('ERROR: ' + err);
		req.destroy();
		clearInterval(itvPing);
		findCard();
	});
	
	req.setTimeout(5000, function() {
		cardFound = false;
		console.log('Card has disappeared!');
		req.destroy();
		clearInterval(itvPing);
		findCard();
	});
	
}


function findCard() {

	if(alreadySearching == true)
		return;
	else
		alreadySearching = true;
		
	console.log("Searching for card...");

	var socket = dgram.createSocket('udp4');
	var message = new Buffer('dummy');
	var itvSearch;
	
	socket.bind(58255, function() {
		socket.setBroadcast(true);
	});
	
	socket.on('error', function (err) {
		console.log("socket error:\n" + err.stack);
		socket.close();
		findCard();
	});

	socket.on('message', function (msg, rinfo) {
		clearInterval(itvSearch);
		socket.close();
		msg = msg.toString();
		cardAddr = msg.match(/ip=(.*)/)[1];
		cardFound = true;
		console.log("Found card on "+cardAddr);
		enableShootAndView(cardAddr);
		itvPing = setInterval(function() {
			pingCard(cardAddr);
		}, 5000);
		alreadySearching = false;
	});

	socket.on('listening', function () {
		var address = socket.address();
		sendSearch();
		itvSearch = setInterval(function() {
			sendSearch();
		}, 5000);
		
		function sendSearch() {
			socket.send(message, 0, message.length, 55777, cardAddr, function(err, bytes) {
				if(err != null)
					console.log("socket error:\n" + err.stack);
			});
		}
		
	});
	
}