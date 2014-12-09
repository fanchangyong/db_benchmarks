-- 测试索引对于查询的性能提升

-- create database
drop database if exists perf_db;
create database perf_db;

use perf_db;


delimiter $$

drop procedure if exists index_read_sp;
create procedure index_read_sp(count int)
begin

	-- declare variables
	declare i int default 0;
	declare t1,t2 int;

	-- create table
	drop table if exists dt;
	create TEMPORARY table dt(
		id int auto_increment primary key,
		num int not null,
		name char(200) null
	);

	-- insert data

	while(i<count) do
		insert into dt(num,name) values(i,concat("User_",i));
		set i=i+1;
	end while;

	select "Insert Done.";

	-- select data by index

	set t1 = unix_timestamp();
	select id from dt where id=count;
	set t2 = unix_timestamp();
	select t2-t1 as "time-consume-index";

	-- select data by non-index
	set t1 = unix_timestamp();
	select id from dt where name=concat("User_",count-1);
	set t2 = unix_timestamp();
	select t2-t1 as "time-consume-non-index";
end$$



