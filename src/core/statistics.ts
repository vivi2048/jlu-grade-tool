import type { GradeItem, GradeStatistics } from '../types/grade'
import { getCourseName, getScore, getGPA, getCredit, getCourseType } from '../types/grade'

/**
 * 判断是否为必修类课程
 */
function isRequired(course: GradeItem): boolean {
  const type = getCourseType(course).toLowerCase()
  return type.includes('必修') || type === 'bx' || type.includes('required')
}

/**
 * 判断是否为选修类课程
 */
function isElective(course: GradeItem): boolean {
  const type = getCourseType(course).toLowerCase()
  return type.includes('选修') || type.includes('限选') || type.includes('任选') || type === 'xx'
}

/**
 * 计算完整的成绩统计
 */
export function calculateStatistics(grades: GradeItem[]): GradeStatistics {
  if (!grades.length) {
    return {
      totalGPA: 0, requiredGPA: 0, electiveGPA: 0,
      weightedAverage: 0, requiredAverage: 0,
      totalCredits: 0, earnedCredits: 0, courseCount: 0,
      distribution: [], semesterGPA: [], gpaDistribution: [],
    }
  }

  // 按课程号去重（取最高成绩）
  const courseMap = new Map<string, GradeItem>()
  for (const g of grades) {
    const key = g.KCH || getCourseName(g)
    const existing = courseMap.get(key)
    if (!existing || getScore(g) > getScore(existing)) {
      courseMap.set(key, g)
    }
  }
  const uniqueGrades = Array.from(courseMap.values())

  let totalWeightedGPA = 0
  let totalWeightedScore = 0
  let totalCredits = 0
  let requiredWeightedGPA = 0
  let requiredWeightedScore = 0
  let requiredCredits = 0
  let electiveWeightedGPA = 0
  let electiveCredits = 0
  let earnedCredits = 0

  for (const g of uniqueGrades) {
    const credit = getCredit(g)
    const score = getScore(g)     // ZCJ
    const gpa = getGPA(g) ?? 0    // XFJD，始终存在
    const isValid = g.SFJG === '1' || score >= 60 || gpa > 0

    if (isValid) earnedCredits += credit

    totalWeightedGPA += gpa * credit
    totalWeightedScore += score * credit
    totalCredits += credit

    if (isRequired(g)) {
      requiredWeightedGPA += gpa * credit
      requiredWeightedScore += score * credit
      requiredCredits += credit
    } else if (isElective(g)) {
      electiveWeightedGPA += gpa * credit
      electiveCredits += credit
    }
  }

  const totalGPA = totalCredits > 0 ? totalWeightedGPA / totalCredits : 0
  const weightedAverage = totalCredits > 0 ? totalWeightedScore / totalCredits : 0
  const requiredGPA = requiredCredits > 0 ? requiredWeightedGPA / requiredCredits : 0
  const requiredAverage = requiredCredits > 0 ? requiredWeightedScore / requiredCredits : 0
  const electiveGPA = electiveCredits > 0 ? electiveWeightedGPA / electiveCredits : 0

  // 分数段分布 - O(n) 单次遍历
  const scoreCounts = [0, 0, 0, 0, 0] // 90-100, 80-89, 70-79, 60-69, <60
  const gpaCounts = [0, 0, 0, 0, 0, 0] // 4.0, 3.7-3.9, 3.0-3.6, 2.0-2.9, 1.0-1.9, <1.0

  for (const g of uniqueGrades) {
    const score = getScore(g)
    if (score >= 90) scoreCounts[0]++
    else if (score >= 80) scoreCounts[1]++
    else if (score >= 70) scoreCounts[2]++
    else if (score >= 60) scoreCounts[3]++
    else scoreCounts[4]++

    const gpaVal = getGPA(g) ?? 0
    if (gpaVal >= 3.8) gpaCounts[0]++
    else if (gpaVal >= 3.5) gpaCounts[1]++
    else if (gpaVal >= 2.8) gpaCounts[2]++
    else if (gpaVal >= 1.8) gpaCounts[3]++
    else if (gpaVal >= 0.8) gpaCounts[4]++
    else gpaCounts[5]++
  }

  const scoreRanges = ['90-100', '80-89', '70-79', '60-69', '<60']
  const distribution = scoreRanges.map((range, i) => ({
    range,
    count: scoreCounts[i],
    percentage: Math.round((scoreCounts[i] / uniqueGrades.length) * 100),
  }))

  // 绩点分布
  const gpaRanges = ['4.0', '3.7-3.9', '3.0-3.6', '2.0-2.9', '1.0-1.9', '<1.0']
  const gpaDistribution = gpaRanges.map((range, i) => ({
    range,
    count: gpaCounts[i],
  }))

  // 各学期 GPA
  const semesterMap = new Map<string, { gpaSum: number; scoreSum: number; credits: number }>()
  for (const g of uniqueGrades) {
    const sem = g.XNXQDM
    if (!semesterMap.has(sem)) semesterMap.set(sem, { gpaSum: 0, scoreSum: 0, credits: 0 })
    const s = semesterMap.get(sem)!
    const credit = getCredit(g)
    const gpaVal = getGPA(g) ?? 0
    s.gpaSum += gpaVal * credit
    s.scoreSum += getScore(g) * credit
    s.credits += credit
  }

  const semesterGPA = Array.from(semesterMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semester, data]) => ({
      semester,
      gpa: data.credits > 0 ? Math.round((data.gpaSum / data.credits) * 100) / 100 : 0,
      average: data.credits > 0 ? Math.round((data.scoreSum / data.credits) * 100) / 100 : 0,
      credits: data.credits,
    }))

  return {
    totalGPA: Math.round(totalGPA * 100) / 100,
    requiredGPA: Math.round(requiredGPA * 100) / 100,
    electiveGPA: Math.round(electiveGPA * 100) / 100,
    weightedAverage: Math.round(weightedAverage * 100) / 100,
    requiredAverage: Math.round(requiredAverage * 100) / 100,
    totalCredits: Math.round(totalCredits * 10) / 10,
    earnedCredits: Math.round(earnedCredits * 10) / 10,
    courseCount: uniqueGrades.length,
    distribution, semesterGPA, gpaDistribution,
  }
}
