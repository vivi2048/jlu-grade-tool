# 更新日志

本项目的显著更改将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划添加
- 成绩导出功能（Excel/PDF）
- 成绩对比功能（与班级/专业平均对比）
- 深色模式支持
- 多语言支持

## [1.1.0] - 2026-07-16

### 新增
- **自定义课程选择** — 支持按课程勾选计算 GPA，适配不同学院保研政策
- **方案管理** — 保存多套选课方案（命名、加载、删除），跨会话持久化
- **打包脚本** — `node scripts/package.js` 一键生成 Release zip
- **安装指南** — 面向新手的 HTML/Markdown 双格式使用说明
- **GitHub 模板** — Issue 模板（Bug 报告/功能请求）、PR 模板、贡献指南

### 优化
- **性能提升** — 成绩分布计算从 O(n×r) 优化至 O(n)，最高/最低分从 O(n log n) 优化至 O(n)
- **并行分页** — 成绩获取使用 Promise.all 并行请求，大幅减少加载时间
- **算法优化** — isFiveLevel() 从 O(n) 优化至 O(1)，减少代码重复

### 更改
- **UI 统一** — 全局限定 indigo 主题色 + amber 点缀，Hero 区域渐变背景
- **文案精简** — GPA/WAM/课程数/总学分等标签标准化
- **扩展名称** — 移除版本号，统一为「JLU 成绩查询助手」
- **Hero 徽章** — 自定义选择状态改用毛玻璃胶囊设计，更融入深色背景
- **README 重构** — 表格功能列表、徽章、引用块提示、隐私章节

### 技术
- 新增 `useCourseSelection` Hook，管理课程选择状态与持久化
- `calculateStatistics()` 支持可选 `selectedCourses` 参数（向后兼容）
- manifest 添加 `storage` 权限
- 课程选择方案存储于 `localStorage` + `chrome.storage.local`

## [1.0.0] - 2024-07-14

### 新增
- 初始版本发布
- 实时成绩查询功能
- GPA 自动计算
- 学期趋势图表
- 成绩分布统计
- 学业进度显示
- 最高/最低分展示
- 现代化 UI 设计
- 响应式布局
- 动画效果

### 技术特性
- 使用 React 19 + TypeScript
- Vite 构建
- Tailwind CSS v4
- ECharts 图表
- Chrome Extension Manifest V3

---

## 版本说明

- **新增**：新功能
- **更改**：对现有功能的修改
- **弃用**：即将移除的功能
- **移除**：已移除的功能
- **修复**：问题修复
- **安全**：安全性相关修复

[未发布]: https://github.com/vivi2048/jlu-grade-tool/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/vivi2048/jlu-grade-tool/releases/tag/v1.1.0
[1.0.0]: https://github.com/vivi2048/jlu-grade-tool/releases/tag/v1.0.0
