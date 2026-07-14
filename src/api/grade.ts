import { emapRequest, buildQuerySetting } from './request'
import type { GradeResponse } from '../types/grade'

/**
 * 查询学生成绩
 * @param semester 学年学期，如 "2024-2025-1"，传空则查全部
 * @param page 页码
 * @param pageSize 每页条数
 */
export async function fetchGrades(
  semester?: string,
  page = 1,
  pageSize = 100
): Promise<GradeResponse> {
  const conditions: Array<{
    name: string
    value: string | number
    builder?: string
    linkOpt?: string
  }> = [
    { name: 'SFYX', value: '1', builder: 'm_value_equal' },
    { name: 'SHOWMAXCJ', value: 0, builder: 'equal' },
  ]

  if (semester) {
    conditions.push({
      name: 'XNXQDM',
      value: semester,
      builder: 'm_value_equal',
      linkOpt: 'and',
    })
  }

  conditions.push({
    name: '*order',
    value: '-XNXQDM,-KCH,-KKH',
    builder: 'm_value_equal',
    linkOpt: 'AND',
  })

  const querySetting = buildQuerySetting(conditions)

  const params = new URLSearchParams({
    querySetting,
    '*order': '-XNXQDM,-KCH,-KKH',
    pageSize: String(pageSize),
    pageNumber: String(page),
  })

  return emapRequest<GradeResponse>(
    '/jwapp/sys/cjcx/modules/cjcx/xscjcx.do',
    { body: params.toString(), moduleKey: 'grade' }
  )
}

/**
 * 获取全部成绩（自动翻页，并行获取）
 */
export async function fetchAllGrades(semester?: string): Promise<GradeResponse['datas']['xscjcx']['rows']> {
  const firstPage = await fetchGrades(semester, 1, 100)
  const { totalSize, rows } = firstPage.datas.xscjcx

  if (totalSize <= 100) {
    return rows
  }

  // 并行获取剩余页
  const totalPages = Math.ceil(totalSize / 100)
  const pagePromises = Array.from({ length: totalPages - 1 }, (_, i) =>
    fetchGrades(semester, i + 2, 100)
  )
  const remainingPages = await Promise.all(pagePromises)
  
  return [...rows, ...remainingPages.flatMap(p => p.datas.xscjcx.rows)]
}
