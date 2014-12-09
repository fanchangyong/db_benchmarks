#include <hiredis/hiredis.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int count = 1000000;
const int size = 1024;

int main(int argc,char** argv)
{
	redisContext *c;
	redisReply *reply;

	const char *hostname = "127.0.0.1";
	int port = 6379;
	struct timeval timeout = {1,500000};
	c = redisConnectWithTimeout(hostname,port,timeout);
	if(c==NULL || c->err)
	{
		if(c)
		{
			printf("Connection error:%s\n",c->errstr);
			redisFree(c);
		}
		else
		{
			perror("Connection error:can't allocate redis context\n");
		}
		exit(1);
	}

	int i;
	char* buf = malloc(size);
	for(i=0;i<count;i++)
	{
		reply = redisCommand(c,"SET perf_key %s",buf);
		if(reply->type==REDIS_REPLY_ERROR)
		{
			printf("set error:%s\n",reply->str);
		}
		freeReplyObject(reply);
	}

	return 0;
}
