import json
from collections import Counter

# Data from sporttery.cn API (already fetched)
raw_data = [
    {"issue": "26068", "date": "2026-06-20", "front": [3, 11, 12, 21, 22], "back": [6, 10]},
    {"issue": "26067", "date": "2026-06-17", "front": [6, 16, 18, 19, 28], "back": [7, 11]},
    {"issue": "26066", "date": "2026-06-15", "front": [10, 13, 19, 21, 30], "back": [4, 5]},
    {"issue": "26065", "date": "2026-06-13", "front": [4, 11, 12, 13, 25], "back": [4, 8]},
    {"issue": "26064", "date": "2026-06-10", "front": [3, 13, 15, 17, 21], "back": [2, 7]},
    {"issue": "26063", "date": "2026-06-08", "front": [3, 15, 20, 29, 31], "back": [1, 12]},
    {"issue": "26062", "date": "2026-06-06", "front": [7, 15, 20, 24, 29], "back": [4, 10]},
    {"issue": "26061", "date": "2026-06-03", "front": [10, 12, 26, 31, 35], "back": [2, 12]},
    {"issue": "26060", "date": "2026-06-01", "front": [22, 28, 30, 31, 34], "back": [1, 5]},
    {"issue": "26059", "date": "2026-05-30", "front": [6, 13, 17, 19, 26], "back": [7, 8]},
    {"issue": "26058", "date": "2026-05-27", "front": [7, 12, 13, 18, 34], "back": [1, 5]},
    {"issue": "26057", "date": "2026-05-25", "front": [23, 25, 26, 27, 34], "back": [4, 10]},
    {"issue": "26056", "date": "2026-05-23", "front": [6, 7, 18, 21, 30], "back": [1, 5]},
    {"issue": "26055", "date": "2026-05-20", "front": [9, 10, 20, 33, 35], "back": [4, 11]},
    {"issue": "26054", "date": "2026-05-18", "front": [2, 6, 14, 22, 24], "back": [8, 11]},
    {"issue": "26053", "date": "2026-05-16", "front": [2, 9, 14, 20, 31], "back": [5, 9]},
    {"issue": "26052", "date": "2026-05-13", "front": [2, 3, 20, 28, 33], "back": [2, 12]},
    {"issue": "26051", "date": "2026-05-11", "front": [13, 18, 28, 32, 33], "back": [2, 11]},
    {"issue": "26050", "date": "2026-05-09", "front": [6, 10, 14, 23, 33], "back": [8, 10]},
    {"issue": "26049", "date": "2026-05-06", "front": [1, 6, 14, 15, 17], "back": [2, 3]},
    {"issue": "26048", "date": "2026-05-04", "front": [11, 17, 20, 23, 35], "back": [1, 10]},
    {"issue": "26047", "date": "2026-05-02", "front": [9, 20, 21, 23, 28], "back": [6, 11]},
    {"issue": "26046", "date": "2026-04-29", "front": [1, 13, 18, 27, 33], "back": [4, 7]},
    {"issue": "26045", "date": "2026-04-27", "front": [1, 15, 21, 26, 33], "back": [4, 7]},
    {"issue": "26044", "date": "2026-04-25", "front": [3, 8, 22, 26, 29], "back": [7, 10]},
    {"issue": "26043", "date": "2026-04-22", "front": [8, 12, 14, 19, 22], "back": [11, 12]},
    {"issue": "26042", "date": "2026-04-20", "front": [2, 7, 13, 19, 24], "back": [3, 8]},
    {"issue": "26041", "date": "2026-04-18", "front": [24, 25, 27, 29, 34], "back": [2, 6]},
    {"issue": "26040", "date": "2026-04-15", "front": [6, 12, 13, 21, 34], "back": [8, 9]},
    {"issue": "26039", "date": "2026-04-13", "front": [9, 11, 20, 26, 27], "back": [6, 9]},
    {"issue": "26038", "date": "2026-04-11", "front": [8, 17, 21, 33, 35], "back": [6, 7]},
    {"issue": "26037", "date": "2026-04-08", "front": [7, 12, 13, 28, 32], "back": [6, 8]},
    {"issue": "26036", "date": "2026-04-06", "front": [4, 7, 16, 26, 32], "back": [5, 8]},
    {"issue": "26035", "date": "2026-04-04", "front": [2, 22, 30, 33, 34], "back": [8, 12]},
    {"issue": "26034", "date": "2026-04-01", "front": [11, 12, 25, 26, 27], "back": [8, 11]},
    {"issue": "26033", "date": "2026-03-30", "front": [3, 5, 7, 9, 18], "back": [2, 10]},
    {"issue": "26032", "date": "2026-03-28", "front": [3, 4, 19, 26, 32], "back": [1, 12]},
    {"issue": "26031", "date": "2026-03-25", "front": [6, 8, 22, 29, 34], "back": [5, 7]},
    {"issue": "26030", "date": "2026-03-23", "front": [2, 13, 22, 28, 34], "back": [5, 12]},
    {"issue": "26029", "date": "2026-03-21", "front": [3, 5, 17, 33, 35], "back": [5, 7]},
    {"issue": "26028", "date": "2026-03-18", "front": [15, 27, 29, 30, 34], "back": [1, 10]},
    {"issue": "26027", "date": "2026-03-16", "front": [9, 10, 11, 12, 16], "back": [1, 11]},
    {"issue": "26026", "date": "2026-03-14", "front": [10, 11, 22, 26, 32], "back": [1, 8]},
    {"issue": "26025", "date": "2026-03-11", "front": [3, 15, 24, 28, 29], "back": [3, 7]},
    {"issue": "26024", "date": "2026-03-09", "front": [2, 4, 8, 10, 21], "back": [9, 12]},
    {"issue": "26023", "date": "2026-03-07", "front": [9, 25, 26, 27, 28], "back": [1, 8]},
    {"issue": "26022", "date": "2026-03-04", "front": [5, 9, 10, 18, 26], "back": [5, 6]},
    {"issue": "26021", "date": "2026-03-02", "front": [5, 8, 12, 14, 17], "back": [4, 5]},
    {"issue": "26020", "date": "2026-02-28", "front": [1, 10, 21, 23, 29], "back": [10, 12]},
    {"issue": "26019", "date": "2026-02-25", "front": [12, 13, 14, 16, 31], "back": [4, 12]},
    {"issue": "26018", "date": "2026-02-11", "front": [9, 11, 19, 30, 35], "back": [1, 12]},
    {"issue": "26017", "date": "2026-02-09", "front": [4, 5, 10, 23, 31], "back": [7, 12]},
    {"issue": "26016", "date": "2026-02-07", "front": [8, 9, 12, 19, 24], "back": [1, 6]},
    {"issue": "26015", "date": "2026-02-04", "front": [1, 4, 10, 13, 17], "back": [3, 11]},
    {"issue": "26014", "date": "2026-02-02", "front": [16, 18, 23, 34, 35], "back": [1, 6]},
    {"issue": "26013", "date": "2026-01-31", "front": [3, 5, 6, 23, 26], "back": [1, 4]},
    {"issue": "26012", "date": "2026-01-28", "front": [1, 2, 9, 22, 25], "back": [1, 6]},
    {"issue": "26011", "date": "2026-01-26", "front": [14, 21, 23, 29, 33], "back": [2, 10]},
    {"issue": "26010", "date": "2026-01-24", "front": [2, 3, 13, 18, 26], "back": [2, 9]},
    {"issue": "26009", "date": "2026-01-21", "front": [5, 12, 13, 14, 33], "back": [5, 8]},
    {"issue": "26008", "date": "2026-01-19", "front": [3, 6, 17, 21, 33], "back": [5, 11]},
    {"issue": "26007", "date": "2026-01-17", "front": [1, 3, 13, 20, 26], "back": [3, 10]},
    {"issue": "26006", "date": "2026-01-14", "front": [5, 12, 18, 23, 35], "back": [6, 12]},
    {"issue": "26005", "date": "2026-01-12", "front": [2, 4, 16, 23, 35], "back": [6, 11]},
    {"issue": "26004", "date": "2026-01-10", "front": [5, 18, 23, 25, 32], "back": [5, 9]},
    {"issue": "26003", "date": "2026-01-07", "front": [2, 9, 11, 15, 16], "back": [2, 4]},
    {"issue": "26002", "date": "2026-01-05", "front": [4, 8, 15, 20, 31], "back": [7, 8]},
    {"issue": "26001", "date": "2026-01-03", "front": [7, 9, 23, 27, 32], "back": [2, 8]},
    {"issue": "25150", "date": "2025-12-31", "front": [13, 14, 15, 28, 31], "back": [1, 5]},
    {"issue": "25149", "date": "2025-12-29", "front": [24, 26, 30, 31, 32], "back": [5, 12]},
    {"issue": "25148", "date": "2025-12-27", "front": [3, 4, 14, 30, 32], "back": [8, 12]},
    {"issue": "25147", "date": "2025-12-24", "front": [6, 16, 21, 25, 33], "back": [7, 8]},
    {"issue": "25146", "date": "2025-12-22", "front": [6, 11, 13, 16, 22], "back": [2, 3]},
    {"issue": "25145", "date": "2025-12-20", "front": [5, 7, 20, 22, 25], "back": [4, 5]},
    {"issue": "25144", "date": "2025-12-17", "front": [2, 5, 13, 15, 28], "back": [5, 8]},
    {"issue": "25143", "date": "2025-12-15", "front": [3, 4, 18, 24, 29], "back": [7, 12]},
    {"issue": "25142", "date": "2025-12-13", "front": [9, 10, 14, 27, 29], "back": [2, 9]},
    {"issue": "25141", "date": "2025-12-10", "front": [4, 9, 24, 28, 29], "back": [2, 10]},
    {"issue": "25140", "date": "2025-12-08", "front": [4, 5, 13, 18, 34], "back": [2, 8]},
    {"issue": "25139", "date": "2025-12-06", "front": [8, 18, 22, 30, 35], "back": [1, 4]},
    {"issue": "25138", "date": "2025-12-03", "front": [1, 3, 19, 21, 23], "back": [7, 11]},
    {"issue": "25137", "date": "2025-12-01", "front": [7, 8, 9, 11, 22], "back": [5, 11]},
    {"issue": "25136", "date": "2025-11-29", "front": [7, 11, 15, 16, 23], "back": [9, 11]},
    {"issue": "25135", "date": "2025-11-26", "front": [2, 10, 16, 28, 32], "back": [1, 7]},
    {"issue": "25134", "date": "2025-11-24", "front": [7, 12, 18, 27, 33], "back": [9, 10]},
    {"issue": "25133", "date": "2025-11-22", "front": [4, 11, 23, 27, 35], "back": [7, 11]},
    {"issue": "25132", "date": "2025-11-19", "front": [1, 9, 10, 12, 19], "back": [6, 7]},
    {"issue": "25131", "date": "2025-11-17", "front": [3, 8, 25, 29, 32], "back": [9, 12]},
    {"issue": "25130", "date": "2025-11-15", "front": [1, 13, 16, 27, 29], "back": [2, 11]},
    {"issue": "25129", "date": "2025-11-12", "front": [3, 9, 14, 28, 35], "back": [2, 4]},
    {"issue": "25128", "date": "2025-11-10", "front": [3, 6, 26, 30, 33], "back": [11, 12]},
    {"issue": "25127", "date": "2025-11-08", "front": [4, 5, 19, 28, 29], "back": [5, 8]},
    {"issue": "25126", "date": "2025-11-05", "front": [1, 8, 18, 27, 30], "back": [6, 7]},
    {"issue": "25125", "date": "2025-11-03", "front": [10, 11, 13, 19, 35], "back": [4, 11]},
    {"issue": "25124", "date": "2025-11-01", "front": [6, 9, 14, 26, 27], "back": [8, 9]},
    {"issue": "25123", "date": "2025-10-29", "front": [8, 13, 24, 25, 31], "back": [4, 10]},
    {"issue": "25122", "date": "2025-10-27", "front": [2, 3, 6, 16, 17], "back": [4, 5]},
    {"issue": "25121", "date": "2025-10-25", "front": [2, 3, 8, 13, 21], "back": [7, 12]},
    {"issue": "25120", "date": "2025-10-22", "front": [11, 13, 22, 26, 35], "back": [2, 8]},
    {"issue": "25119", "date": "2025-10-20", "front": [8, 15, 27, 29, 31], "back": [1, 7]},
]

