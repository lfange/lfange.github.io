#include <stdio.h>

int main()
{
  int arr[5] = {};

  arr[0] = 3;

  // 数组的长度
  int len = sizeof(arr) / sizeof(arr[0]);
  for (int i = 0; i < len; i++)
  {
    // arr 指向内存地址，等同于 arr[0]的内存地址, *arr 取值第一位,
    // arr + i 后一位数据的内存地址， *(arr + 1) 取值，等同于 arr[i]
    printf("i=%d, item=%d, *P=%p, + = %p\n", i, *(arr + i), &arr[i], arr + i);
  }
  // i=0, item=3, *P=0061FF04
  // i=1, item=0, *P=0061FF08
  // i=2, item=0, *P=0061FF0C
  // i=3, item=0, *P=0061FF10
  // i=4, item=0, *P=0061FF14

  // 数组名等同于起始地址
  // arr == $arr[0]
  // int* p = $arr[0]  等同于  int* p = arr

  printf("arr=%zu, ar=%d\n", sizeof(arr), sizeof(arr));

  printf("arr=%p\n", &arr);

  int a[] = {11, 22, 33, 44, 55, 999};
  int *pp = a;
  while (*pp != 999)
  {
    printf("*pp=%p,pp=%d\n", pp, *pp);
    pp++;
  }
}