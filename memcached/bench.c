#include <stdio.h>
#include <libmemcached/memcached.h>
#include <string.h>

int main()
{
	const char *config_string= "--SERVER=127.0.0.1";
	memcached_st *memc= memcached(config_string, strlen(config_string));


	char key[]="perf_key";
	char val[]="perf_val";
	memcached_return_t ret = memcached_set(memc,key,strlen(key)+1,val,strlen(val)+1,0,0);
	if(memcached_success(ret))
	{
		printf("ok\n");
	}
	else
	{
		const char* errstr=memcached_strerror(memc,ret);
		printf("error:%s\n",errstr);
	}
	return 0;
}
