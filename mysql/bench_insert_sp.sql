/*
* Benchmark Mysql using stored procedure directly
* Usage:
* mysql < bench_insert_sp.sql
* then,use `mysql` command to call the stored procedure
* like this:
* mysql>call insert_test_data(10000,1024);
* +------+
* | time |
* +------+
* |    2 |
* +------+
* 1 row in set (21.27 sec)

* Query OK, 0 rows affected (21.27 sec)
*/

-- clear db
drop database if exists benchmark_db;
create database benchmark_db;
use benchmark_db;

delimiter $$

--  create `create_table` procedure
drop procedure if exists create_table;
create procedure create_table()
begin
	drop table if exists dt;
	create table dt(
		id integer not null primary key auto_increment,
		data longblob
	) engine=MyISAM;
end$$


-- insert data procedure
drop procedure if exists insert_test_data;
create procedure insert_test_data(in count int,in bs int)
begin
	declare t1 int;
	declare t2 int;
	declare i int default 0;
	declare fieldname char(100);
	declare l_data longblob;

	-- construct data
	set i=0;
	while(i<bs) do
		set l_data = concat(l_data,'x');
		set i=i+1;
	end while;


	call create_table();

	set t1 = unix_timestamp();
	set i = 0;
	while(i<count) do
		insert into dt(data) values(l_data);
		set i = i+1;
	end while;

	set t2 = unix_timestamp();

	select t2-t1 as time;
end$$

select concat('count:',10000,' size:',10) as info;
call insert_test_data(10000,10);
