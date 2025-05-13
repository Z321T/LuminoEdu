# JWT 令牌详解

返回的 `access_token` 确实是 JWT (JSON Web Token) 令牌，它是一种轻量级、自包含的用于在各方之间安全传输信息的技术。

## JWT 组成结构

JWT 由三部分组成，以点(.)分隔：
```
xxxxx.yyyyy.zzzzz (头部.载荷.签名)
```

1. **头部(Header)**: 包含算法(`HS256`)和令牌类型
2. **载荷(Payload)**: 包含用户信息，从代码可见包括:
   - `sub`: 用户名
   - `id`: 用户ID
   - `role`: 用户角色
   - `exp`: 过期时间戳
3. **签名(Signature)**: 使用 SECRET_KEY 加密前两部分，确保数据完整性

## 过期机制

在 `create_access_token` 函数中：
```python
expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
```

- 登录接口设置 token 过期时间为 24 小时 (`timedelta(minutes=60 * 24)`)
- 如果没指定，则使用配置文件中的 `ACCESS_TOKEN_EXPIRE_MINUTES` (30分钟)
- 过期时间被编码到 token 的 `exp` 字段中

## 令牌用途

1. **无状态认证**：服务器不需要存储会话信息
2. **身份验证**：`get_current_user` 函数通过 JWT 识别用户身份
3. **授权控制**：包含角色信息，用于权限管理
4. **API安全**：保护需要认证的接口

## 实际使用

前端获取令牌后：
1. 存储在本地 (localStorage/Cookie)
2. 在后续请求中添加到 Authorization 头部:
   ```
   Authorization: Bearer eyJhbGci...token内容
   ```
3. 当令牌过期时，用户需重新登录

系统使用 `verify_token` 函数验证令牌的有效性，并通过 `get_current_user` 获取当前登录用户，实现整个认证流程。