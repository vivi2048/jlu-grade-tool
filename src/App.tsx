import { useState, useMemo } from 'react'
import { useGradeData } from './hooks/useGradeData'
import { useAcademicProgress } from './hooks/useAcademicProgress'
import ReactECharts from 'echarts-for-react'
import { getCourseName, getScore, getGPA, getCredit, getCourseType, isFiveLevelGrade, getRawScore } from './types/grade'
import type { GradeItem } from './types/grade'

/** 分数 → 颜色映射（统一） */
function scoreColor(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 80) return '#3b82f6'
  if (score >= 70) return '#f59e0b'
  if (score >= 60) return '#f97316'
  return '#ef4444'
}

/** 分数 → 渐变色（用于进度条） */
function scoreGradient(score: number): string {
  if (score >= 90) return 'linear-gradient(90deg, #10b981, #059669)'
  if (score >= 80) return 'linear-gradient(90deg, #3b82f6, #2563eb)'
  if (score >= 70) return 'linear-gradient(90deg, #f59e0b, #d97706)'
  if (score >= 60) return 'linear-gradient(90deg, #f97316, #ea580c)'
  return 'linear-gradient(90deg, #ef4444, #dc2626)'
}

/** 学期课程成绩列表 */
function SemesterCourseList({ semesterCourses, selectedSemester }: { semesterCourses: GradeItem[]; selectedSemester: string }) {
  const semLabel = selectedSemester.replace(/(\d{4})-(\d{4})-(\d)/, '$1-$2 学期$3')
  return (
    <section key={selectedSemester} className="jlu-card jlu-card-hover bg-white rounded-2xl p-4 jlu-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {semLabel} <span className="text-slate-300 font-normal">({semesterCourses.length} 门)</span>
        </h3>
      </div>
      <div className="space-y-0 jlu-fade-in">
        {semesterCourses.map((grade, idx) => {
          const score = getScore(grade)
          const gpa = getGPA(grade) ?? 0
          const credit = getCredit(grade)
          const isFiveLevel = isFiveLevelGrade(grade)
          const rawScore = getRawScore(grade)
          return (
            <div key={grade.WID || idx} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{getCourseName(grade)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{getCourseType(grade)} · {credit} 学分</p>
              </div>
              <div className="text-right ml-3">
                <p className="text-sm font-bold tabular-nums" style={{ color: scoreColor(score) }}>
                  {isFiveLevel ? rawScore : score.toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-400 tabular-nums">绩点 {gpa.toFixed(1)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function App() {
  const { grades, statistics, loading: gradeLoading, error: gradeError } = useGradeData()
  const { summary: academicSummary, loading: academicLoading, error: academicError } = useAcademicProgress()
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)

  const isLoading = academicLoading || gradeLoading

  const required = academicSummary
    ? (typeof academicSummary.ZSYQXF === 'number' ? academicSummary.ZSYQXF : parseFloat(String(academicSummary.ZSYQXF)) || 0)
    : 0
  const earned = academicSummary
    ? (typeof academicSummary.YWCXF === 'number' ? academicSummary.YWCXF : parseFloat(String(academicSummary.YWCXF)) || 0)
    : 0
  const percentage = required > 0 ? Math.round((earned / required) * 100) : 0

  // Memoize computed values
  const semesterCourses = useMemo(() => {
    if (!selectedSemester) return []
    return grades
      .filter(g => g.XNXQDM === selectedSemester)
      .sort((a, b) => getScore(b) - getScore(a))
  }, [grades, selectedSemester])

  const { highest, lowest } = useMemo(() => {
    if (grades.length === 0) return { highest: null, lowest: null }
    return grades.reduce((acc, g) => {
      const score = getScore(g)
      if (score > getScore(acc.highest!)) acc.highest = g
      if (score < getScore(acc.lowest!)) acc.lowest = g
      return acc
    }, { highest: grades[0], lowest: grades[0] })
  }, [grades])

  const maxDistributionCount = useMemo(() => {
    if (!statistics?.distribution.length) return 1
    return Math.max(...statistics.distribution.map(d => d.count), 1)
  }, [statistics])

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full jlu-spin mb-4" />
          <p className="text-sm text-slate-400">正在加载数据...</p>
        </div>
      )}

      {!isLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* ── Hero Section ── */}
          <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 px-6 pt-7 pb-8 overflow-hidden jlu-hero-animated">

            <div className="relative">
              {/* Student info */}
              {academicSummary && (
                <div className="mb-5 pb-4 border-b border-white/10">
                  <p className="text-sm font-medium text-white/90 truncate">{academicSummary.XM}</p>
                  <p className="text-[11px] text-white/50 truncate">{academicSummary.XH} · {academicSummary.PYFAMC}</p>
                </div>
              )}

              {/* GPA Hero */}
              {gradeError && (
                <div className="bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-3 text-xs text-rose-300/90 leading-relaxed">
                  成绩加载失败：{gradeError}
                </div>
              )}

              {!gradeLoading && !gradeError && grades.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-white/40">暂无成绩数据</p>
                </div>
              )}

              {!gradeLoading && statistics && grades.length > 0 && (
                <div className="flex items-center gap-8">
                  {/* GPA Number */}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium tracking-widest text-white/60 uppercase mb-2">GPA</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent tabular-nums leading-none">
                        {statistics.totalGPA.toFixed(2)}
                      </span>
                      <span className="text-lg font-medium text-white/30 ml-1">/4.0</span>
                    </div>
                  </div>

                  {/* Mini stats beside GPA */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-white/60 leading-none mb-1">WAM</p>
                      <p className="text-lg font-bold text-amber-400 tabular-nums leading-none">{statistics.weightedAverage.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/60 leading-none mb-1">课程数</p>
                      <p className="text-lg font-bold text-white/80 tabular-nums leading-none">{statistics.courseCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Content Area ── */}
          <div className="px-4 py-5 space-y-4">
            {/* Academic Progress */}
            <section>
              {academicError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600">
                  学业进度加载失败
                </div>
              )}

              {!academicLoading && academicSummary && (
                <div className="jlu-card jlu-card-hover bg-white rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">学业进度</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-extrabold tabular-nums bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent leading-none">
                        {percentage}
                      </span>
                      <span className="text-xs font-medium text-slate-300">%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="jlu-progress-fill h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-2.5">
                    <span className="text-[11px] text-slate-400">
                      已修 <span className="font-semibold text-slate-600 tabular-nums">{earned}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      总学分 <span className="font-semibold text-slate-600 tabular-nums">{required}</span>
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Semester Trend Line Chart */}
            {!gradeLoading && statistics && statistics.semesterGPA.length > 0 && (
              <section className="jlu-card jlu-card-hover bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">学期趋势</h3>
                  <select
                    className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer"
                    value={selectedSemester ?? ''}
                    onChange={(e) => setSelectedSemester(e.target.value || null)}
                  >
                    <option value="">选择学期</option>
                    {statistics.semesterGPA.map(s => {
                      const m = s.semester.match(/(\d{4})-(\d{4})-(\d)/)
                      const label = m ? `${m[1]}-${m[2]} 学期${m[3]}` : s.semester
                      return <option key={s.semester} value={s.semester}>{label}</option>
                    })}
                  </select>
                </div>
                <ReactECharts
                  style={{ height: 180 }}
                  option={{
                    grid: { top: 20, right: 16, bottom: 28, left: 36 },
                    tooltip: {
                      trigger: 'axis',
                      textStyle: { fontSize: 11 },
                      formatter: (params: any) => {
                        const gpa = params.find((p: any) => p.seriesName === 'GPA')
                        const avg = params.find((p: any) => p.seriesName === '均分')
                        return `<b>${params[0].axisValue}</b><br/>GPA: ${gpa?.value ?? '-'}<br/>均分: ${avg?.value ?? '-'}`
                      },
                    },
                    xAxis: {
                      type: 'category',
                      data: statistics.semesterGPA.map(s => {
                        const m = s.semester.match(/(\d{4})-(\d{4})-(\d)/)
                        return m ? `${m[1]}-${m[2]}-${m[3]}` : s.semester
                      }),
                      axisLabel: { fontSize: 9, color: '#94a3b8', rotate: statistics.semesterGPA.length > 4 ? 30 : 0 },
                      axisLine: { lineStyle: { color: '#e2e8f0' } },
                      axisTick: { show: false },
                    },
                    yAxis: [
                      {
                        type: 'value',
                        name: 'GPA',
                        nameTextStyle: { fontSize: 9, color: '#94a3b8' },
                        min: (v: any) => Math.max(0, Math.floor(v.min * 10 - 1) / 10),
                        max: 4.0,
                        splitNumber: 4,
                        axisLabel: { fontSize: 9, color: '#94a3b8' },
                        splitLine: { lineStyle: { color: '#f1f5f9' } },
                      },
                      {
                        type: 'value',
                        name: '均分',
                        nameTextStyle: { fontSize: 9, color: '#94a3b8' },
                        min: (v: any) => Math.max(0, Math.floor(v.min / 10) * 10 - 10),
                        max: 100,
                        axisLabel: { fontSize: 9, color: '#94a3b8' },
                        splitLine: { show: false },
                      },
                    ],
                    series: [
                      {
                        name: 'GPA',
                        type: 'line',
                        data: statistics.semesterGPA.map(s => s.gpa),
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        lineStyle: { width: 2.5, color: '#6366f1' },
                        itemStyle: { color: '#6366f1' },
                        areaStyle: {
                          color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                              { offset: 0, color: 'rgba(99,102,241,0.15)' },
                              { offset: 1, color: 'rgba(99,102,241,0)' },
                            ],
                          },
                        },
                      },
                      {
                        name: '均分',
                        type: 'line',
                        yAxisIndex: 1,
                        data: statistics.semesterGPA.map(s => s.average),
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        lineStyle: { width: 2.5, color: '#f59e0b' },
                        itemStyle: { color: '#f59e0b' },
                      },
                    ],
                  }}
                />
              </section>
            )}

            {/* Selected Semester Course List */}
            {selectedSemester && !gradeLoading && semesterCourses.length > 0 && (
              <SemesterCourseList semesterCourses={semesterCourses} selectedSemester={selectedSemester} />
            )}

            {/* Grade Distribution */}
            {!gradeLoading && statistics && statistics.distribution.length > 0 && (
              <section className="jlu-card jlu-card-hover bg-white rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">成绩分布</h3>
                <div className="space-y-2.5">
                  {statistics.distribution.map((item) => {
                    const barWidth = Math.max((item.count / maxDistributionCount) * 100, 4)
                    return (
                      <div key={item.range} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-14 tabular-nums shrink-0">{item.range}</span>
                        <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg transition-all duration-500 ease-out"
                            style={{
                              width: `${barWidth}%`,
                              background: scoreGradient(item.range.includes('90') ? 90 : item.range.includes('80') ? 80 : item.range.includes('70') ? 70 : item.range.includes('60') ? 60 : 50),
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 tabular-nums w-6 text-right shrink-0">{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Highest & Lowest Courses */}
            {!gradeLoading && highest && lowest && (() => {
              const renderCourse = (grade: GradeItem, label: string) => {
                const score = getScore(grade)
                const isFiveLevel = isFiveLevelGrade(grade)
                return (
                  <div className="jlu-card jlu-card-hover flex-1 bg-white rounded-2xl p-4">
                    <p className="text-[10px] text-slate-400 mb-1.5">{label}</p>
                    <p className="text-xs font-medium text-slate-700 truncate mb-2">{getCourseName(grade)}</p>
                    <p className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: scoreColor(score) }}>
                      {isFiveLevel ? grade.XSZCJMC : score.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{getCourseType(grade)} · {grade.XF} 学分</p>
                  </div>
                )
              }
              return (
                <section className="flex gap-3">
                  {renderCourse(highest, '最高分')}
                  {renderCourse(lowest, '最低分')}
                </section>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
