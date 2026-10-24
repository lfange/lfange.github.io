---
title: Web 开发
category:
  - 后端
tag:
  - Python
---

# Python Web 开发（Flask + FastAPI）

Web 开发是 Python 最热门的应用方向之一。从早期的 CGI、Django，到后来的 Flask、Tornado，再到如今基于类型提示与异步 IO 的 FastAPI，Python Web 生态一直在演进。本篇将带你从协议层面理解 Python Web 的本质，再分别用 Flask 与 FastAPI 两个主流框架写出完整可运行的 CRUD 接口，最后讲解 RESTful 设计规范与部署方式。

本篇基于 Python 3.12+，Pydantic v2 语法。

---

## 一、Python Web 概览

### 1.1 WSGI 与 ASGI：两个时代

Python Web 应用本身不直接监听 TCP 端口，而是依赖一个「服务器网关」把 HTTP 请求转交给应用。协议规定了服务器与应用之间如何对话，最重要的有两条：

- **WSGI（PEP 3333）**：同步协议，诞生于 2010 年。应用是一个可调用对象 `app(environ, start_response)`，服务器同步调用它，等它返回响应再继续下一个请求。代表框架：Django、Flask、Bottle。
- **ASGI（Asynchronous Server Gateway Interface）**：异步协议，2018 年由 Starlette 团队提出，是 WSGI 的异步超集。应用是一个 `async def app(scope, receive, send)`，支持 WebSocket、HTTP/2、长连接。代表框架：FastAPI、Starlette、Litestar、Sanic（自有协议）、Django 3.0+ 的异步视图。

下面是一个最小 WSGI 应用，不依赖任何框架，直接用 Python 标准库跑起来：

```python
# wsgi_app.py
def app(environ, start_response):
    """一个最小的 WSGI 应用：访问任意路径都返回 Hello"""
    status = "200 OK"
    headers = [("Content-Type", "text/plain; charset=utf-8")]
    start_response(status, headers)
    path = environ.get("PATH_INFO", "/")
    return [f"Hello WSGI, you visited: {path}".encode("utf-8")]


if __name__ == "__main__":
    # 标准库自带一个 WSGI 服务器，仅供调试
    from wsgiref.simple_server import make_server
    with make_server("", 8000, app) as httpd:
        print("Serving on http://localhost:8000  (Ctrl+C 退出)")
        httpd.serve_forever()
# 启动：python wsgi_app.py
# 浏览器访问 http://localhost:8000/abc 看到：Hello WSGI, you visited: /abc
```

对应的最小 ASGI 应用：

```python
# asgi_app.py
async def app(scope, receive, send):
    """一个最小的 ASGI 应用"""
    assert scope["type"] == "http"
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"text/plain; charset=utf-8")],
    })
    path = scope["path"]
    body = f"Hello ASGI, you visited: {path}".encode("utf-8")
    await send({"type": "http.response.body", "body": body})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
# 启动：python asgi_app.py
# 浏览器访问 http://localhost:8000/xyz 看到：Hello ASGI, you visited: /xyz
```

::: tip WSGI 与 ASGI 的本质区别
WSGI 是同步阻塞模型，一个 worker 同时只能处理一个请求；ASGI 基于事件循环（asyncio），一个 worker 可同时挂起成千上万个请求，非常适合 IO 密集场景（数据库慢查询、调用外部 API、大模型流式输出）。
:::

### 1.2 框架分类与选型

| 框架 | 协议 | 风格 | 典型场景 |
|------|------|------|----------|
| Django | WSGI（3.0+ 部分支持 ASGI） | 全栈、电池齐全 | 内容管理、电商后台、传统企业系统 |
| Flask | WSGI | 微框架，灵活组装 | 中小项目、内部工具、原型验证 |
| FastAPI | ASGI | 现代、类型驱动、异步 | 高并发 API、AI 服务、微服务 |
| Tornado | 自有异步 | 非阻塞、长连接 | 长轮询、WebSocket 推送 |
| Starlette | ASGI | 轻量、底层 | 自研框架的基座 |
| Litestar（原 Starlite） | ASGI | FastAPI 的竞品 | 与 FastAPI 类似，更强调 DI 与分层 |

**选型建议**：

- 团队熟悉 Python、需要快速出 MVP：Flask。
- 接口需要类型校验、自动文档、高并发、对接 AI/微服务：FastAPI。
- 大而全、需要 ORM/Admin/Auth 一站式：Django。
- 已有 Django 项目，想逐步异步化：继续用 Django，按需开启 ASGI。

---

## 二、Flask 入门

### 2.1 安装与最小应用

