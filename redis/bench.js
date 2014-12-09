var redis=require('redis');

var client = redis.createClient();


function set_value(count,size){
	var buf = new Buffer(size);

	var j = 0;
	var t1 = new Date;
	for(var i=0;i<count;i++){
		client.set('perf_key',buf,function(err,results){
			if(err){
				console.log(err);
				throw new Error('set error');
			}
			else{
				j++;
				if(j==count){
					var t2 = new Date;
					var timediff = t2-t1;
					var secs = timediff/1000;
					console.log('count:',count);
					console.log('size:',size);
					console.log('time used:',parseInt(timediff));
					console.log('tps:',parseInt(count/secs));
					console.log('speed:',parseInt(count*size/secs));
					process.exit(0);
				}
			}
		})
	}
}

set_value(100000,1024);