records = raw_data
N = len(records)
front_all = []
back_all = []
for r in records:
    front_all.extend(r['front'])
    back_all.extend(r['back'])

front_counter = Counter(front_all)
back_counter = Counter(back_all)

print(f'=== 大乐透数据分析报告 ===')
print(f'数据范围: {records[-1]["date"]} ~ {records[0]["date"]} (共{N}期)')
print(f'最新一期: 第{records[0]["issue"]}期 ({records[0]["date"]})')
print(f'最新开奖: 前区 {records[0]["front"]} + 后区 {records[0]["back"]}')
print()

# ========== Front Zone ==========
print('=' * 60)
print('【一、前区(1-35) 历史频率统计 (100期)】')
print('=' * 60)
print(f'{"号码":>4} {"次数":>6} {"频率%":>8} {"状态":>10}')
print('-' * 40)
for num in range(1, 36):
    count = front_counter.get(num, 0)
    freq = count / N * 100
    if freq >= 18:
        hot = 'HOT'
    elif freq >= 14:
        hot = 'WARM+'
    elif freq >= 10:
        hot = 'WARM'
    elif freq >= 7:
        hot = 'COLD-'
    else:
        hot = 'COLD'
    print(f'{num:>4} {count:>6} {freq:>8.1f} {hot:>10}')

