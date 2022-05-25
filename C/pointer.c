#include <stdio.h>

int main()
{
  void increment(int *p)
  {
    printf("*p=%p, p=%d \n", *p, p);
    *p = *p + 18;
    printf("*p=%p, p=%d \n", *p, p);
  }

  int x = 1;
  increment(&x);
  printf("*x=%p,x=%d\n", &x, x); // 2

  // 指针变量的初始化, 指针变量声明后,先指向一个分配好的地址，然后再进行读写操作
  int *intPtr;
  int num;
  intPtr = &num;
  *intPtr = 3;

  printf("*intPtr=%p, intPtr=%d\n", *intPtr, intPtr);
  printf("*num=%p, num=%d\n", &num, num);
}