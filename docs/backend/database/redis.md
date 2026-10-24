---
title: Redis
icon: redis
category:
  - 后端
  - 数据库
tag:
  - redis
  - 缓存
  - NoSQL
---

# Redis

> Redis（Remote Dictionary Server）是一个基于内存、单线程（核心命令执行）、key-value 模型的高性能 NoSQL 数据库。它不仅做缓存，还常被用作分布式锁、消息队列、排行榜、计数器等。本文从「基本用法 → 常见问题 → 高级思想 → 多语言客户端差异」四个维度整理。

---

## 一、基本用法

### 1.1 安装与连接

```bash
# Linux
wget https://download.redis.io/releases/redis-7.2.tar.gz
make && make install

# 启动服务
redis-server /etc/redis/redis.conf

# 连接
redis-cli -h 127.0.0.1 -p 6379 -a yourpassword
```

连接后用 `PING` 测试，返回 `PONG` 即正常。

### 1.2 通用命令

| 命令 | 说明 |
|------|------|
| `KEYS pattern` | 列出匹配的 key（生产禁用，会阻塞）|
| `SCAN cursor [MATCH] [COUNT]` | 渐进式遍历，推荐替代 KEYS |
| `TYPE key` | 查看 key 的数据类型 |
| `EXISTS key` | 判断是否存在 |
| `DEL key [key...]` | 删除 |
| `EXPIRE key seconds` / `PEXPIRE key ms` | 设置过期 |
| `TTL key` / `PTTL key` | 查看剩余生存时间（-1 永久，-2 不存在）|
| `PERSIST key` | 移除过期 |
| `OBJECT ENCODING key` | 查看内部编码 |
| `INFO` | 查看服务信息 |
| `CONFIG GET / SET` | 读写配置 |

### 1.3 五大基础数据结构

#### String（字符串）

最基础类型，二进制安全，最大 512MB。内部编码：`int`（纯数字）→ `embstr`（≤44 字节）→ `raw`。

```redis
SET name "lfange" EX 60      # 设值并 60s 过期
SETNX name "x"               # 不存在才设置（简易分布式锁原语）
SET count 0
INCR count                   # 自增（原子）
INCRBY count 5
MSET k1 v1 k2 v2             # 批量设值
MGET k1 k2
APPEND name "_blog"
STRLEN name
GETRANGE name 0 4
SETEX session:abc 30 "data"  # 带过期设值
```

应用：缓存对象 JSON、计数器（点赞/阅读数）、分布式锁、限流计数。

#### List（列表）

双端列表，按插入顺序。编码：`quicklist`（ziplist + linkedlist 结合）。

```redis
LPUSH queue a b c            # 左插，结果 c b a
RPUSH queue x y              # 右插
LRANGE queue 0 -1            # 查全部
LPOP queue                   # 左弹
BLPOP queue 0                # 阻塞左弹，0 表示永久阻塞（简易消息队列）
LLEN queue
LINDEX queue 0
LREM queue 2 b               # 从左删 2 个 b
LTRIM queue 0 99             # 只保留前 100 个
```

应用：消息队列、最新 N 条记录、安全队列。

#### Hash（哈希）

字段-值映射，适合存对象。

```redis
HSET user:1 name "lfange" age 18 role "admin"
HGET user:1 name
HMGET user:1 name age
HINCRBY user:1 age 1
HGETALL user:1
HDEL user:1 role
HEXISTS user:1 age
HLEN user:1
HSCAN user:1 0               # 大 hash 渐进遍历
```

应用：用户信息、商品详情、部分更新比 String 存 JSON 更省。

#### Set（集合）

无序、去重。

```redis
SADD tags golang vue redis
SMEMBERS tags
SISMEMBER tags vue
SCARD tags
SREM tags vue
SINTER set1 set2             # 交集
SUNION set1 set2             # 并集
SDIFF set1 set2              # 差集
SRANDMEMBER tags 2           # 随机取 2 个
SPOP tags                    # 随机弹出一个
```

应用：标签、共同好友、去重、抽奖。

#### ZSet（有序集合）

每个元素带 score，按 score 排序，元素唯一。编码：`listpack`（小）→ `skiplist + hashtable`。

