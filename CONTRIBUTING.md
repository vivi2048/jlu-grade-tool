# 贡献指南

感谢你对 JLU 成绩查询助手的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

1. 在 [Issues](https://github.com/YOUR_USERNAME/jlu-grade-tool/issues) 页面创建新 issue
2. 选择 "Bug Report" 模板
3. 详细描述问题，包括：
   - 复现步骤
   - 期望行为
   - 实际行为
   - 截图（如果适用）
   - 浏览器版本

### 提出新功能

1. 先在 Issues 页面查看是否已有相关讨论
2. 创建新 issue，选择 "Feature Request" 模板
3. 描述功能需求和使用场景

### 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 开发流程

### 1. 环境准备

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/jlu-grade-tool.git
cd jlu-grade-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 代码规范

- 使用 TypeScript 编写所有代码
- 遵循现有的代码风格
- 为新功能添加适当的注释
- 确保代码能通过 TypeScript 编译

### 3. 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

示例：
```
feat: 添加成绩导出功能
fix: 修复 GPA 计算错误
docs: 更新安装说明
```

### 4. 测试

在提交 Pull Request 前：

```bash
# 确保构建成功
npm run build

# 检查类型错误
npm run lint
```

### 5. Pull Request 流程

1. 确保 PR 描述清楚说明了更改内容
2. 关联相关的 issue（如果有）
3. 等待代码审查
4. 根据反馈进行修改
5. 审查通过后合并

## 代码风格

- **组件命名**：使用 PascalCase（如 `GradeCard`）
- **函数命名**：使用 camelCase（如 `calculateGPA`）
- **常量命名**：使用 UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- **CSS 类名**：使用 Tailwind 工具类，自定义类使用 `jlu-` 前缀

## 需要帮助？

如果有任何疑问，欢迎：
- 在 Issues 中提问
- 发送邮件到项目维护者

感谢你的贡献！🎉
