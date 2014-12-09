all:hi hi_async

hi:hi.c
	cc -lhiredis -o hi hi.c
hi_async:hi_async.c
	cc -lhiredis -lev -o hi_async hi_async.c