```redis
ZADD rank 100 alice 90 bob 85 carol
ZRANGE rank 0 -1 WITHSCORES              # 升序
ZREVRANGE rank 0 2 WITHSCORES            # 降序前 3（排行榜）
ZRANGEBYSCORE rank 80 100                # 按分数范围
ZRANK rank alice                         # 升序名次
ZSCORE rank alice
ZINCRBY rank 5 bob
ZREMRANGEBYRANK rank 0 0                 # 删除最低分
```

应用：排行榜、延时队列（score 存执行时间戳）、带权重的标签。

### 1.4 其他数据结构

| 类型 | 用途 | 关键命令 |
|------|------|----------|
| **Bitmap** | 位图，状态统计 | `SETBIT / GETBIT / BITCOUNT / BITOP` |
| **HyperLogLog** | 基数估算（UV），固定 12KB | `PFADD / PFCOUNT / PFMERGE` |
| **Geo** | 地理坐标 | `GEOADD / GEODIST / GEORADIUSBYMEMBER` |
| **Stream** | 5.0+ 消息流，支持消费组 | `XADD / XREAD / XGROUP / XACK` |
| **Bloom Filter** | 布隆过滤器（模块 RedisBloom）| `BF.ADD / BF.EXISTS` |

```redis
# Bitmap：用户签到
SETBIT sign:uid:202607 21 1          # 7月21日签到
BITCOUNT sign:uid:202607             # 本月签到次数

# HyperLogLog：页面 UV
PFADD page:uv:home user1 user2 user3
PFCOUNT page:uv:home

# Stream：消息队列
XADD orders * id 1001 amount 99
XREAD COUNT 10 STREAMS orders 0
XGROUP CREATE orders g1 0
XREADGROUP GROUP g1 consumer1 COUNT 10 STREAMS orders >
XACK orders g1 <id>
```

### 1.5 过期与删除策略

- **过期策略**：Redis 不会实时为每个 key 计时，而是组合两种方式：
  - **惰性删除**：访问 key 时才检查是否过期并删除。优点省 CPU，缺点会残留过期 key 占内存。
  - **定期删除**：每隔一段时间随机抽取一批设置了过期的 key 检查，删除已过期的。
- 两者结合保证「过期的 key 最终会被清理，且不会拖垮 CPU」。

### 1.6 持久化

| 方式 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **RDB** | 某时刻全量数据快照，fork 子进程生成 `.rdb` | 文件小、恢复快、适合备份 | 宕机会丢最近一段数据 |
| **AOF** | 追加每条写命令到 `.aof` | 数据安全性高，最多丢 1s | 文件大、恢复慢 |
| **混合持久化**（4.0+）| AOF 重写时前半段写 RDB 二进制，后半段写增量命令 | 兼顾性能与安全 | 需要 4.0+ |

AOF 三种刷盘策略（`appendfsync`）：

- `always`：每条命令都刷盘，最安全最慢。
- `everysec`：每秒刷盘（默认），平衡选项。
- `no`：交由 OS，最快但宕机丢数据多。

---

## 二、常见问题

### 2.1 缓存穿透

**定义**：大量请求查询**根本不存在**的数据（如 id=-1 或恶意构造 id），缓存和数据库都没有，每次都打到数据库。

**解决方案**：

1. **缓存空值**：DB 查不到也缓存 `null`（设短过期，如 60s），防止同一 key 反复打 DB。
2. **布隆过滤器**：请求先过布隆过滤器，不存在直接拦截。存在误判率但不会漏判。
3. **参数校验**：对明显非法参数（id < 0）直接拒绝。

### 2.2 缓存击穿

**定义**：某个**热点 key** 突然过期，瞬间大量并发请求同时打到 DB 重建缓存。

**解决方案**：

1. **互斥锁（推荐）**：缓存未命中时，用 `SETNX` 加锁，只让一个请求查 DB 重建，其他等待重试。
2. **热点 key 永不过期**：逻辑过期——value 存过期时间但不设 TTL，由后台异步更新。
3. **提前刷新**：监控 TTL，临近过期主动更新。

```redis
# 互斥锁示例
SET lock:hotkey 1 NX EX 10     # 加锁
# 查 DB → 写缓存
DEL lock:hotkey                # 释放
```

