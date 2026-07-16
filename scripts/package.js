import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

// 读取版本号：优先从 package.json，其次从环境变量，最后默认为 1.0.0
let version = '1.0.0'
try {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
  version = pkg.version || version
} catch {
  version = process.env.npm_package_version || version
}

const outputName = `jlu-grade-tool-v${version}.zip`

console.log('📦 开始打包 JLU 成绩查询助手...\n')

// 1. 构建项目
console.log('🔨 步骤 1/3: 构建项目...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ 构建完成\n')
} catch (error) {
  console.error('❌ 构建失败')
  process.exit(1)
}

// 2. 创建输出目录
console.log('📁 步骤 2/3: 创建输出目录...')
const distDir = join(process.cwd(), 'dist')
const releaseDir = join(process.cwd(), 'release')

if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir)
}
console.log('✅ 输出目录已创建\n')

// 3. 打包为 zip
console.log('🗜️  步骤 3/3: 打包为 zip...')
const outputPath = join(releaseDir, outputName)

try {
  // 使用 PowerShell 创建 zip（Windows）
  if (process.platform === 'win32') {
    // 删除已存在的 zip
    if (existsSync(outputPath)) {
      execSync(`del "${outputPath}"`, { stdio: 'inherit' })
    }
    
    // 使用 PowerShell 压缩
    const script = `Compress-Archive -Path "${distDir}\\*" -DestinationPath "${outputPath}" -Force`
    execSync(`powershell -Command "${script}"`, { stdio: 'inherit' })
  } else {
    // 使用 zip 命令（Linux/Mac）
    if (existsSync(outputPath)) {
      execSync(`rm "${outputPath}"`, { stdio: 'inherit' })
    }
    execSync(`cd "${distDir}" && zip -r "${outputPath}" .`, { stdio: 'inherit' })
  }
  
  console.log('✅ 打包完成\n')
  console.log('📦 输出文件:', outputPath)
  console.log('\n🎉 打包成功！')
  console.log(`\n接下来：`)
  console.log(`1. 访问 https://github.com/vivi2048/jlu-grade-tool/releases`)
  console.log(`2. 点击 "Draft a new release"`)
  console.log(`3. Tag version: v${version}`)
  console.log(`4. 上传文件: ${outputName}`)
  console.log(`5. 发布 Release`)
} catch (error) {
  console.error('❌ 打包失败:', error.message)
  process.exit(1)
}