```bash
pip install flask
```

最小应用：

```python
# hello.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello, Flask!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
# 启动：python hello.py
# 访问 http://localhost:5000/ 看到：Hello, Flask!
```

也可以用命令行启动（推荐）：

```bash
# 设置 FLASK_APP 后用 flask run
set FLASK_APP=hello
set FLASK_DEBUG=1
flask run --port 5000
```

`app.run(debug=True)` 仅用于开发，开启后会自动热重载、显示详细错误页。生产环境必须用 WSGI 服务器（gunicorn/uwsgi）运行。

### 2.2 路由

Flask 用 `@app.route` 装饰器把 URL 绑定到函数。动态路由支持类型转换器：

```python
from flask import Flask

app = Flask(__name__)

@app.route("/user/<username>")
def show_user(username):
    return f"User: {username}"

@app.route("/post/<int:post_id>")
def show_post(post_id):
    # int 转换器：post_id 自动是 int 类型
    return f"Post #{post_id}, type={type(post_id).__name__}"

@app.route("/path/<path:subpath>")
def show_subpath(subpath):
    # path 转换器：匹配含斜杠的整段路径
    return f"Subpath: {subpath}"

@app.route("/login", methods=["GET", "POST"])
def login():
    from flask import request
    if request.method == "POST":
        return "处理登录表单"
    return "显示登录页面"
```

常用转换器：`string`（默认）、`int`、`float`、`path`、`uuid`。

**反向生成 URL**：`url_for` 根据函数名生成 URL，避免硬编码。

```python
from flask import Flask, url_for

app = Flask(__name__)

@app.route("/")
def index():
    # 生成 /user/alice
    user_url = url_for("show_user", username="alice")
    return f'访问用户：<a href="{user_url}">alice</a>'

@app.route("/user/<username>")
def show_user(username):
    return f"User: {username}"
```

### 2.3 请求对象 request

`flask.request` 是线程安全的全局代理，封装了当前请求的所有数据：

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/inspect", methods=["GET", "POST"])
def inspect():
    info = {
        "args": dict(request.args),          # 查询参数 ?a=1&b=2
        "form": dict(request.form),          # 表单字段
        "json": request.get_json(silent=True),  # JSON 请求体
        "headers": dict(request.headers),    # 请求头
        "cookies": request.cookies,          # Cookie
        "method": request.method,
        "url": request.url,
    }
    # 文件上传：request.files
    if "file" in request.files:
        f = request.files["file"]
        info["file"] = {"filename": f.filename, "size": len(f.read())}
    return jsonify(info)

# 测试：
# curl "http://localhost:5000/inspect?a=1&b=2"
# curl -X POST -H "Content-Type: application/json" -d '{"x":10}' http://localhost:5000/inspect
```

### 2.4 响应与错误处理

```python
from flask import Flask, jsonify, make_response, abort, request

app = Flask(__name__)

@app.route("/text")
def text():
    return "纯文本"  # 默认 text/html, 200

@app.route("/json")
def json_resp():
    return jsonify(code=0, msg="ok", data=[1, 2, 3])  # application/json

@app.route("/custom")
def custom():
    resp = make_response("自定义响应", 201)
    resp.headers["X-Custom"] = "hello"
    resp.set_cookie("token", "abc", httponly=True)
    return resp

@app.route("/admin")
def admin_only():
    if request.args.get("role") != "admin":
        abort(403, description="仅管理员可访问")
    return "欢迎管理员"

# 统一错误处理：把 HTTP 异常转成 JSON
@app.errorhandler(404)
def not_found(err):
    return jsonify(code=404, msg=str(err.description)), 404

@app.errorhandler(403)
def forbidden(err):
    return jsonify(code=403, msg=str(err.description)), 403

@app.errorhandler(500)
def server_error(err):
    app.logger.exception("内部错误")
    return jsonify(code=500, msg="服务器内部错误"), 500
```

### 2.5 Jinja2 模板

Flask 默认使用 Jinja2，模板放在 `templates/` 目录。

```
project/
├── app.py
└── templates/
    ├── base.html
    └── user.html
```

`templates/base.html`：

```html
<!DOCTYPE html>
<html>
<head><title>{% block title %}默认标题{% endblock %}</title></head>
<body>
  <nav>导航栏</nav>
  {% block content %}{% endblock %}
  <footer>页脚</footer>
