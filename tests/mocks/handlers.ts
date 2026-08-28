import type { Page } from '@playwright/test'

interface MockUser {
  id_user: number
  username: string
  nama: string
  role: string
  id_departemen: number
  id_pm: number | null
  total_cuti: number
  sisa_cuti: number
  email: string
  no_telp: string
  tanggal_bergabung: string
  pm: { id_user: number; username: string; nama: string } | null
}

const MOCK_USERS: Record<string, MockUser> = {
  karyawan: {
    id_user: 1,
    username: 'karyawan',
    nama: 'Budi Santoso',
    role: 'karyawan',
    id_departemen: 1,
    id_pm: 2,
    total_cuti: 12,
    sisa_cuti: 8,
    email: 'budi@example.com',
    no_telp: '081234567890',
    tanggal_bergabung: '2023-01-15',
    pm: { id_user: 2, username: 'pm_user', nama: 'Andi PM' },
  },
  karyawan_dept3: {
    id_user: 7,
    username: 'rissa',
    nama: 'Rissa Ristiana',
    role: 'karyawan',
    id_departemen: 3,
    id_pm: 2,
    total_cuti: 12,
    sisa_cuti: 11,
    email: 'rissa@example.com',
    no_telp: '081234567894',
    tanggal_bergabung: '2024-01-10',
    pm: { id_user: 2, username: 'pm_user', nama: 'Andi PM' },
  },
  rissa: {
    id_user: 7,
    username: 'rissa',
    nama: 'Rissa Ristiana',
    role: 'karyawan',
    id_departemen: 3,
    id_pm: 2,
    total_cuti: 12,
    sisa_cuti: 11,
    email: 'rissa@example.com',
    no_telp: '081234567894',
    tanggal_bergabung: '2024-01-10',
    pm: { id_user: 2, username: 'pm_user', nama: 'Andi PM' },
  },
  pm_user: {
    id_user: 2,
    username: 'pm_user',
    nama: 'Andi PM',
    role: 'pm',
    id_departemen: 1,
    id_pm: null,
    total_cuti: 12,
    sisa_cuti: 10,
    email: 'andi@example.com',
    no_telp: '081234567891',
    tanggal_bergabung: '2022-06-01',
    pm: null,
  },
  hr_user: {
    id_user: 3,
    username: 'hr_user',
    nama: 'Sari HR',
    role: 'hr',
    id_departemen: 2,
    id_pm: null,
    total_cuti: 12,
    sisa_cuti: 11,
    email: 'sari@example.com',
    no_telp: '081234567892',
    tanggal_bergabung: '2021-03-10',
    pm: null,
  },
  direktur_user: {
    id_user: 4,
    username: 'direktur_user',
    nama: 'Dewi Direktur',
    role: 'direktur',
    id_departemen: 3,
    id_pm: null,
    total_cuti: 15,
    sisa_cuti: 13,
    email: 'dewi@example.com',
    no_telp: '081234567893',
    tanggal_bergabung: '2020-01-01',
    pm: null,
  },
}

export function generateToken(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const exp = Math.floor(Date.now() / 1000) + 86400
  const payload = btoa(
    JSON.stringify({
      sub: user.id_user,
      username: user.username,
      nama: user.nama,
      role: user.role,
      id_departemen: user.id_departemen,
      exp,
    }),
  )
  const signature = btoa('mock-signature')
  return `${header}.${payload}.${signature}`
}

function jsonResponse(body: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  }
}

