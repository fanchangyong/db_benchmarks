-- 索引对于join的影响

-- create database
drop database if exists perf_db;
create database perf_db;

use perf_db;


delimiter $$

drop procedure if exists sp;
create procedure sp(count int)
begin

	-- declare variables
	declare i int default 0;
	declare t1,t2 int;

	-- create table
	drop table if exists big_table;
	create table big_table(
		id int,
		v1 int not null,
		v2 char(20) null,
		v3 char(20) null,
		v4 char(20) null,
		v5 int null
	);

	drop table if exists small_table;
	create table small_table(
		id int primary key,
		big_id int not null,
		v1 int null,
		v2 int null,
		v3 int null,
		v4 int null
	);

	create index i_big_id on big_table(id);

	-- insert data
	set i=0;
	while(i<count) do
		insert into big_table(id,v1,v2,v3,v4,v5) values(i,i,
			"v2","v3","v4",i);
		set i=i+1;
	end while;

	select 'start insert smalltable';

	set i=0;
	while(i<count/100) do
		insert into small_table(id,big_id,v1,v2,v3,v4) values(i,i,i,i,i,i);
		set i=i+1;
	end while;

	select 'start query!';

	set t1 = unix_timestamp();
	select * from small_table join big_table on(big_table.id=small_table.big_id);
	set t2 = unix_timestamp();
	select t2-t1 as 'time-consume';

end$$



