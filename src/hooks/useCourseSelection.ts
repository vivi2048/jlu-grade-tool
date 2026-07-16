import { useState, useEffect, useCallback, useRef } from 'react'
import type { GradeItem } from '../types/grade'

const STORAGE_KEY = 'jlu_selected_courses'
const PRESETS_KEY = 'jlu_course_presets'

/** 课程选择方案 */
export interface CoursePreset {
  id: string
  name: string
  wids: string[]
  createdAt: number
}

interface UseCourseSelectionReturn {
  /** 选中的课程 WID 集合，null 表示全选（默认） */
  selectedCourses: Set<string> | null
  /** 是否处于自定义选择模式（非全选） */
  isCustomSelection: boolean
  /** 切换单门课程的选中状态 */
  toggleCourse: (wid: string) => void
  /** 全选所有课程 */
  selectAll: () => void
  /** 获取用于传递给 calculateStatistics 的参数 */
  getSelectionParam: () => Set<string> | undefined

  /** 已保存的方案列表 */
  presets: CoursePreset[]
  /** 保存当前选择为新方案 */
  savePreset: (name: string) => void
  /** 加载指定方案 */
  loadPreset: (id: string) => void
  /** 删除方案 */
  deletePreset: (id: string) => void
  /** 当前激活的方案 ID（null 表示全选或未匹配） */
  activePresetId: string | null
}

/** 从 storage 读取方案列表 */
function loadPresets(): CoursePreset[] {
  try {
    const data = localStorage.getItem(PRESETS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/** 保存方案列表到 storage */
function savePresets(presets: CoursePreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // 静默降级
  }
}

/**
 * 管理课程选择状态，支持持久化和方案管理
 */
export function useCourseSelection(allGrades: GradeItem[]): UseCourseSelectionReturn {
  const [selectedCourses, setSelectedCourses] = useState<Set<string> | null>(null)
  const [presets, setPresets] = useState<CoursePreset[]>([])
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const restoredRef = useRef(false)

  // 初始化：加载方案列表
  useEffect(() => {
    setPresets(loadPresets())
  }, [])

  // 从 storage 恢复选中状态（等待 grades 加载完成）
  useEffect(() => {
    if (restoredRef.current || allGrades.length === 0) return
    restoredRef.current = true

    try {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        const saved = result[STORAGE_KEY] as string[] | undefined
        if (saved && Array.isArray(saved) && saved.length > 0) {
          const allWids = new Set(allGrades.map(g => g.WID).filter((w): w is string => !!w))
          const validWids = saved.filter(wid => allWids.has(wid))
          if (validWids.length > 0 && validWids.length < allGrades.length) {
            setSelectedCourses(new Set(validWids))
            // 检查是否匹配某个已保存方案
            const loaded = loadPresets()
            const match = loaded.find(p =>
              p.wids.length === validWids.length &&
              p.wids.every(w => validWids.includes(w))
            )
            if (match) setActivePresetId(match.id)
          }
        }
      })
    } catch {
      // chrome.storage 不可用时静默降级
    }
  }, [allGrades])

  // 保存到 storage
  const saveToStorage = useCallback((wids: Set<string> | null) => {
    try {
      if (wids === null) {
        chrome.storage.local.remove(STORAGE_KEY)
      } else {
        chrome.storage.local.set({ [STORAGE_KEY]: Array.from(wids) })
      }
    } catch {
      // 静默降级
    }
  }, [])

  const toggleCourse = useCallback((wid: string) => {
    setSelectedCourses(prev => {
      const next = prev ? new Set(prev) : new Set(allGrades.map(g => g.WID).filter((w): w is string => !!w))
      if (next.has(wid)) {
        next.delete(wid)
      } else {
        next.add(wid)
      }
      // 如果选中了全部，回到默认全选状态
      if (next.size === allGrades.length) {
        saveToStorage(null)
        setActivePresetId(null)
        return null
      }
      saveToStorage(next)
      setActivePresetId(null) // 手动修改后取消激活方案标记
      return next
    })
  }, [allGrades, saveToStorage])

  const selectAll = useCallback(() => {
    setSelectedCourses(null)
    saveToStorage(null)
    setActivePresetId(null)
  }, [saveToStorage])

  const savePreset = useCallback((name: string) => {
    const wids = selectedCourses === null
      ? allGrades.map(g => g.WID).filter((w): w is string => !!w)
      : Array.from(selectedCourses)
    const preset: CoursePreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      wids,
      createdAt: Date.now(),
    }
    const next = [...presets, preset]
    setPresets(next)
    savePresets(next)
    setActivePresetId(preset.id)
  }, [selectedCourses, allGrades, presets])

  const loadPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id)
    if (!preset) return
    const allWids = new Set(allGrades.map(g => g.WID).filter((w): w is string => !!w))
    const validWids = preset.wids.filter(wid => allWids.has(wid))
    if (validWids.length === 0 || validWids.length === allGrades.length) {
      setSelectedCourses(null)
      saveToStorage(null)
    } else {
      setSelectedCourses(new Set(validWids))
      saveToStorage(new Set(validWids))
    }
    setActivePresetId(id)
  }, [presets, allGrades, saveToStorage])

  const deletePreset = useCallback((id: string) => {
    const next = presets.filter(p => p.id !== id)
    setPresets(next)
    savePresets(next)
    if (activePresetId === id) setActivePresetId(null)
  }, [presets, activePresetId])

  const getSelectionParam = useCallback((): Set<string> | undefined => {
    return selectedCourses ?? undefined
  }, [selectedCourses])

  return {
    selectedCourses,
    isCustomSelection: selectedCourses !== null,
    toggleCourse,
    selectAll,
    getSelectionParam,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    activePresetId,
  }
}
