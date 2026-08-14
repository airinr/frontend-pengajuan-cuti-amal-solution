<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { leaveApi } from '../services'
import type { LeaveRequest, CreateLeaveRequest } from '../types'

const page = ref(1)
const leaves = ref<LeaveRequest[]>([])
const total = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const showForm = ref(false)
const creating = ref(false)
const form = ref<CreateLeaveRequest>({
  type: 'cuti_tahunan',
  startDate: '',
  endDate: '',
  reason: '',
})

const fetchLeaves = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await leaveApi.getAll(page.value)
    leaves.value = response.data.data
    total.value = response.data.total
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Gagal memuat data cuti'
  } finally {
    loading.value = false
  }
}

onMounted(fetchLeaves)
watch(page, fetchLeaves)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  try {
    creating.value = true
    await leaveApi.create(form.value)
    showForm.value = false
    form.value = { type: 'cuti_tahunan', startDate: '', endDate: '', reason: '' }
    await fetchLeaves()
  } catch {
    // error handled
  } finally {
    creating.value = false
  }
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return styles[status] || ''
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
  }
  return labels[status] || status
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Daftar Cuti</h1>
      <button
        @click="showForm = !showForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {{ showForm ? 'Batal' : '+ Ajuan Cuti' }}
      </button>
    </div>

    <form v-if="showForm" @submit="handleSubmit" class="bg-white p-6 rounded-xl shadow-lg border space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
          <select
            v-model="form.type"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="cuti_tahunan">Cuti Tahunan</option>
            <option value="cuti_sakit">Cuti Sakit</option>
            <option value="cuti_lahir">Cuti Melahirkan</option>
            <option value="cuti_lainnya">Cuti Lainnya</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
          <input
            v-model="form.reason"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alasan cuti..."
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
          <input
            v-model="form.startDate"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
          <input
            v-model="form.endDate"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        :disabled="creating"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {{ creating ? 'Mengirim...' : 'Kirim Pengajuan' }}
      </button>
    </form>

    <div v-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Memuat data...</p>
    </div>

    <div v-else-if="leaves.length === 0" class="text-center py-12 bg-white rounded-xl border">
      <p class="text-gray-500">Belum ada pengajuan cuti</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-lg border overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Jenis</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Alasan</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="leave in leaves" :key="leave.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-800">
              {{ leave.type.replace('_', ' ') }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ leave.startDate }} - {{ leave.endDate }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ leave.reason }}</td>
            <td class="px-6 py-4">
              <span :class="`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(leave.status)}`">
                {{ statusLabel(leave.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-between items-center px-6 py-4 border-t">
        <p class="text-sm text-gray-500">Total: {{ total }} pengajuan</p>
        <div class="flex gap-2">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            class="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
          >
            Sebelumnya
          </button>
          <span class="px-3 py-1 text-sm text-gray-600">Halaman {{ page }}</span>
          <button
            @click="page = page + 1"
            :disabled="leaves.length < 10"
            class="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
