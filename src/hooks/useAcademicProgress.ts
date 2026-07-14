import { useState, useEffect, useCallback } from 'react'
import { fetchPersonalPlanSummary } from '../api/academic'
import type { PersonalPlanSummary } from '../types/academic'

interface UseAcademicProgressReturn {
  summary: PersonalPlanSummary | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAcademicProgress(): UseAcademicProgressReturn {
  const [summary, setSummary] = useState<PersonalPlanSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPersonalPlanSummary()
      const rows = res.datas?.grpyfacx?.rows
      if (rows && rows.length > 0) {
        setSummary(rows[0])
      } else {
        setError('未获取到学业进度数据')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { summary, loading, error, refresh: fetchData }
}