### 2.3 缓存雪崩

**定义**：**大量 key 同时过期**，或 Redis 宕机，请求全部涌向 DB。

**解决方案**：

1. **过期时间加随机值**：`expire = base + random(0, 300s)`，打散过期时间。
2. **多级缓存**：本地缓存（如 Caffeine）+ Redis + DB。
3. **熔断降级**：DB 压力大时返回兜底数据，保护 DB。
4. **高可用**：Redis 集群 + 哨兵，避免单点宕机。

### 2.4 大 Key 问题

**定义**：单个 key 的 value 过大（String > 10KB，或集合元素过多 > 1万）。

**危害**：阻塞主线程（Redis 单线程）、网络阻塞、删除时引发抖动、集群迁移卡顿。

**排查**：

```bash
redis-cli --bigkeys             # 采样找大 key
redis-cli -h x -p x --memkeys   # 按内存
MEMORY USAGE key                # 单个 key 内存
```

**解决**：

1. **拆分**：大 hash 拆成多个小 hash，按 `hash:uid:0/1/2` 分片。
2. **压缩**：value 用压缩算法（gzip / snappy）后再存。
3. **删除用 UNLINK**：`UNLINK` 异步删除，不阻塞主线程（`DEL` 是同步）。
4. **过期 + 后台删**：4.0+ 大 key 设置过期，由后台异步删除。

### 2.5 热 Key 问题

**定义**：某个 key 访问量极大，导致单个 Redis 节点 CPU / 网络打满。

**排查**：

```bash
redis-cli --hotkeys            # 需开启 LFU 淘汰策略
MONITOR                        # 抓命令（生产慎用，仅短时排查）
```

**解决**：

1. **本地缓存**：客户端缓存热点 key（多副本读取）。
2. **多副本**：把热 key 复制到多个 key（`hotkey_1/2/3`），客户端随机读。
3. **读写分离**：读打到从节点。

### 2.6 内存淘汰策略

`maxmemory-policy` 配置，内存满时如何淘汰：

| 策略 | 说明 |
|------|------|
| `noeviction` | 不淘汰，写入报错（默认部分场景）|
| `allkeys-lru` | 所有 key 中 LRU 淘汰（缓存常用）|
| `allkeys-lfu` | 所有 key 中 LFU 淘汰（4.0+，按访问频率）|
| `allkeys-random` | 随机淘汰 |
| `volatile-lru` | 设了过期的 key 中 LRU |
| `volatile-lfu` | 设了过期的 key 中 LFU |
| `volatile-ttl` | 设了过期的 key 中 TTL 最短的 |
| `volatile-random` | 设了过期的 key 中随机 |

> **LRU vs LFU**：LRU 最近最少使用（按时间），LFU 最不经常使用（按次数）。热点数据偶发访问用 LRU 可能被误淘汰，LFU 更适合长期热点。

### 2.7 分布式锁的坑

**简易实现**：

```redis
SET lock:order 1 NX EX 10    # 加锁 + 过期（原子）
```

**问题与演进**：

1. **误删别人的锁**：A 持锁超时自动释放，B 抢到锁，A 执行完 `DEL` 误删了 B 的锁。
   → value 存唯一标识（如 UUID），释放前用 Lua 校验再删（保证「判断+删除」原子）。

2. **业务执行超过锁过期**：锁提前释放。
   → **看门狗（watchdog）续期**：后台线程在锁快过期时续期。Redisson 已实现。

3. **Redlock**：Antirez 提出的多节点锁算法，向 N 个独立 master 申请锁，多数成功才算加锁成功。争议较大（GC pause、时钟漂移），生产慎用，一般用单节点 + 看门狗足够。

```lua
-- 释放锁的 Lua 脚本（判断+删除原子）
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
```

### 2.8 主从数据一致性

- Redis 主从是**异步复制**，主节点写入后立即返回，不等从节点确认。
- **延迟问题**：主从延迟期间，从节点读到旧数据。
- **读写分离的坑**：写主读从时，刚写完立刻读从，可能读不到（强一致场景需读主）。
- **解决思路**：
  - 强一致场景：关键读走主节点。
  - 用 `WAIT numreplicas timeout` 命令等待至少 N 个从节点同步完成（牺牲延迟换一致）。
  - 接受最终一致：读从 + 短暂延迟容忍。

