---
title: 企业级项目实战
category:
  - 后端
tag:
  - Python
---

# 企业级项目实战（FastAPI + SQLAlchemy 2.0 + Docker + CI/CD）

经过前 11 篇从语法基础到 Web 框架的积累，本篇作为压轴实战，将基于 Python 3.12+ 把所有工程化要素整合成一个可以直接落地的项目骨架。读完后你应当能够：独立搭建一个分层清晰的 FastAPI 服务、用 SQLAlchemy 2.0 异步操作 Postgres、用 Alembic 管理迁移、用 Docker 容器化、用 GitHub Actions 做 CI/CD、用 pytest 写单元/集成测试，并理解每一层为什么这样切分。

## 一、项目分层架构

企业级项目最忌讳"路由里直接写 SQL"。一个清晰的分层架构可以让代码可测试、可维护、可替换。Python Web 圈最常见的是"经典三层 + 领域模型"的变种：

- **接口层（API / Router）**：负责接收 HTTP 请求、参数校验、调用 service、组装响应。不写业务逻辑。
- **业务层（Service）**：编排领域逻辑、控制事务边界、调用 repository。是"业务"的真正所在。
- **数据访问层（Repository / DAO）**：封装所有数据库操作，向上屏蔽 ORM 细节。
- **领域模型（Model）**：ORM 实体，描述"数据长什么样"。

依赖方向严格"外层依赖内层"：router 依赖 service，service 依赖 repository，repository 依赖 model。反向不允许，比如 service 不应该 import FastAPI 的 `Request` 对象。

::: tip 为什么不让 router 直接操作数据库？
小项目可以，但项目一旦长大，业务逻辑会散落在多个路由里，重复 SQL、事务混乱、无法单元测试。分层后 service 可以脱离 HTTP 单独测试，repository 可以换成内存实现做 mock，model 修改不会直接破坏 API 契约。
:::

::: details 领域驱动设计（DDD）分层简介
DDD 把项目分为 interface / application / domain / infrastructure 四层，更强调"领域对象包含行为"。中小项目用经典三层已足够；本文采用三层 + schemas + models 的实用结构，是 FastAPI 社区主流做法。当业务复杂到需要聚合根、值对象、领域事件时，再向 DDD 演进。
:::

## 二、推荐目录结构

采用 `src layout`（pyproject 里 `packages = [{include = "app", from = "src"}]`），避免测试误导入本地源码。

```text
myproject/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py                  # FastAPI 应用入口
│       ├── api/
│       │   ├── __init__.py
│       │   ├── deps.py              # 公共依赖（get_db、get_current_user）
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── router.py        # 汇总所有子路由
│       │       └── endpoints/
│       │           ├── __init__.py
│       │           └── users.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py            # pydantic-settings 配置
│       │   ├── logging.py           # 日志配置
│       │   └── exceptions.py        # 自定义异常 + 全局处理器
│       ├── db/
│       │   ├── __init__.py
│       │   ├── base.py              # DeclarativeBase
│       │   ├── session.py           # engine / sessionmaker / get_db
│       │   └── init_db.py           # 初始化数据
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/
│       │   ├── __init__.py
│       │   └── user_service.py
│       ├── repositories/
│       │   ├── __init__.py
│       │   └── user_repo.py
│       └── security.py              # 密码哈希 + JWT
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   └── test_user_service.py
│   └── integration/
│       └── test_users_api.py
├── .env.example
├── .gitignore
├── .dockerignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── alembic.ini
└── README.md
```

逐项说明：

- `src/app/main.py`：创建 FastAPI 实例、注册路由、注册中间件与异常处理器、lifespan 中初始化日志与关闭 engine。
- `api/v1/endpoints/`：按业务模块拆分的路由文件，版本化前缀 `/api/v1`，方便未来 `/api/v2` 平滑升级。
- `core/`：基础设施层，配置、日志、异常，与业务无关。
- `db/`：数据库引擎、会话工厂、`DeclarativeBase`。
- `models/` 与 `schemas/` 分离：前者是 ORM 实体（数据库形状），后者是 API 数据契约（请求/响应形状），不要混用。
- `services/` 与 `repositories/`：业务逻辑与数据访问解耦。
- `alembic/`：数据库迁移脚本目录。