print()
top5_front = [x[0] for x in front_counter.most_common(5)]
bottom5_front = [x[0] for x in front_counter.most_common()[:-6:-1]]
print(f'最热前5: {top5_front}')
print(f'最冷前5: {bottom5_front}')
print()

# ========== Back Zone ==========
print('=' * 60)
print('【二、后区(1-12) 历史频率统计 (100期)】')
print('=' * 60)
for num in range(1, 13):
    count = back_counter.get(num, 0)
    freq = count / N * 100
    if freq >= 20:
        hot = 'HOT'
    elif freq >= 16:
        hot = 'WARM+'
    elif freq >= 14:
        hot = 'WARM'
    elif freq >= 10:
        hot = 'COLD-'
    else:
        hot = 'COLD'
    print(f'{num:>4} {count:>6} {freq:>8.1f} {hot:>10}')

print()
print(f'最热后2: {[x[0] for x in back_counter.most_common(2)]}')
print()

# ========== Recent 10 ==========
print('=' * 60)
print('【三、近10期开奖明细】')
print('=' * 60)
recent10 = records[:10]
for r in reversed(recent10):
    print(f'第{r["issue"]}期 {r["date"]} | 前区: {r["front"]} | 后区: {r["back"]}')

print()
recent_front = []
recent_back = []
for r in recent10:
    recent_front.extend(r['front'])
    recent_back.extend(r['back'])