---

## 三、高级思想

### 3.1 为什么 Redis 单线程还这么快？

1. **纯内存操作**：数据在内存，读写都是纳秒级，远超磁盘。
2. **单线程无锁、无上下文切换**：核心命令执行单线程，避免多线程的锁竞争和线程切换开销。
3. **IO 多路复用**：基于 epoll，单线程处理大量连接，非阻塞 IO。
4. **高效数据结构**：SDS、跳表、压缩列表、整数集合等针对场景优化。

> **澄清**：Redis 不是「全单线程」。6.0 前：核心命令单线程，但后台有 BIO 线程做异步任务（如 `UNLINK` 删除、AOF 刷盘）。6.0 后：引入**多线程 IO**（读写网络），命令执行仍单线程——因为瓶颈在网络 IO 而非 CPU，多线程 IO 显著提升吞吐。

### 3.2 IO 多路复用模型

```
客户端1 ─┐
客户端2 ─┼─► epoll_wait 监听所有 socket
客户端3 ─┘        │
                  ▼
        有事件就绪 ─► 串行处理就绪命令 ─► 写回响应
```

- 单线程事件循环（Reactor 模式）。
- 一个线程管理数万连接，CPU 不成为瓶颈。
- 代价：单个命令必须快，慢命令（`KEYS`、大 `SORT`、`HGETALL` 大 hash）会阻塞所有客户端。

### 3.3 Pipeline 管道

客户端一次性发送多条命令，服务端顺序执行后一次性返回，**减少 RTT**。

```redis
# 普通：3 条命令 = 3 次 RTT
SET k1 v1
SET k2 v2
SET k3 v3

# Pipeline：1 次 RTT
PIPELINE
SET k1 v1
SET k2 v2
SET k3 v3
EXEC
```

注意：

- Pipeline **不保证原子性**，中间可能插入其他客户端命令。
- 原子批量操作用 `MULTI/EXEC` 事务或 Lua。
- Pipeline vs 事务：Pipeline 是网络优化，事务是原子保证，可叠加使用。

### 3.4 事务（MULTI / EXEC）

```redis
MULTI                # 开启事务
SET k1 v1
INCR counter
EXEC                 # 原子执行所有命令
DISCARD              # 取消事务
```

- **不支持回滚**：命令运行时出错（如对字符串 INCR）不会回滚已执行的命令，Redis 认为这是程序 bug，不应在运行时暴露。
- **WATCH 实现乐观锁**：

```redis
WATCH balance        # 监视 balance
val = GET balance
MULTI
SET balance (val - 100)
EXEC                 # 若 balance 被 others 改动过，EXEC 返回 nil，事务中止
```

- Redis 事务本质是「命令打包顺序执行」，没有隔离级别概念，不如关系型事务强大。需要复杂原子操作用 **Lua 脚本**。

### 3.5 Lua 脚本

Lua 在 Redis 服务端执行，**原子**（执行期间不被其他命令打断），适合复杂原子操作。

```redis
EVAL "return redis.call('get', KEYS[1])" 1 mykey

-- 转账原子脚本
EVAL "
local from = tonumber(redis.call('get', KEYS[1]))
local to   = tonumber(redis.call('get', KEYS[2]))
local amt  = tonumber(ARGV[1])
if from < amt then return -1 end
redis.call('decrby', KEYS[1], amt)
redis.call('incrby', KEYS[2], amt)
return 1
" 2 account:a account:b 100
```

- 用 `EVALSHA` 传脚本 SHA1，避免每次传脚本全文。
- 注意 Lua 也会阻塞主线程，脚本要快。
- 7.0+ 推荐用 **Functions** 替代 EVAL，可持久化、可管理。

### 3.6 发布订阅 vs Stream

**Pub/Sub**：

```redis
SUBSCRIBE news         # 订阅
PUBLISH news "hello"   # 发布
```

- 消息不持久，离线订阅者丢失消息。
- 无消费组、无 ack。

**Stream**（5.0+，更完整的消息队列）：