export async function setupMockRoutes(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    const bodyText = route.request().postData() || ''

    // --- AUTH ---
    if (method === 'POST' && url.includes('/api/auth/login')) {
      const params = new URLSearchParams(bodyText)
      const username = params.get('username') || ''
      const user = MOCK_USERS[username]
      if (user) {
        return route.fulfill(jsonResponse({ access_token: generateToken(user), token_type: 'Bearer' }))
      }
      return route.fulfill(jsonResponse({ detail: 'Username atau password salah' }, 400))
    }

    if (method === 'POST' && url.includes('/api/auth/register')) {
      const data = JSON.parse(bodyText)
      return route.fulfill(
        jsonResponse({
          id_user: 99,
          username: data.username,
          nama: data.nama,
          role: 'karyawan',
          id_departemen: data.id_departemen,
        }),
      )
    }

    if (method === 'POST' && url.includes('/api/auth/register-admin')) {
      const data = JSON.parse(bodyText)
      return route.fulfill(
        jsonResponse({
          id_user: 99,
          username: data.username,
          nama: data.nama,
          role: data.role,
          id_departemen: data.id_departemen,
        }),
      )
    }

    if (method === 'PUT' && url.includes('/api/hr/karyawan/')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Karyawan diperbarui' }))
    }

    if (method === 'POST' && url.includes('/api/auth/logout')) {
      return route.fulfill(jsonResponse({ success: true }))
    }

    if (method === 'GET' && url.includes('/api/auth/me')) {
      const token = route.request().headers()['authorization']?.replace('Bearer ', '') || ''
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const username = payload.username
        const user = MOCK_USERS[username]
        if (user) return route.fulfill(jsonResponse(user))
      } catch {}
      return route.fulfill(jsonResponse({ detail: 'Unauthorized' }, 401))
    }

    if (method === 'PUT' && url.includes('/api/auth/change-password')) {
      return route.fulfill(jsonResponse({ success: true }))
    }

    if (method === 'PUT' && url.includes('/api/auth/profile')) {
      return route.fulfill(jsonResponse({ success: true }))
    }

    if (method === 'GET' && url.includes('/api/auth/users')) {
      return route.fulfill(
        jsonResponse([
          { id_user: 1, nama: 'Budi Santoso' },
          { id_user: 2, nama: 'Andi PM' },
          { id_user: 3, nama: 'Sari HR' },
          { id_user: 5, nama: 'Rina Karyawan' },
        ]),
      )
    }

    // --- LEAVES (generic) ---
    if (method === 'GET' && url.match(/\/api\/leaves($|\?)/)) {
      return route.fulfill(
        jsonResponse({
          success: true,
          data: [
            {
              id: '1',
              userId: '1',
              type: 'cuti_tahunan',
              startDate: '2026-09-01',
              endDate: '2026-09-03',
              reason: 'Libur keluarga',
              status: 'pending',
              createdAt: '2026-08-20',
              updatedAt: '2026-08-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        }),
      )
    }

    if (method === 'GET' && url.match(/\/api\/leaves\/\w+($|\?)/) && !url.includes('approve') && !url.includes('reject')) {
      return route.fulfill(
        jsonResponse({
          success: true,
          data: {
            id: '1',
            userId: '1',
            type: 'cuti_tahunan',
            startDate: '2026-09-01',
            endDate: '2026-09-03',
            reason: 'Libur keluarga',
            status: 'pending',
            createdAt: '2026-08-20',
            updatedAt: '2026-08-20',
          },
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/leaves/my')) {
      return route.fulfill(
        jsonResponse({
          success: true,
          data: [
            {
              id: '1',
              userId: '1',
              type: 'cuti_tahunan',
              startDate: '2026-09-01',
              endDate: '2026-09-03',
              reason: 'Libur keluarga',
              status: 'pending',
              createdAt: '2026-08-20',
              updatedAt: '2026-08-20',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        }),
      )
    }

    if (method === 'POST' && url.includes('/api/leaves')) {
      return route.fulfill(
        jsonResponse({
          success: true,
          data: {
            id: '2',
            userId: '1',
            type: 'cuti_tahunan',
            startDate: '2026-10-01',
            endDate: '2026-10-03',
            reason: 'Cuti lebaran',
            status: 'pending',
            createdAt: '2026-08-25',
            updatedAt: '2026-08-25',
          },
          message: 'Pengajuan cuti berhasil',
        }),
      )
    }

    if (method === 'PUT' && url.includes('/approve')) {
      return route.fulfill(
        jsonResponse({ success: true, data: { id: '1', status: 'approved' }, message: 'Disetujui' }),
      )
    }

    if (method === 'PUT' && url.includes('/reject')) {
      return route.fulfill(
        jsonResponse({ success: true, data: { id: '1', status: 'rejected' }, message: 'Ditolak' }),
      )
    }

    if (method === 'DELETE' && url.match(/\/api\/leaves\/\w+/)) {
      return route.fulfill(jsonResponse({ success: true, message: 'Dihapus' }))
    }

    // --- APPROVAL ---
    if (method === 'GET' && url.includes('/api/approval/approval-queue')) {
      return route.fulfill(
        jsonResponse([
          {
            id_log_cuti: 10,
            nama: 'Budi Santoso',
            nama_departemen: 'Engineering',
            jenis_cuti: 'Cuti Tahunan',
            tanggal_mulai: '2026-09-01',
            tanggal_selesai: '2026-09-03',
            durasi: 3,
            pengganti: 'Rina Karyawan',
            sisa_cuti: 8,
            alasan: 'Libur keluarga',
          },
          {
            id_log_cuti: 11,
            nama: 'Rina Karyawan',
            nama_departemen: 'Engineering',
            jenis_cuti: 'Cuti Sakit',
            tanggal_mulai: '2026-09-05',
            tanggal_selesai: '2026-09-06',
            durasi: 2,
            pengganti: 'Budi Santoso',
            sisa_cuti: 10,
            alasan: 'Sakit flu',
          },
        ]),
      )
    }

    if (method === 'POST' && url.match(/\/api\/approval\/approval\d+/)) {
      return route.fulfill(jsonResponse({ success: true, message: 'Berhasil diproses' }))
    }

    if (method === 'GET' && url.includes('/api/approval/penambahan-kerja-queue')) {
      return route.fulfill(
        jsonResponse([
          {
            id_pengajuan_kerja: 1,
            nama: 'Budi Santoso',
            nama_departemen: 'Engineering',
            tanggal_mulai: '2026-09-15',
            tanggal_selesai: '2026-09-15',
            keterangan: 'Bekerja di tanggal cuti bersama untuk menyelesaikan proyek deadline',
          },
          {
            id_pengajuan_kerja: 2,
            nama: 'Rina Karyawan',
            nama_departemen: 'Engineering',
            tanggal_mulai: '2026-12-24',
            tanggal_selesai: '2026-12-24',
            keterangan: 'Urusan operasional yang mendesak',
          },
        ]),
      )
    }

    if (method === 'POST' && url.includes('/api/approval/penambahan-kerja/')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Berhasil diproses' }))
    }

    // --- KARYAWAN ---
    if (method === 'GET' && url.includes('/api/karyawan/cuti/ongoing')) {
      return route.fulfill(
        jsonResponse([
          {
            jenis_cuti: 'Cuti Tahunan',
            durasi: 3,
            keterangan_cuti: 'Libur keluarga',
            tanggal_mulai: '2026-09-01',
            tanggal_selesai: '2026-09-03',
            status_sekarang: 'menunggu_pm',
            diproses_pm: 0,
            diproses_hr: 0,
            diproses_direktur: 0,
            processed_at_pm: null,
            processed_at_hr: null,
            processed_at_direktur: null,
            alasan_penolakan: null,
          },
        ]),
      )
    }

    if (method === 'GET' && url.match(/\/api\/karyawan\/cuti($|\?)/)) {
      return route.fulfill(
        jsonResponse([
          {
            jenis_cuti: 'Cuti Tahunan',
            tanggal_mulai: '2026-08-01',
            tanggal_selesai: '2026-08-03',
            keterangan: 'Libur lebaran',
            nama_pengganti: 'Rina Karyawan',
            durasi: 3,
            status: 'disetujui',
          },
          {
            jenis_cuti: 'Cuti Sakit',
            tanggal_mulai: '2026-07-10',
            tanggal_selesai: '2026-07-11',
            keterangan: 'Sakit demam',
            nama_pengganti: 'Andi PM',
            durasi: 2,
            status: 'disetujui',
          },
        ]),
      )
    }

    if (method === 'POST' && url.includes('/api/karyawan/cuti')) {
      return route.fulfill(
        jsonResponse({
          id_log_cuti: 20,
          id_user: 1,
          jenis_cuti: 'cuti_tahunan',
          tanggal_mulai: '2026-10-01',
          tanggal_selesai: '2026-10-03',
          keterangan_cuti: 'Cuti tahunan',
          status: 'menunggu_pm',
          alasan_penolakan: null,
          disetujui_pm: null,
          disetujui_hr: null,
          disetujui_direktur: null,
          approved_at_pm: null,
          approved_at_hr: null,
          approved_at_direktur: null,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/karyawan/kalender-cuti-saya')) {
      return route.fulfill(
        jsonResponse([
          {
            tanggal: '2026-09-01',
            nama: 'Budi Santoso',
            keterangan: 'Libur keluarga',
            jenis_cuti: 'Cuti Tahunan',
            status: 'menunggu_pm',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/karyawan/kalender-cuti-tim')) {
      return route.fulfill(
        jsonResponse([
          {
            tanggal: '2026-09-05',
            nama: 'Rina Karyawan',
            keterangan: 'Sakit flu',
            jenis_cuti: 'Cuti Sakit',
            status: 'disetujui',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/karyawan/activities')) {
      return route.fulfill(
        jsonResponse([
          {
            jenis_aktivitas: 'pengajuan',
            keterangan: 'Mengajukan cuti tahunan untuk 3 hari',
            tanggal: '2026-08-20',
          },
          {
            jenis_aktivitas: 'disetujui',
            keterangan: 'Cuti tahunan disetujui oleh PM',
            tanggal: '2026-08-21',
          },
        ]),
      )
    }

    // --- PENAMBAHAN KERJA ---
    if (method === 'GET' && url.includes('/api/karyawan/penambahan-kerja')) {
      return route.fulfill(
        jsonResponse([
          {
            id_pengajuan_kerja: 1,
            id_user: 7,
            tanggal_mulai: '2026-12-25',
            tanggal_selesai: '2026-12-25',
            keterangan_pengajuan: 'ada job di rumah temen',
            status: 'disetujui_pm',
            diproses_pm: 3,
            processed_at_pm: '2026-08-27',
          },
          {
            id_pengajuan_kerja: 2,
            id_user: 7,
            tanggal_mulai: '2026-08-17',
            tanggal_selesai: '2026-08-17',
            keterangan_pengajuan: 'Urusan operasional',
            status: 'ditolak_pm',
            diproses_pm: 3,
            processed_at_pm: '2026-08-15',
          },
          {
            id_pengajuan_kerja: 3,
            id_user: 7,
            tanggal_mulai: '2026-12-24',
            tanggal_selesai: '2026-12-24',
            keterangan_pengajuan: 'pengen kerja aja',
            status: 'menunggu_pm',
            diproses_pm: 0,
            processed_at_pm: null,
          },
        ]),
      )
    }

    if (method === 'POST' && url.includes('/api/karyawan/penambahan-kerja')) {
      return route.fulfill(
        jsonResponse({
          id_pengajuan_kerja: 3,
          id_user: 7,
          tanggal_mulai: '2026-09-01',
          tanggal_selesai: '2026-09-01',
          keterangan_pengajuan: 'Pengajuan tetap bekerja',
          status: 'menunggu_pm',
          diproses_pm: 0,
          processed_at_pm: null,
        }),
      )
    }

    // --- HOLIDAYS ---
    if (method === 'GET' && url.includes('/api/holidays/next')) {
      return route.fulfill(
        jsonResponse({
          nama_libur: 'Hari Kemerdekaan',
          tanggal_mulai: '2026-08-17',
          tanggal_selesai: '2026-08-17',
          total_hari: 1,
        }),
      )
    }

    // --- HR ---
    if (method === 'GET' && url.includes('/api/hr/dashboard')) {
      return route.fulfill(
        jsonResponse({
          total_karyawan: 25,
          menunggu: 3,
          total_cuti_bulan_ini: 8,
          total_cuti_bulan_depan: 5,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/list-cuti-mendatang')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            jenis_cuti: 'Cuti Tahunan',
            tanggal_mulai: '2026-09-01',
            tanggal_selesai: '2026-09-03',
            status: 'disetujui',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/activity')) {
      return route.fulfill(
        jsonResponse([
          {
            id: 1,
            deskripsi: 'Budi Santoso mengajukan cuti tahunan',
            waktu: '2026-08-20 10:00',
            tipe: 'submit',
          },
          {
            id: 2,
            deskripsi: 'Cuti Budi Santoso disetujui oleh PM',
            waktu: '2026-08-21 09:00',
            tipe: 'approve',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/approvals/history')) {
      return route.fulfill(
        jsonResponse([
          {
            id_log_cuti: 1,
            id_user: 1,
            nama: 'Budi Santoso',
            jabatan: 'Staff',
            departemen: 'Engineering',
            jenis_cuti: 'Cuti Tahunan',
            tanggal_mulai: '2026-09-01',
            tanggal_selesai: '2026-09-03',
            durasi: 3,
            delegasi_tugas: 'Rina Karyawan',
            sisa_cuti: 8,
            disetujui_oleh: 'Andi PM',
            keterangan: 'Libur keluarga',
            status: 'disetujui',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/persetujuan')) {
      return route.fulfill(
        jsonResponse({
          total_menunggu: 3,
          disetujui_bulan_ini: 5,
          ditolak_bulan_ini: 1,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/rekapitulasi')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            nama_departemen: 'Engineering',
            tanggal_mulai: '2026-08-01',
            tanggal_selesai: '2026-08-03',
            total_cuti: 12,
            sisa_cuti: 8,
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/log-cuti')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            tanggal_mulai: '2026-08-01',
            tanggal_selesai: '2026-08-03',
            durasi: 3,
            jenis_cuti: 'Cuti Tahunan',
            keterangan: 'Libur lebaran',
            pengganti: 'Rina Karyawan',
            status: 'disetujui',
            hr_approved_by: 'Sari HR',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/ringkasan-karyawan')) {
      return route.fulfill(
        jsonResponse({
          total_karyawan: 25,
          total_departemen: 5,
          total_project_manager: 4,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/tabel-karyawan')) {
      return route.fulfill(
        jsonResponse([
          {
            id_user: 1,
            nama: 'Budi Santoso',
            departemen: 'Engineering',
            jabatan: 'Staff',
            email: 'budi@example.com',
            status: 'Aktif',
            role: 'karyawan',
            no_telp: '081234567890',
            tanggal_bergabung: '2023-01-15',
          },
          {
            id_user: 5,
            nama: 'Rina Karyawan',
            departemen: 'Engineering',
            jabatan: 'Staff',
            email: 'rina@example.com',
            status: 'Aktif',
            role: 'karyawan',
            no_telp: '081234567894',
            tanggal_bergabung: '2024-06-01',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/tabel-departemen')) {
      return route.fulfill(
        jsonResponse([
          { nama_departemen: 'Engineering', jumlah_karyawan: 10 },
          { nama_departemen: 'HR', jumlah_karyawan: 5 },
          { nama_departemen: 'Finance', jumlah_karyawan: 6 },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/manajemen-jatah-cuti')) {
      return route.fulfill(
        jsonResponse({
          total_karyawan_aktif: 25,
          total_karyawan_cuti: 3,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/daftar-cuti-karyawan')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            nama_departemen: 'Engineering',
            total_cuti: 12,
            cuti_terpakai: 4,
            sisa_cuti: 8,
          },
          {
            nama: 'Rina Karyawan',
            nama_departemen: 'Engineering',
            total_cuti: 12,
            cuti_terpakai: 2,
            sisa_cuti: 10,
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/hr/export-cuti')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'nama,departemen,tanggal_mulai,tanggal_selesai,status\nBudi Santoso,Engineering,2026-08-01,2026-08-03,disetujui',
      })
    }

    if (method === 'POST' && url.includes('/api/hr/tambah-cuti')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Jatah cuti ditambahkan' }))
    }

    // --- DIREKTUR WRITE OPS ---
    if (method === 'POST' && url.includes('/api/hr/data-karyawan')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Karyawan ditambahkan' }))
    }

    if (method === 'PUT' && url.includes('/api/hr/data-karyawan/')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Karyawan diperbarui' }))
    }

    if (method === 'POST' && url.includes('/api/hr/data-departemen')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Departemen ditambahkan' }))
    }

    if (method === 'PUT' && url.includes('/api/hr/data-departemen/')) {
      return route.fulfill(jsonResponse({ success: true, message: 'Departemen diperbarui' }))
    }

    // --- PM ---
    if (method === 'GET' && url.includes('/api/pm/dashboard')) {
      return route.fulfill(
        jsonResponse({
          sisa_cuti: 10,
          cuti_terpakai: 2,
          tim_menunggu_appoval: 2,
          total_pengajuan_tim: 5,
          total_pengajuan_acc_tim: 3,
          total_pengajuan_decline_tim: 0,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/dashboard-tim')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            jenis_cuti: 'Cuti Tahunan',
            tanggal_mulai: '2026-09-01',
            tanggal_selesai: '2026-09-03',
            status: 'menunggu_pm',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/team/members')) {
      return route.fulfill(
        jsonResponse([
          { id_user: 1, nama: 'Budi Santoso', departemen: 'Engineering', sisa_cuti: 8 },
          { id_user: 5, nama: 'Rina Karyawan', departemen: 'Engineering', sisa_cuti: 10 },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/team/activity')) {
      return route.fulfill(
        jsonResponse([
          {
            id: 1,
            deskripsi: 'Budi Santoso mengajukan cuti tahunan',
            waktu: '2026-08-20 10:00',
            tipe: 'submit',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/history-cuti-tim')) {
      return route.fulfill(
        jsonResponse([
          {
            tanggal_mulai: '2026-08-01',
            tanggal_selesai: '2026-08-03',
            nama: 'Budi Santoso',
            jenis_cuti: 'Cuti Tahunan',
            keterangan: 'Libur lebaran',
            durasi: 3,
            pengganti: 'Rina Karyawan',
            status: 'disetujui',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/approvals/history')) {
      return route.fulfill(
        jsonResponse({
          data: [
            {
              tanggal_mulai: '2026-08-01',
              tanggal_selesai: '2026-08-03',
              nama: 'Budi Santoso',
              jenis_cuti: 'Cuti Tahunan',
              keterangan: 'Libur lebaran',
              durasi: 3,
              pengganti: 'Rina Karyawan',
              status: 'disetujui',
            },
          ],
          total: 1,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/ringkasan-tim')) {
      return route.fulfill(
        jsonResponse({
          total_pengajuan: 5,
          menunggu_persetujuan: 2,
          sedang_cuti: 1,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/rekap-cuti-ringkasan')) {
      return route.fulfill(
        jsonResponse({
          total_anggota_aktif: 5,
          total_cuti_all: 60,
        }),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/rekap-cuti-detail')) {
      return route.fulfill(
        jsonResponse([
          {
            nama: 'Budi Santoso',
            nama_departemen: 'Engineering',
            penggunaan_cuti: 4,
            sisa_cuti: 8,
            status: 'aktif',
          },
        ]),
      )
    }

    if (method === 'GET' && url.includes('/api/pm/rekap/export')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'nama,departemen,penggunaan_cuti,sisa_cuti\nBudi Santoso,Engineering,4,8',
      })
    }

    // --- DEPARTEMEN ---
    if (method === 'GET' && url.includes('/api/departemen')) {
      return route.fulfill(
        jsonResponse([
          { id_departemen: 1, nama_departemen: 'Engineering' },
          { id_departemen: 2, nama_departemen: 'HR' },
          { id_departemen: 3, nama_departemen: 'Finance' },
        ]),
      )
    }

    // --- EXTERNAL HOLIDAY API ---
    if (url.includes('api.kemendesa.link')) {
      return route.fulfill(
        jsonResponse({
          metadata: { version: '1.0', year: 2026, last_updated: '2026-01-01', timezone: 'Asia/Jakarta', calendar_system: 'gregorian' },
          data: [
            { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', is_civic: true, is_religious: false, is_cuti_bersama: false },
            { date: '2026-02-16', name: 'Tahun Baru Imlek 2577 Kongzili', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-03-18', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-03-20', name: 'Idul Fitri 1447 Hijriah', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-03-23', name: 'Idul Fitri 1447 Hijriah', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-03-24', name: 'Idul Fitri 1447 Hijriah', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-05-15', name: 'Kenaikan Yesus Kristus', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-05-28', name: 'Idul Adha 1447 Hijriah', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-08-17', name: 'Proklamasi Kemerdekaan', is_civic: true, is_religious: false, is_cuti_bersama: false },
            { date: '2026-12-24', name: 'Kelahiran Yesus Kristus', is_civic: false, is_religious: true, is_cuti_bersama: true },
            { date: '2026-12-25', name: 'Kelahiran Yesus Kristus', is_civic: false, is_religious: true, is_cuti_bersama: false },
          ],
        }),
      )
    }

    // Fallback - passthrough
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })
}
