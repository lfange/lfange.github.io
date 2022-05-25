#include <stdio.h>

void increment(int a)
{
  static int count;
  a++;
  printf("count=%d\n", count);
  count++;
  printf("a=%i\n", a);
}

double average(int i, ...)
{

  double total = 0;
  va_list ap;
  va_start(ap, i);
  for (int j = 1; j <= i; ++j)
  {
    total += va_arg(ap, double);
    printf("i=%d\n", i);
  }
  va_end(ap);
  return total / i;
}

int main()
{
  int i = 5;
  increment(i);

  printf("i=%i\n", i);

  // 函数指针
  void print(int a)
  {
    printf("%d\n", a);
  }

  void (*print_ptr)(int) = &print;

  // 注意，(*print_ptr)一定要写在圆括号里面，否则函数参数(int)的优先级高于*，整个式子就会变成void* print_ptr(int)

  // (*print_ptr)(10);
  // 等同于
  // print(10)
  print_ptr(12);

  printf("print*p=%p, print_ptr=%p", &print, print_ptr);

  // const 值
  void f(const int *p)
  { // 不允许修改*p,可以修改p地址
  }

  void f1(int *const p)
  { // 不允许修改p地址, 可以修改&p的值
  }

  void f2(const int *const p) // 同时限制修改p和*p
  {
  }

  average(1, 2, 3);
}