## 三、依赖与工具管理（Poetry）

`pyproject.toml` 是现代 Python 项目的"唯一真相源"。下面这份配置同时声明了依赖分组、ruff、mypy、pytest 配置，复制即可用。

```toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "企业级 FastAPI 项目骨架"
authors = ["Lfange <lfange@example.com>"]
readme = "README.md"
packages = [{include = "app", from = "src"}]

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.115.0"
uvicorn = {extras = ["standard"], version = "^0.32.0"}
sqlalchemy = {extras = ["asyncio"], version = "^2.0.36"}
asyncpg = "^0.30.0"
aiosqlite = "^0.20.0"
alembic = "^1.14.0"
pydantic = "^2.10.0"
pydantic-settings = "^2.6.0"
email-validator = "^2.2.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.17"
structlog = "^24.4.0"
python-json-logger = "^2.0.7"

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.0"
pytest-asyncio = "^0.24.0"
pytest-cov = "^6.0.0"
httpx = "^0.28.0"
ruff = "^0.8.0"
mypy = "^1.13.0"
pre-commit = "^4.0.1"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.ruff]
line-length = 100
target-version = "py312"
src = ["src", "tests"]

[tool.ruff.lint]
select = ["E", "F", "W", "I", "B", "UP", "N", "C4", "SIM", "RUF"]
ignore = ["B008"]  # FastAPI Depends() in default args 是官方推荐写法

[tool.ruff.lint.isort]
known-first-party = ["app"]

[tool.ruff.format]
quote-style = "double"

[tool.mypy]
python_version = "3.12"
strict = true
plugins = ["pydantic.mypy"]
ignore_missing_imports = true
disallow_untyped_defs = true

[[tool.mypy.overrides]]
module = "passlib.*"
ignore_missing_imports = true

[tool.pytest.ini_options]
minversion = "8.0"
addopts = "-ra -q --strict-markers --cov=app --cov-report=term-missing"
testpaths = ["tests"]
asyncio_mode = "auto"
```

::: tip 为什么用 Poetry
Poetry 把"依赖声明、锁文件、虚拟环境、打包"统一到一个工具里。`poetry.lock` 锁定完整传递依赖，CI 与生产环境装的是同一份，杜绝"我本地能跑"。`poetry install --without dev` 在生产镜像里只装运行时依赖，体积更小。
:::

## 四、配置管理（pydantic-settings）

`pydantic-settings` 让你用类型注解声明配置，自动从环境变量、`.env` 文件读取，校验类型、给默认值。敏感信息只放环境变量，`.env` 加入 `.gitignore`。

```python
# src/app/core/config.py
from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """数据库相关配置，可嵌套。"""
    url: PostgresDsn = Field(..., alias="DATABASE_URL")
    pool_size: int = 10
    max_overflow: int = 20
    echo: bool = False


class JWTSettings(BaseSettings):
    secret_key: SecretStr = Field(..., alias="JWT_SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


class Settings(BaseSettings):
    """全局配置，从 .env 与环境变量加载。"""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # 应用
    app_name: str = "MyProject"
    env: Literal["dev", "prod", "test"] = "dev"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # 嵌套配置：通过 DATABASE_URL 等环境变量传给子配置
    database: DatabaseSettings
    jwt: JWTSettings

    # CORS
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    """单例：首次调用解析，后续直接返回缓存。"""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
```

`.env.example`（提交到仓库作为模板）：

```bash
# .env.example
APP_NAME=MyProject
ENV=dev
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/myproject
JWT_SECRET_KEY=change-me-to-a-32-byte-random-string
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=["http://localhost:5173"]
```

::: warning 不要把真实密钥写进 .env.example
`.env.example` 是给团队看的模板，只放示例值。真实 `.env` 必须在 `.gitignore` 里。生产环境密钥应走容器编排 secret 或 KMS，而不是镜像构建参数。
:::

## 五、日志（标准库 logging + structlog）

