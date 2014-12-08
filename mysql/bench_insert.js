/*
 * benchmark mysql using nodejs
 */
var mysql = require('mysql');
var cluster = require('cluster');
var multiline = require('multiline');
var util = require('util');
var async = require('async');

var password = 'xxx';
var total_count = 1000;
var procs = 1;
var count = total_count/procs;

function creaet_connection(){
	return mysql.createConnection({
		host:'localhost',
		user:'root',
		password:password,
		database:'test_perform_db',
		multipleStatements:true
	});
}

function create_pool(){
	return mysql.createPool({
		connectionLimit:10,
		host:'localhost',
		user:'root',
		database:'test_perform_db',
		multipleStatements:true,
		password:password
	});
}

var connection = create_pool();

if(cluster.isMaster){
	create_table(function(err){
		if(err){
			console.log('create table err:',err);
			throw new Error('create table error');
		}
		else{
			console.log('create table ok');
			for(var i=0;i<procs;i++){
				cluster.fork();
			}
		}
	});
}

function create_table(cb){
	var sql = multiline(function(){/*
		drop table if exists dt;
		create table dt(
			id int primary key auto_increment,
			data longblob
		)engine=MyISAM;
	*/});

	console.log('sql:',sql);
	connection.query(sql,cb);
}

function test_insert(size,cb){
	var t1 = new Date;

	var buf = new Buffer(size);
	var sql = mysql.format(
			'insert into dt(data) values(?)',
			[buf.toString()]);

	var j = 0;
	for(var i=0;i<count;i++){
		connection.query(sql,function(err,result){
			if(err){
				console.log('err:',err);
				throw new Error('query error');
			}
			else{
				j++;
				if(j==count){
					var t2 = new Date;
					var timediff = t2-t1;
					var str = util.format("Rows:  %d\nSize:  %d\nTime:  %d\nTPS :  %d/s\n",
						count,size,timediff,parseInt(count/(timediff/1000)));
					console.log(str);
					cb();
				}
			}
		});
	}
}

if(cluster.isWorker){
	async.series([
		function(cb){
			test_insert(10,cb);
		},
		function(cb){
			test_insert(1024,cb);
		},
		function(cb){
			test_insert(1024*10,cb);
		},
		function(cb){
			test_insert(1024*100,cb);
		},
		function(cb){
			test_insert(1024*1000,cb);
		}
	],function(err,results){
		if(err){
			throw new Error('async');
		}
		else{
			console.log('*done*');
		}
	});
}

