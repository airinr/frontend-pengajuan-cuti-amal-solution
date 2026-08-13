import { useState, useEffect, useCallback } from 'react'
import { leaveApi } from '../services'
import type { LeaveRequest, CreateLeaveRequest } from '../types'

export function useLeaves(page = 1, limit = 10) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leaveApi.getAll(page, limit)
      setLeaves(response.data.data)
      setTotal(response.data.total)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data cuti')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  return { leaves, total, loading, error, refetch: fetchLeaves }
}

export function useCreateLeave() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: CreateLeaveRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await leaveApi.create(data)
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengajukan cuti')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}
