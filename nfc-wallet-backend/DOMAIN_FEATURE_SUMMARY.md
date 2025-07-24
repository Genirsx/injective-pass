# NFC钱包 - .inj域名功能详解

## 🎯 功能概述

根据实际需求，我们为NFC钱包用户提供**自定义.inj域名**功能，而不是简单的用户名。用户可以设置个性化的域名前缀，系统自动添加`.inj`后缀，形成完整的域名标识。

## 🏷️ 域名系统特性

### 核心特点
- **个性化前缀**: 用户可自定义3-30字符的域名前缀
- **自动后缀**: 系统自动添加`.inj`后缀
- **全局唯一**: 确保域名在整个系统中唯一
- **DNS规范**: 符合标准域名格式要求

### 域名格式规则
```
用户输入: "alice"
系统生成: "alice.inj"

格式要求:
- 长度: 3-30字符（不含.inj后缀）
- 字符: 小写字母、数字、连字符
- 限制: 不能以连字符开头或结尾
- 禁止: 连续连字符(--)
```

## 🔧 技术实现

### 数据库架构
```sql
-- 更新后的钱包表结构
CREATE TABLE nfc_wallets (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) UNIQUE NOT NULL,    -- NFC卡片UID
  address VARCHAR(63) NOT NULL,        -- Injective地址
  eth_address VARCHAR(42),             -- 以太坊地址（兼容）
  domain VARCHAR(70) UNIQUE,           -- .inj域名（可选且唯一）
  private_key_enc TEXT NOT NULL,       -- 加密私钥
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API端点设计
```typescript
// 1. 设置域名
PUT /api/user/domain
Body: { uid: string, domainPrefix: string }

// 2. 检查域名可用性
GET /api/user/check-domain/:domainPrefix

// 3. 根据域名查找用户
GET /api/user/search/:domain

// 4. 删除域名
DELETE /api/user/domain/:uid
```

### 验证逻辑
```typescript
private validateDomainPrefix(domainPrefix: string): boolean {
  const regex = /^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$/;
  return domainPrefix.length >= 3 && 
         domainPrefix.length <= 30 && 
         regex.test(domainPrefix) &&
         !domainPrefix.includes('--');
}
```

## 📡 API使用示例

### 设置用户域名
```bash
curl -X PUT http://localhost:3000/api/user/domain \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "04:1a:2b:3c:4d:5e:6f",
    "domainPrefix": "alice"
  }'
```

**响应**:
```json
{
  "address": "inj1abc123...",
  "ethAddress": "0x742d35Cc6bb...",
  "uid": "04:1a:2b:3c:4d:5e:6f",
  "domain": "alice.inj",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 检查域名可用性
```bash
curl http://localhost:3000/api/user/check-domain/alice
```

**响应**:
```json
{
  "available": false  // 域名已被占用
}
```

### 根据域名查找用户
```bash
curl http://localhost:3000/api/user/search/alice.inj
```

**响应**:
```json
{
  "address": "inj1abc123...",
  "uid": "04:1a:2b:3c:4d:5e:6f",
  "domain": "alice.inj",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 域名验证规则

### ✅ 有效域名前缀示例
- `alice` → `alice.inj`
- `bob123` → `bob123.inj`
- `user-name` → `user-name.inj`
- `abc` → `abc.inj` (最短3字符)

### ❌ 无效域名前缀示例
- `ab` ❌ 太短（小于3字符）
- `-alice` ❌ 以连字符开头
- `alice-` ❌ 以连字符结尾
- `Alice` ❌ 包含大写字母
- `alice@bob` ❌ 包含特殊字符
- `alice--bob` ❌ 连续连字符

## 🎯 使用场景

### 1. 用户身份标识
- 替代复杂的钱包地址
- 便于记忆和分享
- 提升用户体验

### 2. 社交功能
- 朋友可通过域名查找用户
- 简化转账操作
- 构建用户网络

### 3. 品牌标识
- 企业用户可申请品牌域名
- 增强品牌认知度
- 专业形象展示

## 🔐 安全考虑

### 域名安全
- **唯一性保证**: 数据库UNIQUE约束防止重复
- **格式验证**: 多层验证确保域名安全
- **防恶意注册**: 限制域名长度和字符集

### 隐私保护
- **可选设置**: 用户可选择不设置域名
- **删除功能**: 支持随时删除域名
- **访问控制**: 域名查找不暴露敏感信息

## 📊 统计信息

系统提供域名相关统计：
```json
{
  "totalWallets": 1000,
  "walletsWithDomain": 750,     // 设置了域名的钱包数量
  "recentRegistrations": 50
}
```

## 🚀 扩展可能性

### 未来功能
1. **子域名支持**: `user.company.inj`
2. **域名转移**: 允许域名在用户间转移
3. **域名市场**: 二级市场交易稀缺域名
4. **DNS集成**: 与真实DNS系统集成

### 生态集成
- **钱包应用**: 在钱包中显示域名
- **DApp集成**: 应用中使用域名标识
- **跨链支持**: 在其他链上使用相同域名

## 🧪 测试验证

运行完整的域名功能测试：
```bash
node test-injective-domain.js
```

测试覆盖：
- ✅ 域名设置和验证
- ✅ 唯一性冲突检测
- ✅ 格式验证测试
- ✅ 域名查找功能
- ✅ 删除操作验证

---

## 总结

.inj域名系统为NFC钱包用户提供了个性化的身份标识方案，既满足了功能需求，又保证了系统的安全性和扩展性。通过完善的验证机制和用户友好的API设计，为后续的生态建设奠定了良好基础。 