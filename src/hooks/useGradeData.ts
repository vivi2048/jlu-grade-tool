import { useState, useEffect, useCallback } from 'react'
import { fetchAllGrades } from '../api/grade'
import { calculateStatistics } from '../core/statistics'
import type { GradeItem, GradeStatistics } from '../types/grade'

interface UseGradeDataReturn {
  grades: GradeItem[]
  statistics: GradeStatistics | null
  loading: boolean
  error: string | null
  rawResponse: string | null
  refresh: () => void
}

export function useGradeData(semester?: string): UseGradeDataReturn {
  const [grades, setGrades] = useState<GradeItem[]>([])
  const [statistics, setStatistics] = useState<GradeStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRawResponse(null)
    try {
      console.log('[JLU Tool] Fetching grades...')
      const allGrades = await fetchAllGrades(semester)
      console.log(`[JLU Tool] Got ${allGrades.length} grades`)
      setRawResponse(JSON.stringify(allGrades.slice(0, 2), null, 2))
      setGrades(allGrades)
      const stats = calculateStatistics(allGrades)
      setStatistics(stats)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[JLU Tool] Grade fetch error:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [semester])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { grades, statistics, loading, error, rawResponse, refresh: fetchData }
}
