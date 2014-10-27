var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
AWS.config.loadFromPath('../../config.json');

var httpProxy = process.env.http_proxy
if(httpProxy != null) {
	console.log('set http proxy to ' + httpProxy)
	AWS.config.update({
	  httpOptions: {
	    proxy: httpProxy
	  }
	});
} else {
	console.log("No proxy settings found");
}

var kinesis = new  AWS.Kinesis();

var readStream = function(shardItorId) {
	
	var rsParams = {
    	ShardIterator: shardItorId
  	};

  	kinesis.getRecords(rsParams, function(err, data) {

    	if (err) {
    		console.log("error on getRecords call");
    		console.log(err, err.stack); 
    	} else {
      		if (data['Records'].length > 0) {
        		for (var i in data['Records']) {
          			var rec = data['Records'][i];          			
          			console.log(rec.Data.toString());
        	}
      	}     
      	readStream(data['NextShardIterator']);
    }
  });

};

var processShard = function(shardId) {
	var params = {
		ShardId: shardId,
		ShardIteratorType: 'TRIM_HORIZON',
		StreamName: 'loggingStream2'
	};
	kinesis.getShardIterator(params, function(err,data) {
		if(err) console.log(err, err.stack);
		else {
			readStream(data.ShardIterator);
		}
	});
};

var params = {
  StreamName: 'loggingStream2'
};

kinesis.describeStream(params, function(err, data) {
  if (err) {
  	console.log(err, err.stack);
  	process.exit(1);
  } else {
  	var shards = data.StreamDescription.Shards;
  	if(shards.length > 0) {
  		for(var i in shards) {
			processShard(shards[i].ShardId);
		}
	}
  }   
});

