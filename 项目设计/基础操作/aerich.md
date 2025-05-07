使用 Aerich 来迁移 FastAPI 项目中使用 Tortoise ORM 的模型



## **✅ 场景说明**

- 项目结构：

```
项目根目录/
└── server/
    └── app/
        ├── database.py        ← 包含 TORTOISE_ORM 配置
        └── models/
```

- TORTOISE_ORM 配置变量路径为：app.database.TORTOISE_ORM
- 你在 **项目根目录下运行命令**

------



## **✅ 1. 首次初始化 Aerich（生成迁移目录）**

首先从根目录移动到server/目录下

cd server

在server目录执行以下命令：

```
aerich init -t app.database.TORTOISE_ORM
```



执行后会自动创建以下结构：

```
server/
├── migrations/
```

------



## **✅ 2. 初始化数据库并生成初始迁移文件**



继续运行以下命令（仍在server）：# 初始化数据库（建表）

```
aerich init-db 
```

------



## **✅ 3. 后续迁移操作命令**

- 检测模型变更并生成迁移文件：# 创建迁移文件

```
aerich migrate
```

- 应用迁移文件更新数据库：# 应用迁移

```
aerich upgrade
```

------



