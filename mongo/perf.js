var cluster = require('cluster');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var Db = mongo.Db;

var mongo_client = new MongoClient();

var data_num = 100000;
var sz = 1024;
var pool_size = 500;

var host = '';
var port = null;
var server_opt = {
	poolSize:pool_size
};

var server = new Server(host,port,server_opt);

server.on('connect',function(){
	console.log('server connected');
});

var db_url = 'mongodb://127.0.0.1:27017/test_perform_db';
mongo_client.connect(db_url,{server:server},function(err,db){
	if(err){
		console.log('err:',err);
		throw new Error('db connect error');
	}
	console.log('mongo client callback');
	var t1 = new Date;
	test_insert(db,function(){
		var t2 =  new Date;
		console.log("insert consume:",t2-t1);
	});
});

function test_insert(db,cb){
	var buf=new Buffer(sz);
	var user = {
		data:buf.toString()
	};
	db.collection('user',null,function(err,coll){
		coll.drop(function(){
			console.log('dropped');
			var count = 0;
			for(var i=0;i<data_num;i++){
				coll.insert(user,{forceServerObjectId:true},function(err,result){
					if(err){
						console.log('err:',err);
						throw new Error('insert error!');
					}
					++count;
					if(count==data_num){
						return cb();
					}
				});
			}
		});
	});
}