```redis
XADD orders * id 1 amt 100
XGROUP CREATE orders g1 $
XREADGROUP GROUP g1 c1 COUNT 1 STREAMS orders >
XACK orders g1 <id>
XPENDING orders g1                  # 待 ack 消息
XCLAIM orders g1 c2 60000 <id>      # 转移超时消息给其他消费者
```

- 持久化、消费组、ack、消息回溯、死信转移。
- 适合轻量级消息队列，避免引入 Kafka/RabbitMQ。

### 3.7 高可用架构

#### 主从复制

- 一主多从，主写从读，**异步复制**。
- 全量同步：从节点首次连接，主节点 `BGSAVE` 生成 RDB 发给从节点。
- 增量同步：通过 **replication backlog（复制积压缓冲区）** 和 **offset** 实现。

#### 哨兵 Sentinel

- 监控主从节点状态。
- 主节点宕机自动**故障转移**：选举新主、通知从节点、通知客户端。
- 客户端连哨兵而非直连主节点。

#### Cluster 集群

- **数据分片**：16384 个哈希槽（hash slot），`slot = CRC16(key) % 16384`，分散到多个 master 节点。
- 每个 master 配一个或多个 slave。
- **去中心化**：节点间用 gossip 协议通信，无中心代理。
- **客户端路由**：客户端缓存槽位映射，命令发错节点会返回 `MOVED` 重定向。

```
key1 → slot 1234 → node A
key2 → slot 5678 → node B
key3 → slot 9012 → node C
```

- **限制**：跨槽操作受限，`MGET`、事务、Lua 跨槽会失败，需用 `hash tag`（如 `{user}:1`、`{user}:2` 保证同槽）。

### 3.8 对象编码与内存优化

Redis 每种类型有多种内部编码，根据数据规模自动切换，小数据用紧凑编码省内存：

| 类型 | 小数据编码 | 大数据编码 |
|------|-----------|-----------|
| String | int / embstr | raw |
| List | listpack | quicklist |
| Hash | listpack | hashtable |
| Set | intset / listpack | hashtable |
| ZSet | listpack | skiplist + hashtable |

优化手段：

- `ziplist`/`listpack` 限制：`hash-max-listpack-entries`、`list-max-listpack-size` 等参数控制阈值。
- 小对象用紧凑编码可省 50%+ 内存。
- 字段名缩短（`user_name` → `un`）省内存但牺牲可读性，需权衡。

### 3.9 内存管理与淘汰

- `maxmemory` 设置上限。
- `INFO memory` 查看内存使用，关注 `used_memory_rss`（OS 角度）vs `used_memory`（Redis 角度）。
- **内存碎片**：频繁修改删除产生碎片，`activedefrag yes` 开启自动碎片整理。
- 过期 + 淘汰策略配合控制内存。

---

## 四、Node 与其他语言使用差异

Redis 协议（RESP）是文本协议，所有语言客户端本质相同，但**并发模型、连接管理、API 风格**差异显著。以下重点对比 **Node.js** 与 Go / Java / Python。

### 4.1 Node.js 客户端

主流两个库：

| 库 | 特点 |
|----|------|
| **ioredis** | 功能全，支持 Cluster、Sentinel、Pipeline、Lua、流式订阅，社区活跃，TypeScript 友好 |
| **node-redis** | 官方维护，API 较新，支持 Cluster |

#### 基本使用（ioredis）

```js
const Redis = require('ioredis')
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: 'xxx',
  // 连接池：ioredis 默认单连接，需手动起多条
  db: 0,
  retryStrategy(times) {
    return Math.min(times * 50, 2000)
  },
})

// promise 风格
await redis.set('name', 'lfange', 'EX', 60)
const name = await redis.get('name')
await redis.incr('counter')

// pipeline
const results = await redis.pipeline()
  .set('k1', 'v1')
  .incr('counter')
  .get('k1')
  .exec()
// results: [[err, val], [err, val], ...]

// 事务（MULTI/EXEC）
const txRes = await redis.multi()
  .set('k1', 'v1')
  .incr('counter')
  .exec()

// Lua
const sha = await redis.script('LOAD', 'return redis.call("get", KEYS[1])')
const val = await redis.evalsha(sha, 1, 'mykey')

// pub/sub —— 订阅必须用独立连接
const sub = new Redis()
sub.subscribe('news')
sub.on('message', (channel, msg) => {
  console.log(channel, msg)
})
```

