/** 单条成绩记录 — 基于 EMAP 实际返回格式 */
export interface GradeItem {
  /** 课程名称 */
  KCM: string
  /** 课程名称（别名） */
  KCMC?: string
  /** 课程编号 */
  KCH: string
  /** 课程序号 */
  KXH?: string
  /** 学分 */
  XF?: number | string
  /** 总成绩（百分制，始终存在） */
  ZCJ?: number | string
  /** 学分绩点（始终存在） */
  XFJD?: number | string
  /** 成绩（总成绩字段，可能是 XSZCJMC 或 CJ） */
  CJ?: number | string
  /** 学生总成绩 */
  XSZCJMC?: string
  /** 期末成绩 */
  QMCJ?: number | string
  /** 平时成绩 */
  PSCJ?: number | string
  /** 绩点 */
  JD?: number | string
  /** 学年学期代码 如 2024-2025-1 */
  XNXQDM: string
  /** 课程性质代码 */
  KCXZDM?: string
  /** 课程性质显示值 */
  KCXZDM_DISPLAY?: string
  /** 课程类别代码 */
  KCLBDM?: string
  /** 是否有效 */
  SFYX?: string
  /** 是否及格 */
  SFJG?: string
  /** 学时 */
  XS?: number | string
  /** 最高成绩标记 */
  SHOWMAXCJ?: string
  /** 开课单位 */
  KKDWDM?: string
  KKDWDM_DISPLAY?: string
  /** 唯一ID */
  WID?: string
  /** 成绩类型 */
  XSDJCJLXDM_DISPLAY?: string
  /** 考试类型 */
  KSLXDM_DISPLAY?: string
  /** 考试形式 */
  XDFSDM_DISPLAY?: string
  /** 课程名称（学生选课名） */
  XSKCM?: string
  /** 其他字段不索引 */
}
/** 五级制等级 → 百分制分数映射 */
const FIVE_LEVEL_MAP: Record<string, number> = {
  '优秀': 95,  // A (90-94)
  '良好': 85,  // B (80-83)
  '中等': 75,  // C (70-73)
  '及格': 65,  // D (60-63)
  '不及格': 50, // F (<59.5)
}

/** 解析数值字段（处理 number | string | null | undefined） */
function parseNumber(val: number | string | null | undefined): number | null {
  if (val === undefined || val === null || val === '') return null
  const num = typeof val === 'number' ? val : parseFloat(String(val))
  return isNaN(num) ? null : num
}

/** 判断是否为五级制成绩 */
function isFiveLevel(score: string): boolean {
  return score in FIVE_LEVEL_MAP
}

/** 五级制转百分制 */
function fiveLevelToScore(level: string): number {
  return FIVE_LEVEL_MAP[level] ?? 0
}

/** 从成绩记录中提取显示用字段 */
export function getCourseName(g: GradeItem): string {
  return g.KCM || g.KCMC || g.XSKCM || '未知课程'
}

export function getScore(g: GradeItem): number {
  // 优先使用 ZCJ（总成绩，始终存在）
  const zcj = parseNumber(g.ZCJ)
  if (zcj !== null) return zcj
  // 回退：XSZCJMC
  if (g.XSZCJMC) {
    if (isFiveLevel(g.XSZCJMC)) return fiveLevelToScore(g.XSZCJMC)
    const parsed = parseFloat(g.XSZCJMC)
    if (!isNaN(parsed)) return parsed
  }
  // 回退：CJ
  const cj = parseNumber(g.CJ)
  if (cj !== null) return cj
  return 0
}

/** 获取原始成绩文本（用于显示五级制等级） */
export function getRawScore(g: GradeItem): string {
  if (g.XSZCJMC) return g.XSZCJMC
  if (g.CJ !== undefined && g.CJ !== null) return String(g.CJ)
  return ''
}

/** 判断是否为五级制成绩 */
export function isFiveLevelGrade(g: GradeItem): boolean {
  return g.XSZCJMC ? isFiveLevel(g.XSZCJMC) : false
}

export function getGPA(g: GradeItem): number | null {
  // 优先使用 XFJD（学分绩点，始终存在）
  const xfjd = parseNumber(g.XFJD)
  if (xfjd !== null) return xfjd
  // 回退：JD
  return parseNumber(g.JD)
}

export function getCredit(g: GradeItem): number {
  const xf = parseNumber(g.XF)
  if (xf !== null) return xf
  // 如果没有学分字段，从学时估算（16学时 = 1学分）
  const xs = parseNumber(g.XS)
  if (xs !== null && xs > 0) return Math.round(xs / 16 * 10) / 10
  return 0
}

export function getCourseType(g: GradeItem): string {
  return g.KCXZDM_DISPLAY || g.KCXZDM || ''
}

/** 成绩查询响应 */
export interface GradeResponse {
  datas: {
    xscjcx: {
      totalSize: number
      pageNumber: number
      pageSize: number
      rows: GradeItem[]
    }
  }
}

/** 统计汇总 */
export interface GradeStatistics {
  totalGPA: number
  requiredGPA: number
  electiveGPA: number
  weightedAverage: number
  requiredAverage: number
  totalCredits: number
  earnedCredits: number
  courseCount: number
  distribution: {
    range: string
    count: number
    percentage: number
  }[]
  semesterGPA: {
    semester: string
    gpa: number
    average: number
    credits: number
  }[]
  gpaDistribution: {
    range: string
    count: number
  }[]
}