</body>
</html>
```

`templates/user.html`：

```html
{% extends "base.html" %}
{% block title %}用户：{{ name }}{% endblock %}
{% block content %}
  <h1>你好，{{ name }}</h1>
  <ul>
    {% for item in items %}
      <li>{{ loop.index }}. {{ item }}</li>
    {% endfor %}
  </ul>
{% endblock %}
```

`app.py`：

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/user/<name>")
def user_page(name):
    return render_template("user.html", name=name, items=["读书", "写代码", "跑步"])

# 访问 http://localhost:5000/user/lfange 即可看到渲染结果
```

### 2.6 蓝图 Blueprint

蓝图用来把应用拆成多个模块，避免所有路由堆在一个文件里。

```python
# blueprints/user_bp.py
from flask import Blueprint, jsonify

user_bp = Blueprint("user", __name__, url_prefix="/api/users")

@user_bp.route("/")
def list_users():
    return jsonify(users=[{"id": 1, "name": "Alice"}])

@user_bp.route("/<int:uid>")
def get_user(uid):
    return jsonify(id=uid, name="Alice")
```

```python
# app.py
from flask import Flask
from blueprints.user_bp import user_bp

app = Flask(__name__)
app.register_blueprint(user_bp)  # 注册蓝图
```

### 2.7 配置管理

```python
from flask import Flask

app = Flask(__name__)

# 方式 1：直接写
app.config["DEBUG"] = True
app.config["DB_URL"] = "sqlite:///app.db"

# 方式 2：从对象导入（推荐，便于多环境）
class Config:
    DEBUG = True
    SECRET_KEY = "change-me-in-production"

class ProdConfig(Config):
    DEBUG = False
    DB_URL = "postgresql://user:pwd@db:5432/prod"

app.config.from_object(ProdConfig)

# 方式 3：从环境变量读取
import os
app.config["API_KEY"] = os.environ.get("API_KEY", "default")
```

::: warning SECRET_KEY 不可泄露
`SECRET_KEY` 用于 session 签名，泄露后攻击者可伪造 session。生产环境必须从环境变量或密钥管理服务读取，且长度足够（建议 32 字节以上随机字符串）。
:::

### 2.8 Session 与 Cookie

```python
from flask import Flask, session, redirect, url_for, request, jsonify

app = Flask(__name__)
app.secret_key = "a-very-long-random-string-keep-it-secret"

@app.route("/login")
def login():
    session["user"] = "Alice"
    return "已登录"

@app.route("/me")
def me():
    user = session.get("user")
    if not user:
        return jsonify(msg="未登录"), 401
    return jsonify(user=user)

@app.route("/logout")
def logout():
    session.pop("user", None)
    return "已登出"
```

### 2.9 实战：Flask TODO API（内存存储）

下面是一个完整的 TODO 接口，支持增删改查、分页、错误处理、蓝图组织：

```python
# todo_flask.py
"""Flask 实现的 TODO RESTful API，内存存储，重启即清空。"""
from flask import Flask, Blueprint, request, jsonify, abort
from werkzeug.exceptions import HTTPException
import uuid
from datetime import datetime

todo_bp = Blueprint("todo", __name__, url_prefix="/api/todos")

# 内存存储：{id: {...}}
_store: dict[str, dict] = {}


def _serialize(item: dict) -> dict:
    return {
        "id": item["id"],
        "title": item["title"],
        "done": item["done"],
        "created_at": item["created_at"],
    }


@todo_bp.get("/")
def list_todos():
    """GET /api/todos/?done=false&page=1&size=10"""
    done = request.args.get("done")  # None / "true" / "false"
    page = max(int(request.args.get("page", 1)), 1)
    size = max(int(request.args.get("size", 10)), 1)

    items = list(_store.values())
    if done is not None:
        want = done.lower() == "true"
        items = [x for x in items if x["done"] == want]

    total = len(items)
    start = (page - 1) * size
    page_items = items[start:start + size]
    return jsonify(total=total, page=page, size=size,
                   data=[_serialize(x) for x in page_items])


@todo_bp.get("/<todo_id>")
def get_todo(todo_id: str):
    item = _store.get(todo_id)
    if not item:
        abort(404, description="todo not found")
    return jsonify(_serialize(item))


@todo_bp.post("/")
def create_todo():
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title:
        abort(400, description="title 不能为空")
    if len(title) > 100:
        abort(400, description="title 最长 100 字符")

    item = {
        "id": uuid.uuid4().hex,
        "title": title,
        "done": bool(body.get("done", False)),
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    _store[item["id"]] = item
    return jsonify(_serialize(item)), 201


@todo_bp.put("/<todo_id>")
def update_todo(todo_id: str):
    item = _store.get(todo_id)
    if not item:
        abort(404, description="todo not found")
    body = request.get_json(silent=True) or {}
    if "title" in body:
        title = (body["title"] or "").strip()
        if not title:
            abort(400, description="title 不能为空")
        item["title"] = title
    if "done" in body:
        item["done"] = bool(body["done"])
    return jsonify(_serialize(item))


@todo_bp.delete("/<todo_id>")
def delete_todo(todo_id: str):
    if todo_id not in _store:
        abort(404, description="todo not found")
    _store.pop(todo_id)
    return "", 204


# ---- 应用与全局错误处理 ----
app = Flask(__name__)
app.register_blueprint(todo_bp)


@app.errorhandler(HTTPException)
def handle_http_exc(e: HTTPException):
    return jsonify(code=e.code, msg=e.description), e.code


@app.errorhandler(Exception)
def handle_other(e: Exception):
    app.logger.exception("未捕获异常")
    return jsonify(code=500, msg="服务器内部错误"), 500


if __name__ == "__main__":
    print("启动：http://localhost:5000/api/todos/")
    app.run(debug=True, port=5000)
```