生产环境日志要满足三条：能按级别过滤、能轮转不撑爆磁盘、能被 ELK/Loki 解析（结构化）。下面这套配置同时给出"开发用人类可读 + 生产用 JSON"两种输出。

```python
# src/app/core/logging.py
import logging
import logging.config
from typing import Any

import structlog

from app.core.config import settings


def setup_logging() -> None:
    """统一初始化标准库 logging 与 structlog。"""
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            timestamper,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            (
                structlog.processors.JSONRenderer()
                if settings.env == "prod"
                else structlog.dev.ConsoleRenderer()
            ),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.DEBUG if settings.debug else logging.INFO
        ),
        cache_logger_on_first_use=True,
    )

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
                },
                "json": {
                    "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": "INFO",
                    "formatter": "default",
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": "WARNING",
                    "formatter": "default",
                    "filename": "logs/app.log",
                    "maxBytes": 10 * 1024 * 1024,  # 10 MB
                    "backupCount": 7,
                    "encoding": "utf-8",
                },
            },
            "loggers": {
                "app": {"handlers": ["console", "file"], "level": "DEBUG"},
                "uvicorn": {"handlers": ["console"], "level": "INFO"},
            },
            "root": {"handlers": ["console"], "level": "WARNING"},
        }
    )


def get_logger(name: str | None = None) -> Any:
    return structlog.get_logger(name)
```

::: tip 日志级别规范
DEBUG 仅开发用；INFO 记录关键业务节点（用户登录、订单创建）；WARNING 是可恢复异常（重试、降级）；ERROR 是不可恢复异常（必须告警）；CRITICAL 留给系统级故障。线上永远不要把 SQL 全量打到 INFO，否则日志量爆炸。
:::

## 六、数据库（SQLAlchemy 2.0）

### 6.1 Declarative Base 与会话管理

```python
# src/app/db/base.py
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """所有 ORM 模型的基类。"""


class TimestampMixin:
    """通用字段：创建时间、更新时间。"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
```