### 4.2 Node 与其他语言的核心差异

#### 差异 1：并发模型 → 连接池设计不同

- **Node 单线程事件循环**：一条 Redis 连接即可处理高并发请求，因为命令是异步非阻塞排队下发。ioredis 默认**单连接复用**，多个 Promise 共享一条连接。
- **Go / Java / Python 多线程**：传统阻塞 IO 模型下，一个线程占一条连接，需要**连接池**（如 Java Jedis 池、Go redigo 池）来支撑并发。
  - Java Lettuce（基于 Netty，异步）也支持单连接复用，与 Node 模型接近。
  - Go 的 `go-redis` 内部多路复用，单连接也能高并发，也接近 Node。

> 结论：Node 的单连接复用是「天生适配」Node 的事件循环；Go/Java 早期客户端依赖连接池，现代异步客户端（Lettuce、go-redis）已向 Node 模型靠拢。

#### 差异 2：API 风格 —— Callback/Promise vs 同步阻塞

- **Node**：天然异步，命令返回 Promise（或 callback），用 `await`，**绝不阻塞事件循环**。
- **Go**：`redigo` 用 `conn.Do("GET", key)` 同步阻塞调用，配合 goroutine 并发；`go-redis` 提供 context + 异步风格。
- **Java**：Jedis 同步阻塞（线程阻塞等响应）；Lettuce 异步 Future/Reactive。
- **Python**：`redis-py` 同步阻塞；`redis.asyncio`（4.2+）异步，类似 Node。

```js
// Node：非阻塞，一个连接并发 1000 个请求毫无压力
const ps = Array.from({ length: 1000 }, (_, i) => redis.set(`k${i}`, i))
await Promise.all(ps)
```

```go
// Go redigo：同步，需要连接池或 goroutine
conn := pool.Get()
defer conn.Close()
v, err := redis.String(conn.Do("GET", "key"))
```

```java
// Java Jedis：同步阻塞
try (Jedis jedis = pool.getResource()) {
    String v = jedis.get("key");   // 阻塞当前线程
}
```

#### 差异 3：阻塞命令在 Node 中更致命

- Redis 单线程怕慢命令（`KEYS`、大 `SORT`、大 `HGETALL`）。
- **Node 也是单线程（主线程）**：如果用 Redis 时还做了 CPU 密集计算，事件循环阻塞会导致所有请求卡住，比多线程语言更敏感。
- 对策：CPU 密集任务丢到 `worker_threads` 或子进程；Redis 慢命令换 `SCAN`、`HSCAN`。

#### 差异 4：Pub/Sub 与连接独占

- 所有语言订阅模式都需要独立连接（订阅期间该连接不能发其他命令）。
- **Node 中尤其注意**：ioredis 的发布连接和订阅连接必须分开 `new Redis()`，否则发布命令会报错。这是 Node 开发者常踩的坑。
- Go/Java 同理，但语言层面 Node 用 EventEmitter 接收消息更自然。

#### 差异 5：Cluster 客户端与重定向

- ioredis、go-redis、Lettuce 都内置 Cluster 客户端，自动处理 `MOVED` / `ASK` 重定向、槽位缓存。
- 老的 Jedis Cluster API 对跨槽操作支持差，需要 `mset` 跨槽时 Node/Go 现代客户端更友好。
- **hash tag** 在所有语言都需手动加：`{user}:1`、`{user}:2` 保证同槽，才能用事务/Lua 跨 key。

#### 差异 6：Pipeline / 事务 API 形态

| 语言 | Pipeline | 事务 |
|------|----------|------|
| Node ioredis | `redis.pipeline().a().b().exec()` 返回 Promise | `redis.multi().a().b().exec()` |
| Go go-redis | `pipe := rdb.Pipeline(); pipe.Set(...); pipe.Exec(ctx)` | `tx := rdb.Tx(); tx.Do(...)` |
| Java Jedis | `jedis.pipelined()` 同步返回 Response | `jedis.multi()` |
| Python redis-py | `pipe = r.pipeline(); pipe.set(...); pipe.execute()` | `pipe = r.pipeline(transaction=True)` |

