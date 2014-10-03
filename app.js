
var localFolder = "./photos";
//var username = "admin";
//var password = "admin";

var itvPing = null;
var cardFound = false;
var alreadySearching = false;
var cardAddr = "192.168.0.255";

var http = require('http');
var path = require('path');
var net = require('net');
var dgram = require('dgram');
var fs = require('fs');

console.log("#########################################");
console.log("# Make sure you shoot JPEG or RAW+JPEG! #");
console.log("#########################################");

findCard();

function downloadPhoto(path) {

	path = path.substr(5).replace(/\0/g, '');
	var photo = path.split('/').pop();
	var url = 'http://'+cardAddr+path;
	var localFile = localFolder+'/'+photo;
	console.log("---");
	console.log("Downloading "+url);
	
	var file = fs.createWriteStream(localFile);
		
	file.on('error', function(err) {
		console.log("FS: "+err);
	});
	
	file.on('finish', function() {
		file.close();
		console.log('Photo '+photo+' written to '+localFolder+'/'+photo);
		console.log("---");
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