
var cardAddr = "192.168.0.255";
var cardFound = false;

var itvPing;

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var net = require('net');
var dgram = require('dgram');
var http = require('http');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

findCard();

function enableShootAndView() {



}

function pingCard(ip) {

	req = http.get('http://'+ip+'/', function(res) {
		console.log('Card is alive!');
		req.destroy();
	});
	
	req.on('error', function(err) {
		cardFound = false;
		//console.log('ERROR: ' + err);
		req.destroy();
		clearInterval(itvPing);
		findCard();
	});
	
	req.setTimeout(5000, function(data) {
		cardFound = false;
		console.log('Card has disappeared!');
		req.destroy();
		clearInterval(itvPing);
		findCard();
	});
	
}

var alreadySearching = false;

function findCard() {

	if(alreadySearching == true)
		return;
	else
		alreadySearching = true;

	var socket = dgram.createSocket('udp4');
	var message = new Buffer('dummy');
	var itvSearch;
	
	socket.bind(58255, function() {
		socket.setBroadcast(true);
	});
	
	socket.on('error', function (err) {
		console.log("socket error:\n" + err.stack);
		socket.close();
	});

	socket.on('message', function (msg, rinfo) {
		clearInterval(itvSearch);
		socket.close();
		msg = msg.toString();
		cardAddr = msg.match(/ip=(.*)/)[1];
		cardFound = true;
		itvPing = setInterval(function() {
			pingCard(cardAddr);
		}, 5000);
		console.log("Found card on "+cardAddr);
		alreadySearching = false;
	});

	socket.on('listening', function () {
		var address = socket.address();
		sendSearch();
		itvSearch = setInterval(function() {
			sendSearch();
		}, 5000);
		
		function sendSearch() {
			console.log("Searching for card...");
			socket.send(message, 0, message.length, 55777, cardAddr, function(err, bytes) {
				if(err != null)
					console.log("socket error:\n" + err.stack);
			});
		}
		
	});
	
}