> Node 的链式 API 最贴近 JavaScript 风格，且全程 Promise；Go 用 context 传递超时/取消；Java Jedis 是同步阻塞返回 `Response` 对象再统一取值。

### 4.3 选型建议

| 场景 | 推荐 |
|------|------|
| Node 后端（NestJS/Express/Koa） | ioredis（生态成熟、TS 友好）|
| 需要官方维护 | node-redis |
| 高并发 + 异步框架 | 单连接复用足够，按需开 2~3 条连接分流 |
| CPU 密集 + Redis 操作 | 用 worker_threads 处理计算，主线程只做 IO |

### 4.4 Node 最佳实践

1. **连接复用**：全局单例 `redis` 客户端，不要每个请求 new。
2. **Pipeline 批量**：循环里多次操作用 pipeline，减少 RTT。
3. **Lua 替代事务**：复杂原子操作用 Lua，比 MULTI 更可靠。
4. **订阅独立连接**：`new Redis()` 单独给 pub/sub。
5. **错误处理与重连**：监听 `error` 事件，配置 `retryStrategy`，避免进程崩溃。
6. **慢命令规避**：`KEYS` → `SCAN`，`HGETALL` 大 hash → `HSCAN`。
7. **key 设计**：加业务前缀（`user:1`、`cache:home`），便于治理。
8. **过期时间必加**：缓存 key 务必设过期，避免内存泄漏。

```js
// 健壮的客户端封装示例
const redis = new Redis({ ... })
redis.on('error', (e) => logger.error('redis error', e))
redis.on('connect', () => logger.info('redis connected'))

// 通用缓存函数
async function cacheGet(key, loader, ttl = 60) {
  const hit = await redis.get(key)
  if (hit) return JSON.parse(hit)
  const data = await loader()
  await redis.set(key, JSON.stringify(data), 'EX', ttl)
  return data
}
```

---

## 五、速查表

### 常用命令速查

```redis
# String
SET key val [EX s] [NX|XX]
GET / INCR / DECR / INCRBY / MSET / MGET

# List
LPUSH / RPUSH / LPOP / RPOP / LRANGE / LLEN / BLPOP

# Hash
HSET / HGET / HMGET / HGETALL / HINCRBY / HDEL / HSCAN

# Set
SADD / SMEMBERS / SINTER / SUNION / SDIFF / SPOP

# ZSet
ZADD / ZRANGE / ZREVRANGE / ZRANGEBYSCORE / ZINCRBY / ZRANK

# 通用
EXISTS / DEL / EXPIRE / TTL / TYPE / SCAN / OBJECT ENCODING / UNLINK / INFO
```

### 数据结构选型决策

```
需要缓存对象？
├─ 整体读写多 → String 存 JSON
└─ 字段独立读写多 → Hash

需要队列？
├─ 简单、允许丢 → List + BLPOP
├─ 需要持久/消费组 → Stream
└─ 延时队列 → ZSet（score=执行时间戳）

需要排行榜 → ZSet
需要去重/标签 → Set
需要计数 UV → HyperLogLog
需要签到/状态位 → Bitmap
需要附近的人 → Geo
```

### 面试高频问

1. 为什么 Redis 快？（内存 + 单线程 + IO 多路复用 + 高效数据结构）
2. 单线程为何 6.0 引入多线程？（网络 IO 多线程，命令执行仍单线程）
3. 缓存三兄弟？（穿透=查不存在、击穿=热点过期、雪崩=大量过期/宕机）
4. 分布式锁怎么实现？坑在哪？（SETNX EX、误删、续期、Redlock）
5. RDB vs AOF？（快照 vs 日志，混合持久化）
6. 主从复制原理？（全量 + 增量，backlog + offset）
7. Cluster 如何分片？（16384 槽，CRC16，MOVED 重定向）
8. 大 key / 热 key 怎么处理？（拆/压缩/UNLINK；本地缓存/多副本）

---

> **小结**：Redis 的核心是「内存 + 单线程事件循环 + 多路复用 + 丰富数据结构」。掌握数据结构选型、缓存三兄弟、分布式锁演进、高可用架构，是后端 Redis 的基本功。在 Node.js 中，得益于事件循环模型，单连接复用即可支撑高并发，但要警惕慢命令阻塞事件循环、订阅连接独占等 Node 特有的坑。
