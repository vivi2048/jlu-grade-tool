# JLU 成绩查询助手

一款轻量级 Chrome 浏览器扩展，为吉林大学学生提供更直观的成绩管理体验。在教务系统页面侧边栏实时查看成绩、计算 GPA、追踪学业进度，并支持按课程自定义计算——满足不同学院的保研政策需求。

## ✨ 功能特性

- **实时成绩查看** - 在 iedu.jlu.edu.cn 页面侧边栏直接查看成绩
- **GPA 计算** - 自动计算总绩点、加权平均分
- **自定义课程选择** - 按保研政策灵活选择课程计算 GPA
- **方案管理** - 保存多套课程选择方案，一键切换
- **学期趋势** - 可视化展示各学期 GPA 变化趋势
- **成绩分布** - 统计各分数段课程数量
- **学业进度** - 显示已修学分与总学分进度
- **最高/最低分** - 快速查看成绩极值
- **现代化界面** - 精美的渐变设计和动画效果

## 📸 截图

![扩展全局预览](./screenshots/global.png)

## 🚀 安装方法

### 方法一：从源码构建（推荐）

1. 克隆或下载本项目
```bash
git clone https://github.com/vivi2048/jlu-grade-tool.git
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
1. 前往 [Releases](https://github.com/vivi2048/jlu-grade-tool/releases) 页面
2. 下载最新版本的 `jlu-grade-tool.zip`
3. 解压到任意文件夹
4. 按照上述步骤 4 加载到 Chrome
-->

## 📖 使用方法

1. 访问吉林大学教务系统：[iedu.jlu.edu.cn](https://iedu.jlu.edu.cn)
2. 点击浏览器工具栏的扩展图标
3. 选择"在侧边栏中打开"
4. 扩展会自动加载你的成绩数据

### 自定义课程选择

不同学院的保研政策可能不同，你可以选择特定课程来计算 GPA：

1. 在"学期趋势"下方选择一个学期
2. 勾选/取消需要计入的课程
3. GPA、WAM 等数据会实时更新
4. 点击"方案管理"可将当前选择保存为命名方案（如"计算机学院保研"）
5. 下次使用时一键加载已保存的方案，无需重新选择

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
- 课程选择方案保存在本地浏览器中，不会同步到其他设备
- 仅在本地浏览器中处理和显示数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

---

**免责声明**：本扩展仅供学习交流使用，与吉林大学官方无关。使用本扩展即表示你同意自行承担使用风险。
