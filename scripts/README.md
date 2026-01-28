# Scripts 使用指南

## check_console.js - 控制台错误检查器

这个脚本使用 Playwright 自动打开浏览器并捕获所有控制台错误、警告和网络问题。

### 功能特性

✅ **控制台错误捕获** - 捕获所有 `console.error()` 输出  
✅ **控制台警告捕获** - 捕获所有 `console.warn()` 输出  
✅ **未捕获异常** - 捕获页面中的未处理错误  
✅ **网络错误** - 捕获 404、500 等网络请求失败  
✅ **详细报告** - 包含错误位置、堆栈跟踪和 URL  

### 使用方法

#### 方式 1: 使用 npm 脚本（推荐）

```bash
pnpm run check:console
```

#### 方式 2: 直接运行

```bash
node scripts/check_console.js
```

#### 方式 3: 指定自定义 URL

```bash
TARGET_URL=http://localhost:3001 node scripts/check_console.js
```

### 输出示例

#### 无错误时：

```
🔍 Starting console error check...

🌐 Launching browser...
📄 Navigating to http://localhost:3000...
✅ Page loaded successfully

⏳ Waiting 3 seconds to capture delayed errors...

═══════════════════════════════════════════════════════════
                    ERROR REPORT                           
═══════════════════════════════════════════════════════════

✅ No console errors found

✅ No console warnings found

✅ No uncaught exceptions found

✅ No network errors found

═══════════════════════════════════════════════════════════
                       SUMMARY                             
═══════════════════════════════════════════════════════════
Total Errors:   0
Total Warnings: 0

🎉 SUCCESS! No errors or warnings detected!
```

#### 有错误时：

```
═══════════════════════════════════════════════════════════
                    ERROR REPORT                           
═══════════════════════════════════════════════════════════

🔴 CONSOLE ERRORS (2)
─────────────────────────────────────────────────────────

1. Uncaught TypeError: Cannot read property 'foo' of undefined
   Location: http://localhost:3000/app.js:42

2. Failed to load resource: the server responded with a status of 404
   Location: http://localhost:3000/missing.png:1

⚠️  CONSOLE WARNINGS (1)
─────────────────────────────────────────────────────────

1. [Vue warn]: Component is missing template or render function
   Location: http://localhost:3000/components/MyComponent.vue:10

═══════════════════════════════════════════════════════════
                       SUMMARY                             
═══════════════════════════════════════════════════════════
Total Errors:   2
Total Warnings: 1

❌ FAILED! Errors were detected.
```

### 退出代码

- `0` - 成功，没有错误（可能有警告）
- `1` - 失败，检测到错误或执行异常

### 集成到 CI/CD

可以在 CI/CD 流程中使用此脚本来自动检测错误：

```yaml
# GitHub Actions 示例
- name: Check Console Errors
  run: pnpm run check:console
```

如果检测到错误，脚本会以退出代码 1 失败，导致 CI 流程失败。

### 配置选项

#### 环境变量

- `TARGET_URL` - 要检查的 URL（默认：`http://localhost:3000`）
- `HOME` - 已自动设置为 `/tmp` 以避免 Playwright 环境错误

#### 修改脚本

您可以编辑 `scripts/check_console.js` 来：

- 调整等待时间（默认 3 秒）
- 修改浏览器启动选项
- 添加自定义错误过滤
- 更改输出格式

### 故障排查

#### 问题：浏览器无法启动

**解决方案：**
```bash
pnpm exec playwright install chromium
```

#### 问题：连接被拒绝

**解决方案：**
确保开发服务器正在运行：
```bash
pnpm dev
```

#### 问题：超时错误

**解决方案：**
在脚本中增加超时时间（第 70 行）：
```javascript
await page.goto(targetUrl, {
  waitUntil: 'networkidle',
  timeout: 60000, // 增加到 60 秒
});
```

### 最佳实践

1. **在提交前运行** - 确保没有引入新的控制台错误
2. **集成到 CI** - 自动检测生产环境中的错误
3. **定期检查** - 在开发过程中定期运行以发现问题
4. **结合测试** - 与 Playwright 测试一起使用以获得完整覆盖

### 相关命令

```bash
# 运行完整的 E2E 测试
pnpm test

# 运行测试 UI
pnpm test:ui

# 只检查控制台错误
pnpm run check:console
```

---

**提示：** 这个脚本专门用于检测运行时错误。对于代码质量检查，请使用 `pnpm lint`。
