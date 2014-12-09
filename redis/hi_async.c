#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <hiredis/hiredis.h>
#include <hiredis/async.h>
#include <hiredis/adapters/libev.h>
#include <sys/time.h>

int count = 1000000;
int size = 1024*10;

int completed = 0;

struct timeval t_start,t_end;

void getCallback(redisAsyncContext *c, void *r, void *privdata) {
	redisReply *reply = r;
	if (reply == NULL) return;
	printf("argv[%s]: %s\n", (char*)privdata, reply->str);
	/* Disconnect after receiving the reply to GET */
	redisAsyncDisconnect(c);
}

void setCallback(redisAsyncContext *c,void* r,void* privdata)
{
	redisReply *reply = r;
	if(reply==NULL) return;
	if(reply->type==REDIS_REPLY_ERROR)
	{
		printf("redis set error\n");
	}
	else
	{
		++completed;
		if(completed==count)
		{
			gettimeofday(&t_end,NULL);
			long start_us = t_start.tv_sec*1000*1000 + t_start.tv_usec;
			long end_us = t_end.tv_sec*1000*1000 + t_end.tv_usec;

			long diffus = end_us-start_us;
			long diffs = (long)(diffus/1000/1000);
			printf("completed,time: %ld\n",diffs);
			int tps = (diffs==0?count:count/diffs);
			printf("tps: %d/s \n",tps);
			exit(0);
		}
	}
}

void connectCallback(const redisAsyncContext *c, int status) {
	if (status != REDIS_OK) {
		printf("Error: %s\n", c->errstr);
		return;
	}
	printf("Connected...\n");
}
void disconnectCallback(const redisAsyncContext *c, int status) {
	if (status != REDIS_OK) {
		printf("Error: %s\n", c->errstr);
		return;
	}
	printf("Disconnected...\n");
}
int main (int argc, char **argv) {
	signal(SIGPIPE, SIG_IGN);
	redisAsyncContext *c = redisAsyncConnect("127.0.0.1", 6379);
	if (c->err) {
		/* Let *c leak for now... */
		printf("Error: %s\n", c->errstr);
		return 1;
	}
	redisLibevAttach(EV_DEFAULT_ c);
	redisAsyncSetConnectCallback(c,connectCallback);
	redisAsyncSetDisconnectCallback(c,disconnectCallback);

	// test insert data
	int i;
	char* buf = malloc(size);
	gettimeofday(&t_start,NULL);
	for(i=0;i<count;i++)
	{
		redisAsyncCommand(c,setCallback,NULL,"set perf_key %s",buf);
	}

	ev_loop(EV_DEFAULT_ 0);
	return 0;
}
