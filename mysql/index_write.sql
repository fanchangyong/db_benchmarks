-- 测试索引对于写入的影响

-- create database
drop database if exists perf_db;
create database perf_db;

use perf_db;


delimiter $$

drop procedure if exists index_write_sp;
create procedure index_write_sp(count int)
begin

	-- declare variables
	declare i int default 0;
	declare t1,t2 int;

	-- create table
	drop table if exists dt;
	create table dt(
		id int,
		num int not null,
		name char(200) null
	);

	select 'inserting data without index' as info;
	-- insert data without index
	set t1 = unix_timestamp();
	set i=0;
	while(i<count) do
		insert into dt(id,num,name) values(i,i,concat("User_",i));
		set i=i+1;
	end while;
	set t2 = unix_timestamp();
	select t2-t1 as "time-consume-no-index";

	delete from dt;

	create index by_id on dt(id);

	select 'inserting data with index' as info;

	-- insert data with index
	set t1 = unix_timestamp();
	set i=0;
	while(i<count) do
		insert into dt(num,name) values(i,concat("User_",i));
		set i=i+1;
	end while;

	set t2 = unix_timestamp();
	select t2-t1 as "time-consume-index";


	-- insert with 3 indexes
	delete from dt;
	create index by_num on dt(num);
	create index by_name on dt(name);
	select 'inserting data with 3 index ' as info;

	set t1 = unix_timestamp();
	set i=0;
	while(i<count) do
		insert into dt(num,name) values(i,concat("User_",i));
		set i=i+1;
	end while;
	set t2=unix_timestamp();
	select t2-t1 as 'time-consume-3-index';

end$$