启动后用 curl 测试：

```bash
# 创建
curl -X POST http://localhost:5000/api/todos/ -H "Content-Type: application/json" -d '{"title":"学 Flask"}'
# 列表
curl "http://localhost:5000/api/todos/?page=1&size=10"
# 更新
curl -X PUT http://localhost:5000/api/todos/<id> -H "Content-Type: application/json" -d '{"done":true}'
# 删除
curl -X DELETE http://localhost:5000/api/todos/<id>
```

::: details 为什么用 `HTTPException` 做错误处理？
`abort(404)` 实际抛出的是 `werkzeug.exceptions.NotFound`（继承自 `HTTPException`）。统一拦截它就能把所有 4xx/5xx 转成 JSON，符合前后端分离项目的约定。
:::

---

## 三、FastAPI 入门（重点）

FastAPI 基于 Starlette（ASGI）与 Pydantic（数据校验），2018 年由 Sebastián Ramírez 发布，凭借类型提示、自动文档、高性能成为当下最热门的 Python Web 框架。

### 3.1 安装与最小应用

```bash
pip install fastapi "uvicorn[standard]"
```

最小应用：

```python
# main.py
from fastapi import FastAPI

app = FastAPI(title="My API", version="0.1.0")

@app.get("/")
async def root():
    return {"msg": "Hello, FastAPI!"}
```

启动：

```bash
uvicorn main:app --reload --port 8000
# main:app 表示 main.py 里的 app 对象
# --reload 开启热重载（仅开发用）
```

启动后：

- 接口：http://localhost:8000/
- Swagger 交互文档：http://localhost:8000/docs
- ReDoc 文档：http://localhost:8000/redoc

::: tip 自动文档的原理
FastAPI 根据你的路由签名与 Pydantic 模型，自动生成 OpenAPI 3.1 schema，`/docs` 与 `/redoc` 只是渲染这份 schema 的前端。你不需要额外写注释。
:::

### 3.2 路径参数、查询参数、请求体

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel, Field, ConfigDict

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    """路径参数 item_id 自动转为 int；q 是可选查询参数"""
    return {"item_id": item_id, "q": q}


