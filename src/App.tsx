import { useState, useMemo } from 'react'
import { useGradeData } from './hooks/useGradeData'
import { useAcademicProgress } from './hooks/useAcademicProgress'
import { useCourseSelection } from './hooks/useCourseSelection'
import { calculateStatistics } from './core/statistics'
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
function SemesterCourseList({
  semesterCourses,
  selectedSemester,
  selectedCourses,
  isCustomSelection,
  onToggleCourse,
}: {
  semesterCourses: GradeItem[]
  selectedSemester: string
  selectedCourses: Set<string> | null
  isCustomSelection: boolean
  onToggleCourse: (wid: string) => void
}) {
  const semLabel = selectedSemester.replace(/(\d{4})-(\d{4})-(\d)/, '$1-$2 学期$3')

  // 计算本学期选中数量
  const selectedCount = semesterCourses.filter(g =>
    selectedCourses === null || selectedCourses.has(g.WID ?? '')
  ).length

  return (
    <section key={selectedSemester} className="jlu-card jlu-card-hover bg-white rounded-2xl p-4 jlu-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {semLabel}{' '}
          <span className="text-slate-300 font-normal">
            ({selectedCount}/{semesterCourses.length} 门)
          </span>
        </h3>
      </div>
      <div className="space-y-0 jlu-fade-in">
        {semesterCourses.map((grade, idx) => {
          const score = getScore(grade)
          const gpa = getGPA(grade) ?? 0
          const credit = getCredit(grade)
          const isFiveLevel = isFiveLevelGrade(grade)
          const rawScore = getRawScore(grade)
          const wid = grade.WID ?? ''
          const isSelected = selectedCourses === null || selectedCourses.has(wid)
          return (
            <div
              key={wid || idx}
              className={`flex items-center gap-2.5 py-2.5 border-b border-slate-50 last:border-0 transition-all duration-200 ${
                isCustomSelection && !isSelected ? 'opacity-40' : ''
              }`}
            >
              {/* 复选框 */}
              <button
                onClick={() => wid && onToggleCourse(wid)}
                className={`shrink-0 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500 border-indigo-500 shadow-sm shadow-indigo-200'
                    : 'bg-white border-slate-300 hover:border-indigo-400'
                }`}
                title={isSelected ? '取消选择' : '选择此课程'}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{getCourseName(grade)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{getCourseType(grade)} · {credit} 学分</p>
              </div>
              <div className="text-right ml-1">
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
  const { grades, statistics: fullStatistics, loading: gradeLoading, error: gradeError } = useGradeData()
  const { summary: academicSummary, loading: academicLoading, error: academicError } = useAcademicProgress()
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)
  const {
    selectedCourses,
    isCustomSelection,
    toggleCourse,
    selectAll,
    getSelectionParam,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    activePresetId,
  } = useCourseSelection(grades)
  const [presetName, setPresetName] = useState('')
  const [showPresetPanel, setShowPresetPanel] = useState(false)

  const isLoading = academicLoading || gradeLoading

  // 根据课程选择计算过滤后的统计
  const statistics = useMemo(() => {
    if (!grades.length) return null
    return calculateStatistics(grades, getSelectionParam())
  }, [grades, getSelectionParam])

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
    // 使用过滤后的课程计算最高/最低
    const source = isCustomSelection && selectedCourses
      ? grades.filter(g => selectedCourses.has(g.WID ?? ''))
      : grades
    if (source.length === 0) return { highest: null, lowest: null }
    return source.reduce((acc, g) => {
      const score = getScore(g)
      if (score > getScore(acc.highest!)) acc.highest = g
      if (score < getScore(acc.lowest!)) acc.lowest = g
      return acc
    }, { highest: source[0], lowest: source[0] })
  }, [grades, isCustomSelection, selectedCourses])

  const maxDistributionCount = useMemo(() => {
    if (!statistics?.distribution.length) return 1
    return Math.max(...statistics.distribution.map(d => d.count), 1)
  }, [statistics])

  // 学期选中数量（用于控制栏显示）
  const semesterSelectedCount = useMemo(() => {
    if (!selectedSemester) return 0
    return semesterCourses.filter(g =>
      selectedCourses === null || selectedCourses.has(g.WID ?? '')
    ).length
  }, [selectedSemester, semesterCourses, selectedCourses])

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
                      <span className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent tabular-nums leading-none transition-all duration-300">
                        {statistics.totalGPA.toFixed(2)}
                      </span>
                      <span className="text-lg font-medium text-white/30 ml-1">/4.0</span>
                    </div>
                  </div>

                  {/* Mini stats beside GPA */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-white/60 leading-none mb-1">WAM</p>
                      <p className="text-lg font-bold text-amber-400 tabular-nums leading-none transition-all duration-300">{statistics.weightedAverage.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/60 leading-none mb-1">课程数</p>
                      <p className="text-lg font-bold text-white/80 tabular-nums leading-none transition-all duration-300">{statistics.courseCount}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 自定义选择模式提示 */}
              {isCustomSelection && statistics && (
                <div className="mt-4 transition-all duration-200 jlu-fade-in">
                  <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] rounded-full px-3 py-1.5">
                    {/* 筛选图标 */}
                    <svg className="w-3 h-3 text-indigo-300/80 shrink-0" viewBox="0 0 14 14" fill="none">
                      <path d="M1.5 2.5H12.5L8 7.8V11L6 12V7.8L1.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* 方案名/标签 */}
                    <span className="text-[11px] text-white/70 font-medium leading-none">
                      {activePresetId
                        ? presets.find(p => p.id === activePresetId)?.name ?? '自定义选择'
                        : '自定义选择'}
                    </span>
                    {/* 分割线 */}
                    <span className="w-px h-3 bg-white/15" />
                    {/* 恢复全选 */}
                    <button
                      onClick={selectAll}
                      className="flex items-center gap-0.5 text-[11px] text-white/40 hover:text-white/70 transition-colors duration-200 leading-none"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M3.5 3.5L8.5 8.5M8.5 3.5L3.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      全选
                    </button>
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
            {!gradeLoading && fullStatistics && fullStatistics.semesterGPA.length > 0 && (
              <section className="jlu-card jlu-card-hover bg-white rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">学期趋势</h3>
                  <select
                    className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer"
                    value={selectedSemester ?? ''}
                    onChange={(e) => setSelectedSemester(e.target.value || null)}
                  >
                    <option value="">选择学期</option>
                    {fullStatistics.semesterGPA.map(s => {
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
                      data: fullStatistics.semesterGPA.map(s => {
                        const m = s.semester.match(/(\d{4})-(\d{4})-(\d)/)
                        return m ? `${m[1]}-${m[2]}-${m[3]}` : s.semester
                      }),
                      axisLabel: { fontSize: 9, color: '#94a3b8', rotate: fullStatistics.semesterGPA.length > 4 ? 30 : 0 },
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
                        data: fullStatistics.semesterGPA.map(s => s.gpa),
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
                        data: fullStatistics.semesterGPA.map(s => s.average),
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

            {/* Selected Semester Course List with Selection Controls */}
            {selectedSemester && !gradeLoading && semesterCourses.length > 0 && (
              <div className="jlu-fade-in">
                {/* 选择控制栏 */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      已选 <span className="font-semibold text-indigo-500 tabular-nums">{semesterSelectedCount}</span>/{semesterCourses.length} 门
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        // 全选本学期课程
                        semesterCourses.forEach(g => {
                          const wid = g.WID ?? ''
                          if (wid && (selectedCourses === null || !selectedCourses.has(wid))) {
                            toggleCourse(wid)
                          }
                        })
                      }}
                      className="text-[11px] text-indigo-500 hover:text-indigo-700 px-2 py-0.5 rounded-md hover:bg-indigo-50 transition-all duration-200"
                    >
                      全选
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={() => {
                        // 取消选中本学期课程
                        semesterCourses.forEach(g => {
                          const wid = g.WID ?? ''
                          if (wid && (selectedCourses === null || selectedCourses.has(wid))) {
                            toggleCourse(wid)
                          }
                        })
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-all duration-200"
                    >
                      取消
                    </button>
                  </div>
                </div>

                {/* 方案管理面板 */}
                <div className="mb-2 px-1">
                  <button
                    onClick={() => setShowPresetPanel(!showPresetPanel)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-500 transition-colors duration-200"
                  >
                    <svg className={`w-3 h-3 transition-transform duration-200 ${showPresetPanel ? 'rotate-90' : ''}`} viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    方案管理
                    {presets.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 rounded-full">{presets.length}</span>
                    )}
                  </button>

                  {showPresetPanel && (
                    <div className="mt-2 bg-slate-50 rounded-xl p-3 space-y-2 jlu-fade-in">
                      {/* 保存当前方案 */}
                      {isCustomSelection && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="输入方案名称..."
                            className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 transition-all duration-200 placeholder:text-slate-300"
                          />
                          <button
                            onClick={() => {
                              if (presetName.trim()) {
                                savePreset(presetName.trim())
                                setPresetName('')
                              }
                            }}
                            disabled={!presetName.trim()}
                            className="text-[11px] bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
                          >
                            保存
                          </button>
                        </div>
                      )}

                      {/* 方案列表 */}
                      {presets.length > 0 ? (
                        <div className="space-y-1.5">
                          {presets.map(preset => (
                            <div
                              key={preset.id}
                              className={`flex items-center justify-between bg-white rounded-lg px-3 py-2 transition-all duration-200 ${
                                activePresetId === preset.id
                                  ? 'ring-1 ring-indigo-300 shadow-sm'
                                  : 'hover:shadow-sm'
                              }`}
                            >
                              <button
                                onClick={() => loadPreset(preset.id)}
                                className="flex-1 text-left"
                              >
                                <p className={`text-[11px] font-medium ${
                                  activePresetId === preset.id ? 'text-indigo-600' : 'text-slate-600'
                                }`}>
                                  {preset.name}
                                </p>
                                <p className="text-[10px] text-slate-400">{preset.wids.length} 门课程</p>
                              </button>
                              <div className="flex items-center gap-1.5 ml-2">
                                {activePresetId === preset.id && (
                                  <span className="text-[10px] text-indigo-500 font-medium">使用中</span>
                                )}
                                <button
                                  onClick={() => deletePreset(preset.id)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors duration-200 p-0.5"
                                  title="删除方案"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 4H11L10.2 11.2C10.15 11.7 9.73 12 9.22 12H4.78C4.27 12 3.85 11.7 3.8 11.2L3 4Z" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M5.5 4V2.5C5.5 2.22 5.72 2 6 2H8C8.28 2 8.5 2.22 8.5 2.5V4" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M2 4H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-2">
                          {isCustomSelection ? '为当前选择保存一个方案吧' : '选择课程后可保存为方案'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <SemesterCourseList
                  semesterCourses={semesterCourses}
                  selectedSemester={selectedSemester}
                  selectedCourses={selectedCourses}
                  isCustomSelection={isCustomSelection}
                  onToggleCourse={toggleCourse}
                />
              </div>
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
