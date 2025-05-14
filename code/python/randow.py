import random

def generate_lotto_numbers():
    # 生成5个主球号码，号码范围是1-35
    main_balls = random.sample(range(1, 36), 5)
    # main_balls.sort()  # 对号码进行排序

    # 生成2个特别号码，号码范围是1-12
    special_balls = random.sample(range(1, 13), 2)
    # special_balls.sort()  # 对号码进行排序

    return main_balls, special_balls

# 打印生成的大乐透号码
main_balls, special_balls = generate_lotto_numbers()
print("主球号码：", main_balls)
print("特别号码：", special_balls)

def generate_lotto_numbers_with_repeat():
    # 生成5个主球号码，号码范围是1-49
    main_balls = random.sample(range(1, 50), 5)
    # main_balls.sort()  # 对号码进行排序

    # 生成2个特别号码，号码范围是1-18
    special_balls = random.sample(range(1, 19), 2)
    # special_balls.sort()  # 对号码进行排序

    return main_balls, special_balls

# 打印生成的大乐透号码
main_balls, special_balls = generate_lotto_numbers_with_repeat()
print("主球号码：", main_balls)
print("特别号码：", special_balls)