#include <stdio.h>

int main()
{
  float f, x = 3.6, y = 5.2;
  int i = 4, a, b;
  a = x + y;
  b = (int)(x + y);
  f = 10 / i;
  printf("a=%d, b=%d,f=%f,x=%f\n", a, b, f, x);

  int val = 1;
  int val1;
  val1 = val << 2;

  char alarm = '\a';

  unsigned char charnum = 255;

  char result = charnum + 1;

  char result1 = charnum + 2;

  float ee = 3.4E2;

  // 简写为
  // val <<= 2;
  printf("val=%zu, val1=%d, alarm=%i, result=%i, result1=%d\n", sizeof(ee), val1, alarm, result, result1);
}