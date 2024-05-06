# 打印问候语

def say_hello():
    print('welcome to my blog !!!!!')

say_hello()

strff = '1'
# 打印数字
for i in range(1, 11):
    strff += '>' + str(i)

print(strff)

# 打印星星
for i in range(5):
    print('*' * (i+1))


# write a bubble sort function
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr


print('sssssss', bubble_sort([12,3213,321344,543,5431,3,3,5,65,34,12,32]))

arrs = [12,3213,321344,543,5431,3,3,5,65,34,12,32]

print('11111', arrs)

ar1 = arrs[-3:]
ar1[-3] = 123
print('222222222', ar1)

print('arrsarrsarrs', arrs)

for i in range(len(arrs)):
  if i % 2 == 0:
    print('vvvvvv',i, arrs[i])


# 测试是否可以保存
import os.path

print('__file__', __file__)

print(os.path.abspath(__file__))

print(os.path.dirname(os.path.abspath(__file__)))

print(os.path.basename(__file__))