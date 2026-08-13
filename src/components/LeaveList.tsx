import { useState } from 'react'
import { useLeaves, useCreateLeave } from '../hooks/useLeaves'
import type { CreateLeaveRequest } from '../types'

export default function LeaveList() {
  const [page, setPage] = useState(1)
  const { leaves, total, loading, error, refetch } = useLeaves(page)
  const { create, loading: creating } = useCreateLeave()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateLeaveRequest>({
    type: 'cuti_tahunan',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create(form)
      setShowForm(false)
      setForm({ type: 'cuti_tahunan', startDate: '', endDate: '', reason: '' })
      refetch()
    } catch {
      // error handled in hook
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || ''}`}>
        {status === 'pending' ? 'Menunggu' : status === 'approved' ? 'Disetujui' : 'Ditolak'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Cuti</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {showForm ? 'Batal' : '+ Ajukan Cuti'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CreateLeaveRequest['type'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="cuti_tahunan">Cuti Tahunan</option>
                <option value="cuti_sakit">Cuti Sakit</option>
                <option value="cuti_lahir">Cuti Melahirkan</option>
                <option value="cuti_lainnya">Cuti Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alasan cuti..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {creating ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </form>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500">Belum ada pengajuan cuti</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Jenis</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Alasan</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {leave.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {leave.startDate} - {leave.endDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{leave.reason}</td>
                  <td className="px-6 py-4">{statusBadge(leave.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Total: {total} pengajuan</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">Halaman {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={leaves.length < 10}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
