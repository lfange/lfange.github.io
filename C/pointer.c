#include <stdio.h>

void increment(int *p)
{
  printf("*p=%p, p=%d\n", *p, p);
}

int *pointer = 22;

// int aa = pointer + 1;

printf("*p=%p, p=%d\n", *pointer, pointer);

// increment(pointer);