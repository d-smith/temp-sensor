"use strict";

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
AWS.config.loadFromPath('../../config.json');

var httpProxy = process.env.http_proxy;
if(httpProxy !== null) {
	console.log('set http proxy to ' + httpProxy);
	AWS.config.update({
	  httpOptions: {
	    proxy: httpProxy
	  }
	});
} else {
	console.log("No proxy settings found");
}

var kinesis = new  AWS.Kinesis();

var writeToStream = function(temp) {
	var data, params;

  data = {'temp':temp};
	params = {
		Data : JSON.stringify(data),
		PartitionKey: 'TemperatureData',
		StreamName: 'loggingStream2'
	};

	kinesis.putRecord(params, function(err,data) {
		if(err) {
      console.log(err, err.stack);
    }
	});
};

var configureListeners = function() {
    app.get('/', function(req, res){
      res.send('<h1>Hello world</h1>');
    });

    io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
      socket.on('temp read', function(msg) {
        console.log('read message ' + msg);
        writeToStream(msg);
      });
    });
};

var startListeners = function() {
    var params = {
      StreamName: 'loggingStream2'
    };

    kinesis.describeStream(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        process.exit(1);
      } else {
        console.log(data);
      http.listen(3000, function(){
        console.log('listening on *:3000');
      });
      }
    });
};

configureListeners();
startListeners();