```python
# src/app/db/session.py
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine = create_async_engine(
    str(settings.database.url),
    pool_size=settings.database.pool_size,
    max_overflow=settings.database.max_overflow,
    echo=settings.database.echo,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖：每个请求一个 session，请求结束自动关闭。"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### 6.2 模型定义（2.0 注解风格）

```python
# src/app/models/user.py
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.post import Post


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = {"comment": "用户表"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False, comment="用户名"
    )
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, comment="邮箱"
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(default=False, nullable=False)

    posts: Mapped[list["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
```

### 6.3 Repository 数据访问层

```python
# src/app/repositories/user_repo.py
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """数据访问层：所有 SQL 都封装在这里。"""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list(self, offset: int = 0, limit: int = 20) -> Sequence[User]:
        stmt = select(User).offset(offset).limit(limit).order_by(User.id.desc())
        return (await self.session.execute(stmt)).scalars().all()

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def delete(self, user: User) -> None:
        await self.session.delete(user)
```

::: tip 为什么 repository 不自己 commit
事务边界应在 service 层（或 `get_db` 依赖）控制。repository 只做 `add/flush`，让 service 决定何时提交或回滚。这样多个 repository 调用可以共享一个事务，做"转账"这种跨表操作时不会出现一半提交一半回滚的脏数据。
:::

## 七、数据库迁移（Alembic）

初始化与日常流程：

```bash
# 1. 初始化（项目搭建时执行一次）
poetry run alembic init alembic

# 2. 修改 models 后，生成迁移脚本
poetry run alembic revision --autogenerate -m "create users table"

# 3. 应用迁移到数据库
poetry run alembic upgrade head

# 4. 回滚上一次迁移
poetry run alembic downgrade -1

# 5. 查看当前版本
poetry run alembic current
```

`alembic/env.py` 关键片段（让 alembic 读取项目配置与 `Base.metadata`）：

```python
# alembic/env.py（节选）
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings
from app.db.base import Base
from app.models import user  # noqa: F401  保证 metadata 注册

config = context.config
config.set_main_option("sqlalchemy.url", str(settings.database.url))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=str(settings.database.url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

::: warning autogenerate 不是银弹
Alembic autogenerate 检测的是"模型与数据库差异"，但以下情况检测不到：服务器默认值改动、列重命名（会被识别为"删一列+加一列"导致数据丢失）、check 约束语义变化。每次生成迁移后必须人工 review，必要时手改 `upgrade()` / `downgrade()` 函数。
:::

## 八、Pydantic Schema 模型

把"对外契约"与"数据库实体"分离：schemas 不暴露 `hashed_password`，模型修改不会直接破坏 API。

```python
# src/app/schemas/user.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    """响应 schema，绝不返回 hashed_password。"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserRead]
    total: int
```

::: tip 字段校验放在 schema 而不是 service
`Field(..., min_length=8)` 这类约束在 Pydantic 校验阶段就拒绝了非法输入，FastAPI 自动返回 422，根本不会进 service。service 里只做"业务规则"校验（如用户名是否重复），二者各司其职。
:::

## 九、完整 API 示例（用户 CRUD 全链路）

下面把 service、router、异常处理器、统一响应格式串起来。

### 9.1 自定义异常与全局处理器

```python
# src/app/core/exceptions.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class BizError(Exception):
    """业务异常基类。"""
    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(BizError):
    def __init__(self, message: str = "资源不存在") -> None:
        super().__init__(code="NOT_FOUND", message=message, status_code=404)


class ConflictError(BizError):
    def __init__(self, message: str = "资源已存在") -> None:
        super().__init__(code="CONFLICT", message=message, status_code=409)


def uniform_response(code: int, message: str, data: object = None) -> dict:
    return {"code": code, "message": message, "data": data}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(BizError)
    async def biz_error_handler(_: Request, exc: BizError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=uniform_response(exc.status_code, exc.message, None),
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(_: Request, exc: Exception) -> JSONResponse:
        # 生产环境不要把内部错误细节返回给客户端
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=uniform_response(500, "服务器内部错误", None),
        )
```

### 9.2 Service 业务层

```python
# src/app/services/user_service.py
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.security import get_password_hash


class UserService:
    """业务层：编排校验、密码哈希、调用 repository。"""

    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def create_user(self, payload: UserCreate) -> User:
        if await self.repo.get_by_username(payload.username):
            raise ConflictError(f"用户名 {payload.username} 已存在")
        user = User(
            username=payload.username,
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
        )
        return await self.repo.create(user)

    async def get_user(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"用户 {user_id} 不存在")
        return user

    async def list_users(self, offset: int = 0, limit: int = 20) -> Sequence[User]:
        return await self.repo.list(offset=offset, limit=limit)

    async def update_user(self, user_id: int, payload: UserUpdate) -> User:
        user = await self.get_user(user_id)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(user, key, value)
        await self.repo.session.flush()
        await self.repo.session.refresh(user)
        return user

    async def delete_user(self, user_id: int) -> None:
        user = await self.get_user(user_id)
        await self.repo.delete(user)
```

### 9.3 Router 接口层

```python
# src/app/api/v1/endpoints/users.py
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.post("", response_model=UserRead, status_code=201)
async def create_user(
    payload: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    service = UserService(db)
    return await service.create_user(payload)


@router.get("", response_model=list[UserRead])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[User]:
    service = UserService(db)
    return list(await service.list_users(offset=offset, limit=limit))


@router.get("/me", response_model=UserRead)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


@router.get("/{user_id}", response_model=UserRead)
async def read_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    service = UserService(db)
    return await service.get_user(user_id)


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    service = UserService(db)
    return await service.update_user(user_id, payload)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    service = UserService(db)
    await service.delete_user(user_id)
```

### 9.4 路由汇总与应用入口

```python
# src/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.endpoints import users

api_router = APIRouter()
api_router.include_router(users.router)
```

```python
# src/app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动
    setup_logging()
    yield
    # 关闭：释放连接池
    from app.db.session import engine
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
register_exception_handlers(app)


@app.get("/health", tags=["运维"])
async def health() -> dict:
    return {"status": "ok"}
```

::: tip 路由顺序很重要
`/users/me` 必须写在 `/users/{user_id}` 前面，否则 FastAPI 会把 `me` 当成 `user_id` 参数去解析，触发 422 校验错误（无法转 int）。这是 FastAPI 路由匹配"先注册先匹配"的特性。
:::

## 十、认证授权

```python
# src/app/security.py
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(
        payload,
        settings.jwt.secret_key.get_secret_value(),
        algorithm=settings.jwt.algorithm,
    )


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.jwt.secret_key.get_secret_value(),
            algorithms=[settings.jwt.algorithm],
        )
    except JWTError as e:
        raise ValueError("无效的 token") from e
```

```python
# src/app/api/deps.py
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        username: str | None = payload.get("sub")
        if not username:
            raise credentials_exc
    except ValueError:
        raise credentials_exc

    user = await UserRepository(db).get_by_username(username)
    if not user or not user.is_active:
        raise credentials_exc
    return user


async def get_current_superuser(
    current: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current.is_superuser:
        raise HTTPException(status_code=403, detail="权限不足")
    return current
```

::: tip 验证密码用恒定时间比较
passlib 内部已用恒定时间比较，避免时序攻击。永远不要自己写 `==` 比较 hash。生产环境 JWT 密钥至少 32 字节随机串，且仅存放在环境变量或 KMS 中。
:::

## 十一、Docker 化

### 11.1 Dockerfile（多阶段构建）

```dockerfile
# Dockerfile
# ---------- builder ----------
FROM python:3.12-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VERSION=1.8.4 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true

RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --without dev

# ---------- runtime ----------
FROM python:3.12-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# 非 root 用户运行
RUN groupadd -r app && useradd -r -g app app

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY --chown=app:app src ./src
COPY --chown=app:app alembic ./alembic
COPY --chown=app:app alembic.ini ./

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request, sys; sys.exit(0) if urllib.request.urlopen('http://localhost:8000/health').status==200 else sys.exit(1)"

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"]
```

### 11.2 docker-compose.yml

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myproject
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myproject"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

  app:
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@postgres:5432/myproject
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8000:8000"

volumes:
  pgdata:
```

### 11.3 .dockerignore

```text
# .dockerignore
.git
.gitignore
.venv
__pycache__
*.pyc
.pytest_cache
.mypy_cache
.ruff_cache
logs
tests
*.md
.env
```

::: tip 多阶段构建的好处
builder 阶段装了 poetry、gcc、dev 依赖，构建完后只把 `.venv` 拷到 runtime 镜像，最终镜像不含构建工具链，体积从 1GB+ 降到 200MB 左右，攻击面也小。`POETRY_VIRTUALENVS_IN_PROJECT=true` 让 venv 落在 `/app/.venv`，方便 COPY。
:::

## 十二、CI/CD（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Poetry
        run: pipx install poetry==1.8.4

      - name: Cache Poetry venv
        uses: actions/cache@v4
        with:
          path: .venv
          key: venv-${{ runner.os }}-${{ hashFiles('poetry.lock') }}

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Ruff check
        run: poetry run ruff check .

      - name: Ruff format check
        run: poetry run ruff format --check .

      - name: Mypy
        run: poetry run mypy src

      - name: Pytest
        run: poetry run pytest
        env:
          ENV: test
          DATABASE_URL: sqlite+aiosqlite:///:memory:
          JWT_SECRET_KEY: ci-secret-key-for-test-only-32bytes

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: htmlcov/

  docker:
    needs: lint-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest,ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

::: warning CI 与本地一致性
CI 上用的 `poetry.lock` 必须与本地一致，所以 `poetry.lock` 必须提交到仓库。若 CI 报"lock file out of date"，本地跑一次 `poetry lock --no-update` 重新生成并提交。
:::

## 十三、代码质量（pre-commit）

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks:
      - id: mypy
        additional_dependencies:
          - pydantic>=2.10
          - pydantic-settings>=2.6
        files: ^src/
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
```

安装：

```bash
poetry run pre-commit install
poetry run pre-commit run --all-files
```

::: tip ruff 与 black 的关系
ruff 集成了 linter（替代 flake8/pylint）和 formatter（替代 black），并且格式化输出与 black 100% 兼容。一个工具搞定两件事，启动速度比 black 快 10-100 倍。新项目直接用 ruff 即可，不必再装 black。
:::

## 十四、测试目录与 fixtures

```python
# tests/conftest.py
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture(scope="function")
async def test_engine():
    """每个测试函数一个全新的内存 SQLite，互不污染。"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    TestSession = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with TestSession() as session:
        yield session


@pytest.fixture
async def client(test_engine) -> AsyncGenerator[AsyncClient, None]:
    TestSession = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_db():
        async with TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

```python
# tests/integration/test_users_api.py
import pytest


@pytest.mark.asyncio
async def test_create_and_get_user(client):
    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "StrongPass123",
    }
    resp = await client.post("/api/v1/users", json=payload)
    assert resp.status_code == 201
    user_id = resp.json()["id"]

    resp = await client.get(f"/api/v1/users/{user_id}")
    assert resp.status_code == 200
    assert resp.json()["username"] == "alice"


@pytest.mark.asyncio
async def test_duplicate_username_conflict(client):
    payload = {
        "username": "bob",
        "email": "bob@example.com",
        "password": "StrongPass123",
    }
    await client.post("/api/v1/users", json=payload)
    resp = await client.post("/api/v1/users", json=payload)
    assert resp.status_code == 409
```

::: tip 覆盖率门槛
在 `pyproject.toml` 的 `[tool.pytest.ini_options]` 里加 `--cov-fail-under=80`，CI 上低于 80% 直接失败，防止覆盖率退化。但不要盲目追高，关键业务路径 100% 比无关注释行 90% 更有价值。
:::

## 十五、运行与验证

```bash
# 1. 安装依赖
poetry install

# 2. 安装 pre-commit 钩子
poetry run pre-commit install

# 3. 复制环境变量模板并按需修改
cp .env.example .env

# 4. 启动 Postgres（也可用本地实例）
docker compose up -d postgres

# 5. 应用数据库迁移
poetry run alembic upgrade head

# 6. 启动应用（开发模式热重载）
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 7. 访问交互式文档
# 浏览器打开 http://localhost:8000/docs  -> Swagger UI
# 浏览器打开 http://localhost:8000/redoc -> ReDoc

# 8. 跑测试与代码检查
poetry run pytest
poetry run ruff check .
poetry run mypy src

# 9. 容器化部署
docker compose up -d --build
```

::: details 常见问题速查
- **alembic 报 `ImportError: No module named 'app'`**：在 `alembic/env.py` 顶部加 `sys.path.insert(0, "src")`，或在 `pyproject.toml` 里把 `app` 安装为可导入包（`poetry install` 不加 `--no-root`）。
- **asyncpg 报 `cannot connect`**：检查 `DATABASE_URL` 协议是否为 `postgresql+asyncpg://`，同步驱动 `psycopg2` 不能用于 async engine。
- **ruff format 与 black 冲突**：ruff format 默认兼容 black 风格，但二者不要同时启用，否则格式来回跳。
- **mypy 报 `passlib` 无类型**：用 `[[tool.mypy.overrides]] module = "passlib.*" ignore_missing_imports = true` 跳过。
- **测试时 `sqlite+aiosqlite` 报 `no such table`**：确认 `Base.metadata.create_all` 在 `test_engine` fixture 里执行过，且模型文件被 import（否则 metadata 不会注册）。
- **Docker 镜像构建慢**：开启 BuildKit 缓存 `docker buildx build --cache-from type=gha --cache-to type=gha`，CI 上已配置。
:::

至此，你已经拥有一个分层清晰、配置规范、可测试、可容器化、有 CI/CD 保障的企业级 FastAPI 项目骨架。把它作为脚手架复制到新仓库，按业务模块继续扩展 `models / schemas / services / repositories / api` 五件套即可。当业务复杂到三层不够用时，再向 DDD（聚合根、领域事件、CQRS）演进。本系列从语法基础到工程实战到此完整闭环。