rcf = Counter(recent_front)
rcb = Counter(recent_back)

print(f'近10期前区热门: {[x[0] for x in rcf.most_common(8)]}')
print(f'近10期前区未出: {sorted([x for x in range(1,36) if x not in rcf])}')
print(f'近10期后区热门: {[x[0] for x in rcb.most_common(4)]}')
print(f'近10期后区未出: {sorted([x for x in range(1,13) if x not in rcb])}')
print()

# ========== Omit Analysis ==========
print('=' * 60)
print('【四、遗漏分析 (当前未出期数)】')
print('=' * 60)

front_omit = {}
for num in range(1, 36):
    omit = 0
    for r in records:
        if num in r['front']:
            break
        omit += 1
    front_omit[num] = omit

print('前区遗漏:')
for num in range(1, 36):
    o = front_omit[num]
    marker = ' <<< 长遗漏!' if o >= 10 else ''
    print(f'  {num:>2}: {o:>3}期{marker}')

long_omit_front = sorted([k for k,v in front_omit.items() if v >= 8])
print(f'\n长遗漏前区(>=8期): {long_omit_front}')

back_omit = {}
for num in range(1, 13):
    omit = 0
    for r in records:
        if num in r['back']:
            break
        omit += 1
    back_omit[num] = omit

print('\n后区遗漏:')
for num in range(1, 13):
    o = back_omit[num]
    marker = ' <<< 长遗漏!' if o >= 8 else ''
    print(f'  {num:>2}: {o:>3}期{marker}')

