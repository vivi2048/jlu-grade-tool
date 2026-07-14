# JLU 成绩查询助手

吉林大学教务系统成绩查询浏览器扩展，支持侧边栏实时查看成绩、GPA 计算、成绩分布统计等功能。

## ✨ 功能特性

- 📊 **实时成绩查看** - 在 iedu.jlu.edu.cn 页面侧边栏直接查看成绩
- 📈 **GPA 计算** - 自动计算总绩点、加权平均分
- 📉 **学期趋势** - 可视化展示各学期 GPA 变化趋势
- 📊 **成绩分布** - 统计各分数段课程数量
- 🎯 **学业进度** - 显示已修学分与总学分进度
- 🏆 **最高/最低分** - 快速查看成绩极值
- 🎨 **现代化界面** - 精美的渐变设计和动画效果

## 📸 截图

<!-- TODO: 添加截图 -->
<!-- ![Screenshot 1](screenshots/s1.png) -->
<!-- ![Screenshot 2](screenshots/s2.png) -->

## 🚀 安装方法

### 方法一：从源码构建（推荐）

1. 克隆或下载本项目
```bash
git clone https://github.com/YOUR_USERNAME/jlu-grade-tool.git
cd jlu-grade-tool
```

2. 安装依赖
```bash
npm install
```

3. 构建扩展
```bash
npm run build
```

4. 加载到 Chrome
   - 打开 Chrome，进入 `chrome://extensions/`
   - 开启右上角"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `dist` 文件夹

### 方法二：使用预构建版本

<!-- TODO: 在 GitHub Releases 页面提供下载 -->
<!-- 
1. 前往 [Releases](https://github.com/YOUR_USERNAME/jlu-grade-tool/releases) 页面
2. 下载最新版本的 `jlu-grade-tool.zip`
3. 解压到任意文件夹
4. 按照上述步骤 4 加载到 Chrome
-->

## 📖 使用方法

1. 访问吉林大学教务系统：[iedu.jlu.edu.cn](https://iedu.jlu.edu.cn)
2. 点击浏览器工具栏的扩展图标
3. 选择"在侧边栏中打开"
4. 扩展会自动加载你的成绩数据

## 🛠️ 开发

### 技术栈

- **React 19** + **TypeScript** - 前端框架
- **Vite** - 构建工具
- **Tailwind CSS v4** - 样式
- **ECharts** - 图表可视化
- **Chrome Extension API** - 浏览器扩展

### 开发模式

```bash
npm run dev
```

这会启动 Vite 开发服务器，支持热更新。修改代码后需要重新构建并刷新扩展。

### 构建

```bash
npm run build
```

构建产物在 `dist` 目录。

### 项目结构

```
jlu-grade-tool/
├── src/
│   ├── api/          # API 请求
│   ├── components/   # React 组件
│   ├── core/         # 核心逻辑（统计计算等）
│   ├── hooks/        # 自定义 Hooks
│   ├── types/        # TypeScript 类型定义
│   └── styles/       # 全局样式
├── public/           # 静态资源
└── dist/             # 构建产物（加载到 Chrome）
```

## 📝 注意事项

- 本扩展仅在 iedu.jlu.edu.cn 域名下生效
- 需要登录教务系统后才能使用
- 成绩数据从教务系统实时获取，不会上传到任何服务器
- 仅在本地浏览器中处理和显示数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

---

**免责声明**：本扩展仅供学习交流使用，与吉林大学官方无关。使用本扩展即表示你同意自行承担使用风险。