@app.get("/search")
async def search(
    keyword: str = Query(..., min_length=1, max_length=50, description="搜索关键词"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    """Query(...) 用 ... 表示必填，ge=1 表示大于等于 1"""
    return {"keyword": keyword, "page": page, "size": size}


class Item(BaseModel):
    model_config = ConfigDict(json_schema_extra={"example": {"name": "鼠标", "price": 99.9}})

    name: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0)
    tags: list[str] = Field(default_factory=list)


@app.post("/items", status_code=201)
async def create_item(item: Item):
    """请求体直接用 Pydantic 模型声明，FastAPI 自动校验"""
    return {"created": item}
```

测试：

```bash
curl -X POST http://localhost:8000/items -H "Content-Type: application/json" -d '{"name":"鼠标","price":99.9,"tags":["电子"]}'
# 校验失败示例：
curl -X POST http://localhost:8000/items -H "Content-Type: application/json" -d '{"name":"","price":-1}'
# 返回 422 + 详细错误
```

### 3.3 Pydantic v2 模型与校验

Pydantic v2 用 Rust 重写了核心，性能比 v1 快 5～50 倍，语法也有调整：

```python
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    user = "user"


class UserIn(BaseModel):
    # model_config 替代 v1 的 class Config
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(..., min_length=2, max_length=20)
    age: int = Field(..., ge=0, le=150)
    email: EmailStr
    role: Role = Role.user
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("name")
    @classmethod
    def name_must_not_be_admin(cls, v: str) -> str:
        if v.lower() == "admin":
            raise ValueError("name 不能为 admin")
        return v


# 使用
u = UserIn(name="  Alice  ", age=30, email="a@b.com")
print(u.model_dump())           # 输出字典，name 已被 strip 成 "Alice"
print(u.model_dump_json())      # 输出 JSON 字符串
```

::: warning Pydantic v1 → v2 主要变化
- `class Config:` 改为 `model_config = ConfigDict(...)`
- `dict()` / `json()` 改为 `model_dump()` / `model_dump_json()`
- `parse_obj()` 改为 `model_validate()`
- `@validator` 改为 `@field_validator`（且需 `@classmethod`）
- `orm_mode=True` 改为 `from_attributes=True`
:::

### 3.4 响应模型、状态码、HTTPException

`response_model` 用来过滤输出，避免泄漏内部字段：

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()


class UserPublic(BaseModel):
    id: int
    name: str


class UserInDB(UserPublic):
    hashed_password: str


_db: dict[int, UserInDB] = {
    1: UserInDB(id=1, name="Alice", hashed_password="***"),
}


@app.get("/users/{uid}", response_model=UserPublic)
async def get_user(uid: int):
    user = _db.get(uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="user not found")
    return user  # 自动只返回 UserPublic 的字段，hashed_password 被过滤


@app.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(name: str):
    new_id = max(_db) + 1 if _db else 1
    user = UserInDB(id=new_id, name=name, hashed_password="***")
    _db[new_id] = user
    return user
```

常用 `status` 常量：

```python
from fastapi import status
status.HTTP_200_OK
status.HTTP_201_CREATED
status.HTTP_204_NO_CONTENT
status.HTTP_400_BAD_REQUEST
status.HTTP_401_UNAUTHORIZED
status.HTTP_403_FORBIDDEN
status.HTTP_404_NOT_FOUND
status.HTTP_409_CONFLICT
status.HTTP_422_UNPROCESSABLE_ENTITY
status.HTTP_500_INTERNAL_SERVER_ERROR
```

### 3.5 依赖注入 Depends

FastAPI 的依赖注入非常优雅，函数参数里写 `Depends(...)` 即可。

```python
from fastapi import FastAPI, Depends, HTTPException, Header


app = FastAPI()


# 1) 公共依赖：校验 token
def verify_token(token: str = Header(..., alias="X-Token")):
    if token != "secret":
        raise HTTPException(status_code=401, detail="invalid token")
    return {"user": "Alice"}


@app.get("/profile")
async def profile(user=Depends(verify_token)):
    return user


# 2) 带参数的依赖：用闭包工厂
def pagination(page: int = 1, size: int = 10):
    return {"page": max(page, 1), "size": max(min(size, 100), 1)}


@app.get("/list")
async def list_items(p=Depends(pagination)):
    return p


# 3) yield 依赖：请求结束自动清理资源
def get_db():
    print("打开连接")
    db = {"conn": "opened"}
    try:
        yield db
    finally:
        print("关闭连接")


@app.get("/items")
async def list_items_db(db=Depends(get_db)):
    return {"db_state": db}
```

::: tip yield 依赖的执行顺序
请求进入 -> 执行依赖到 `yield` 之前 -> 执行路由函数 -> 执行 `yield` 之后的清理代码。即使路由抛异常，清理也会执行。非常适合管理数据库会话、Redis 连接、文件句柄。
:::

### 3.6 异步路由：何时 async，何时 def

```python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()


@app.get("/slow")
async def slow():
    """async def：在事件循环里跑，await 期间可让出 CPU"""
    await asyncio.sleep(1)  # 模拟异步 IO
    return {"msg": "done"}


@app.get("/sync")
def sync_handler():
    """普通 def：FastAPI 会把它丢到线程池，不阻塞事件循环"""
    import time
    time.sleep(1)  # 同步阻塞调用
    return {"msg": "done"}
```

**经验法则**：

- 函数里有 `await`（异步 HTTP 客户端、异步数据库驱动如 asyncpg）→ 用 `async def`。
- 函数里是同步阻塞调用（`requests`、`pymysql`、CPU 密集计算）→ 用普通 `def`，FastAPI 自动放线程池。
- 用 `async def` 但里面没有 `await` 不会更快，反而略慢。
- 在 `async def` 里调用同步阻塞代码会卡死整个事件循环，是常见坑。

### 3.7 中间件与 CORS

```python
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# 自定义中间件：记录请求耗时
@app.middleware("http")
async def timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    cost = (time.perf_counter() - start) * 1000
    response.headers["X-Response-Time-ms"] = f"{cost:.2f}"
    return response


# CORS：允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

::: warning CORS 不是安全机制
CORS 是浏览器侧的约束，无法阻止 curl 或服务端调用。`allow_origins=["*"]` + `allow_credentials=True` 是非法组合，浏览器会拒绝。
:::

### 3.8 路由分组 APIRouter

```python
# routers/users.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/users", tags=["用户"])


@router.get("/")
async def list_users():
    return [{"id": 1, "name": "Alice"}]


@router.get("/{uid}")
async def get_user(uid: int):
    return {"id": uid, "name": "Alice"}
```

```python
# main.py
from fastapi import FastAPI
from routers.users import router as users_router

app = FastAPI()
app.include_router(users_router)
```

### 3.9 后台任务 BackgroundTasks

适合发邮件、写日志、清理缓存等「请求返回后才做」的轻量任务。重任务建议用 Celery / RQ / arq。

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()


def send_email(to: str, content: str):
    # 模拟耗时邮件发送
    import time
    time.sleep(2)
    print(f"邮件已发送给 {to}: {content}")


@app.post("/notify")
async def notify(bg: BackgroundTasks):
    bg.add_task(send_email, "alice@example.com", "你好")
    return {"msg": "已受理，邮件稍后发送"}
```

### 3.10 实战：FastAPI 完整 CRUD

下面是一个结构清晰、生产风格的完整 CRUD 示例，包含 Pydantic 模型、APIRouter 分组、Depends 校验、错误处理、CORS、分页查询、依赖注入的数据库模拟：

```python
# todo_fastapi.py
"""FastAPI 实现的 TODO CRUD，内存存储，重启清空。"""
import uuid
from datetime import datetime
from typing import Annotated

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict


# ---------------- Pydantic 模型 ----------------
class TodoBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(..., min_length=1, max_length=100)
    done: bool = False


class TodoCreate(TodoBase):
    """创建请求体"""
    pass


class TodoUpdate(BaseModel):
    """更新请求体：所有字段可选"""
    title: str | None = Field(None, min_length=1, max_length=100)
    done: bool | None = None


class TodoOut(BaseModel):
    """响应模型"""
    id: str
    title: str
    done: bool
    created_at: str


# ---------------- 内存存储 ----------------
class TodoStore:
    def __init__(self) -> None:
        self._data: dict[str, dict] = {}

    def list(self, done: bool | None, page: int, size: int) -> tuple[list[dict], int]:
        items = list(self._data.values())
        if done is not None:
            items = [x for x in items if x["done"] == done]
        total = len(items)
        start = (page - 1) * size
        return items[start:start + size], total

    def get(self, todo_id: str) -> dict | None:
        return self._data.get(todo_id)

    def create(self, payload: TodoCreate) -> dict:
        item = {
            "id": uuid.uuid4().hex,
            "title": payload.title,
            "done": payload.done,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        self._data[item["id"]] = item
        return item

    def update(self, todo_id: str, payload: TodoUpdate) -> dict | None:
        item = self._data.get(todo_id)
        if not item:
            return None
        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            item[k] = v
        return item

    def delete(self, todo_id: str) -> bool:
        return self._data.pop(todo_id, None) is not None


# ---------------- 依赖注入 ----------------
def get_store() -> TodoStore:
    """简单单例：实际项目里换成数据库会话"""
    return _store


_store = TodoStore()
StoreDep = Annotated[TodoStore, Depends(get_store)]


# 分页依赖
def pagination(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
) -> dict:
    return {"page": page, "size": size}


PageDep = Annotated[dict, Depends(pagination)]


# ---------------- 路由 ----------------
router = APIRouter(prefix="/api/todos", tags=["TODO"])


@router.get("/", response_model=dict)
async def list_todos(store: StoreDep, page: PageDep,
                    done: bool | None = Query(None)):
    items, total = store.list(done=done, page=page["page"], size=page["size"])
    return {
        "total": total,
        "page": page["page"],
        "size": page["size"],
        "data": [TodoOut(**x) for x in items],
    }


@router.get("/{todo_id}", response_model=TodoOut)
async def get_todo(todo_id: str, store: StoreDep):
    item = store.get(todo_id)
    if not item:
        raise HTTPException(status_code=404, detail="todo not found")
    return TodoOut(**item)


@router.post("/", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
async def create_todo(payload: TodoCreate, store: StoreDep):
    item = store.create(payload)
    return TodoOut(**item)


@router.put("/{todo_id}", response_model=TodoOut)
async def update_todo(todo_id: str, payload: TodoUpdate, store: StoreDep):
    item = store.update(todo_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="todo not found")
    return TodoOut(**item)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: str, store: StoreDep):
    if not store.delete(todo_id):
        raise HTTPException(status_code=404, detail="todo not found")
    return None


# ---------------- 应用 ----------------
app = FastAPI(title="TODO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


# 统一异常处理：把所有 HTTPException 返回成统一 JSON
@app.exception_handler(HTTPException)
async def http_exc_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "msg": exc.detail},
    )


if __name__ == "__main__":
    import uvicorn
    print("启动：http://localhost:8000/docs 查看交互文档")
    uvicorn.run("todo_fastapi:app", host="127.0.0.1", port=8000, reload=True)
```

测试：

```bash
# 创建
curl -X POST http://localhost:8000/api/todos/ -H "Content-Type: application/json" -d '{"title":"学 FastAPI","done":false}'
# 列表（带过滤与分页）
curl "http://localhost:8000/api/todos/?done=false&page=1&size=10"
# 更新（PATCH 风格的部分更新用 PUT 也可）
curl -X PUT http://localhost:8000/api/todos/<id> -H "Content-Type: application/json" -d '{"done":true}'
# 删除
curl -X DELETE http://localhost:8000/api/todos/<id>
```

::: details Annotated 是什么？
`Annotated[T, Depends(...)]` 是 Python 3.9+ 引入的语法，FastAPI 0.95+ 支持。它把「类型」与「依赖声明」放在一起，比旧的 `Depends()` 单独写参数更清晰，也方便类型检查器。推荐优先使用。
:::

---

## 四、RESTful API 设计规范

REST（Representational State Transfer）不是协议，而是一组架构风格。落地到 HTTP，常用约定如下。

### 4.1 资源命名

- 用名词复数：`/users`、`/orders`、`/articles`。
- 嵌套表达从属：`/users/123/orders`。
- 不在 URL 里写动词：`/createUser` 是反模式，应 `POST /users`。
- 用连字符分隔：`/user-profiles` 而非 `/userProfiles` 或 `/user_profiles`。
- 查询用 query，不用路径：`/articles?status=published` 而非 `/articles/published`。

### 4.2 HTTP 方法语义

| 方法 | 语义 | 幂等 | 安全 | 典型场景 |
|------|------|------|------|----------|
| GET | 读取 | 是 | 是 | 获取列表/详情 |
| POST | 创建 | 否 | 否 | 新建资源、触发动作 |
| PUT | 全量替换 | 是 | 否 | 整体更新 |
| PATCH | 部分更新 | 否 | 否 | 修改个别字段 |
| DELETE | 删除 | 是 | 否 | 删除资源 |

::: tip 幂等与安全
「幂等」指同一请求重复执行结果相同；「安全」指不改变服务端状态。GET 必须安全且幂等，所以绝不要在 GET 里写「扣库存」「发邮件」这类副作用。
:::

### 4.3 状态码

| 范围 | 含义 |
|------|------|
| 2xx | 成功：200 OK、201 Created、204 No Content |
| 3xx | 重定向：301 永久、302 临时、304 Not Modified |
| 4xx | 客户端错误：400 参数错、401 未认证、403 无权限、404 不存在、409 冲突、422 校验失败 |
| 5xx | 服务端错误：500 内部错误、502 网关错误、503 不可用、504 超时 |

### 4.4 无状态

每个请求应自带所有上下文（token、参数），服务端不在内存里保存客户端会话状态。这样任意一台服务器都能处理任意请求，便于水平扩展。Session 这种保存在服务端 cookie 签名状态属于「有状态」，扩展性较差，纯 API 服务建议用 JWT。

### 4.5 版本化

在 URL 前缀加版本号，避免破坏性变更影响老客户端：

```
/api/v1/users
/api/v2/users
```

也可在 Header 里加版本（`Accept: application/vnd.myapp.v2+json`），但 URL 版本更直观、调试更方便。

### 4.6 分页

三种常见方式：

- **偏移分页**：`?page=1&size=20`，简单但大数据量有性能问题（`OFFSET 100000` 慢）。
- **游标分页**：`?cursor=eyJpZCI6MTIzfQ&size=20`，返回下一页游标，适合无限滚动、社交 feed。
- **键集分页**：`?after_id=123&size=20`，按主键游标，稳定且快。

响应示例：

```json
{
  "total": 1024,
  "page": 1,
  "size": 20,
  "data": [...]
}
```

### 4.7 统一错误响应

```json
{
  "code": 404,
  "msg": "todo not found",
  "detail": {"id": "abc123"}
}
```

约定字段：`code` 是业务/HTTP 码、`msg` 是给人看的简短描述、`detail` 是可选的调试信息。错误结构全站一致，前端逻辑就简单。

---

## 五、Flask vs FastAPI 对比

| 维度 | Flask | FastAPI |
|------|-------|---------|
| 协议 | WSGI（同步） | ASGI（异步） |
| 性能 | 中等（单 worker 几千 RPS） | 高（与 Node/Go 同级） |
| 类型校验 | 手写或 Marshmallow | 原生 Pydantic v2，编译级校验 |
| 自动文档 | 需 flask-restx / flasgger 等扩展 | 内置 Swagger + ReDoc |
| 异步支持 | 2.0+ 支持 async，但生态弱 | 原生 async/await，生态成熟 |
| 学习曲线 | 极低，装饰器+函数即可 | 低-中，需懂类型提示与 Pydantic |
| 生态 | 老牌丰富（扩展多） | 新但增长极快 |
| 模板渲染 | Jinja2 一等公民 | 需手写或用 starlette templates |
| ORM | 常配 SQLAlchemy | 常配 SQLAlchemy 2.0 / Tortoise / SQLModel |
| 适合场景 | 中小项目、传统 MVC、需要 SSR | 高并发 API、AI 服务、微服务 |

**结论**：

- 全新项目、写 API、追求性能与类型安全 → **FastAPI**。
- 需要服务端渲染模板、对接老系统、团队习惯同步代码 → **Flask**。
- 两者都学不吃亏，思想相通。

---

## 六、部署简介

### 6.1 Flask（WSGI）部署

生产用 `gunicorn`（Linux/macOS）或 `waitress`（Windows 友好）：

```bash
pip install gunicorn
# 启动 4 个 worker，监听 8000
gunicorn -w 4 -b 0.0.0.0:8000 hello:app
```

`-w` 推荐 CPU 核数 × 2 + 1。worker 数过多反而因上下文切换降低吞吐。

### 6.2 FastAPI（ASGI）部署

```bash
# 单进程开发
uvicorn main:app --host 0.0.0.0 --port 8000

# 生产：gunicorn 管理 uvicorn worker，充分利用多核
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

::: tip worker 数与异步的关系
ASGI 单 worker 已能并发处理大量请求；多 worker 是为了利用多核 CPU，以及单 worker 崩溃后其他仍可用。一般 CPU 密集任务多 worker 优势明显，IO 密集任务单 worker + 高并发即可。
:::

### 6.3 Nginx 反向代理

```
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时
        proxy_read_timeout 60s;
    }
}
```

Nginx 在前面的好处：

1. **HTTPS 终止**：证书只配在 Nginx，后端走 HTTP。
2. **静态资源加速**：图片、前端构建产物直接由 Nginx 吐出。
3. **负载均衡**：`upstream` 配多个后端实例。
4. **缓冲与限流**：保护后端不被慢客户端拖死。

### 6.4 进程守护与日志

- Linux 用 `systemd` 或 `supervisor` 守护进程，崩溃自动拉起。
- 日志建议输出到 stdout，由 systemd / Docker / journald 收集，再统一发送到 ELK / Loki。
- 关键日志字段：`time`、`level`、`request_id`、`path`、`status`、`cost_ms`、`user_id`。

::: details 完整生产拓扑
```
Internet → CDN → Nginx (TLS, 限流) → gunicorn/uvicorn (多 worker) → FastAPI/Flask app
                                          ↓
                                    Redis / PostgreSQL / Elasticsearch
```
容器化部署（Docker + Kubernetes）会在第 12 篇详解。
:::

---

## 小结

- **WSGI vs ASGI** 是理解现代 Python Web 的钥匙：同步选 Flask/Django，异步选 FastAPI/Starlette。
- **Flask** 极简灵活，适合快速做中小项目与 SSR 页面；通过 Blueprint 拆分模块、`app.config` 管理配置、`@app.errorhandler` 统一异常。
- **FastAPI** 用类型提示 + Pydantic v2 实现「声明即文档」，自动校验、自动 Swagger、原生异步，是当下新项目的首选 API 框架；`Depends` 与 `APIRouter` 是组织大型项目的两大利器。
- **RESTful** 是约定俗成的 API 设计风格：名词复数路径、HTTP 方法语义化、状态码统一、错误格式一致。
- **部署** 牢记「开发用 `app.run` / `uvicorn --reload`，生产用 gunicorn + worker + Nginx 反向代理」。

下一篇我们将进入 Python 异步编程与 `asyncio` 的内核原理，深入事件循环、协程、Task、Future，以及 `asyncio.gather`、`asyncio.wait` 等并发原语。