long_omit_back = sorted([k for k,v in back_omit.items() if v >= 6])
print(f'\n长遗漏后区(>=6期): {long_omit_back}')
print()

# ========== 区间分布 ==========
print('=' * 60)
print('【五、前区区间分布 (近30期)】')
print('=' * 60)
recent30 = records[:30]
zone1 = sum(1 for r in recent30 for f in r['front'] if 1 <= f <= 7)
zone2 = sum(1 for r in recent30 for f in r['front'] if 8 <= f <= 14)
zone3 = sum(1 for r in recent30 for f in r['front'] if 15 <= f <= 21)
zone4 = sum(1 for r in recent30 for f in r['front'] if 22 <= f <= 28)
zone5 = sum(1 for r in recent30 for f in r['front'] if 29 <= f <= 35)
total_30 = 30 * 5
print(f'一区(01-07): {zone1}次 ({zone1/total_30*100:.1f}%)')
print(f'二区(08-14): {zone2}次 ({zone2/total_30*100:.1f}%)')
print(f'三区(15-21): {zone3}次 ({zone3/total_30*100:.1f}%)')
print(f'四区(22-28): {zone4}次 ({zone4/total_30*100:.1f}%)')
print(f'五区(29-35): {zone5}次 ({zone5/total_30*100:.1f}%)')
print()

# ========== 奇偶比分析 ==========
print('=' * 60)
print('【六、奇偶比分析 (近30期)】')
print('=' * 60)
odd_even_count = Counter()
for r in recent30:
    odd = sum(1 for f in r['front'] if f % 2 == 1)
    even = 5 - odd
    odd_even_count[f'{odd}:{even}'] += 1
for ratio, cnt in odd_even_count.most_common():
    print(f'  {ratio} = {cnt}次')

print()

# ========== SCORING ==========
print('=' * 60)
print('【七、综合评分推荐】')
print('=' * 60)

# Score: full history(3) + recent10(2) + omit bonus(1)
front_scores = {}
for num in range(1, 36):
    score = 0
    full_freq = front_counter.get(num, 0) / N * 100
    score += full_freq * 3
    recent_freq = rcf.get(num, 0) / 10 * 100
    score += recent_freq * 2
    omit = front_omit[num]
    if omit >= 8:
        score += min(omit, 15) * 0.8
    front_scores[num] = score

sorted_front = sorted(front_scores.items(), key=lambda x: x[1], reverse=True)
print('\n前区评分 TOP20:')
for num, score in sorted_front[:20]:
    print(f'  {num:>2}: score={score:>6.1f} (历史{front_counter.get(num,0)}次, 近10期{rcf.get(num,0)}次, 遗漏{front_omit[num]}期)')

back_scores = {}
for num in range(1, 13):
    score = 0
    full_freq = back_counter.get(num, 0) / N * 100
    score += full_freq * 3
    recent_freq = rcb.get(num, 0) / 10 * 100
    score += recent_freq * 2
    omit = back_omit[num]
    if omit >= 6:
        score += min(omit, 12) * 0.8
    back_scores[num] = score

sorted_back = sorted(back_scores.items(), key=lambda x: x[1], reverse=True)
print('\n后区评分:')
for num, score in sorted_back:
    print(f'  {num:>2}: score={score:>6.1f} (历史{back_counter.get(num,0)}次, 近10期{rcb.get(num,0)}次, 遗漏{back_omit[num]}期)')

# Final recommendation
rec_front = sorted([x[0] for x in sorted_front[:5]])
rec_back = sorted([x[0] for x in sorted_back[:2]])

print()
print('#' * 60)
print(f'##  推荐号码: 前区 {rec_front}  +  后区 {rec_back}')
print('#' * 60)
print()
print('⚠️  免责声明: 彩票开奖为随机事件，以上分析仅供参考，不构成投注建议。')
print('请理性购彩，量力而行。')
