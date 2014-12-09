var Memcached = require('memcached');

var memcached;

function connect_memcache(){
	var host = '127.0.0.1:11211';
	var opt={
		poolSize:10
	};

	memcached = new Memcached(host,opt);
}

function set_value(count,size){
	var buf = new Buffer(size);

	var j = 0;
	var t1 = new Date;
	for(var i=0;i<count;i++){
		memcached.set('perf_key',buf,0,function(err){
			if(err){
				console.log(err);
				throw new Error('set error');
			}
			else{
				++j;
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
		});
	}
}

connect_memcache();
set_value(100000,1024);
