import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/karyawan',
    component: () => import('../layouts/KaryawanLayout.vue'),
    meta: { requiresAuth: true, role: 'karyawan' },
    children: [
      {
        path: '',
        redirect: '/karyawan/dashboard'
      },
      {
        path: 'dashboard',
        name: 'KaryawanDashboard',
        component: () => import('../pages/karyawan/DashboardPage.vue')
      },
      {
        path: 'pengajuan-cuti',
        name: 'KaryawanPengajuanCuti',
        component: () => import('../pages/karyawan/PengajuanCutiPage.vue')
      },
      {
        path: 'status-pengajuan',
        name: 'KaryawanStatusPengajuan',
        component: () => import('../pages/karyawan/StatusPengajuanPage.vue')
      },
      {
        path: 'riwayat-cuti',
        name: 'KaryawanRiwayatCuti',
        component: () => import('../pages/karyawan/RiwayatCutiPage.vue')
      },
      {
        path: 'kalender-cuti',
        name: 'KaryawanKalenderCuti',
        component: () => import('../pages/karyawan/KalenderCutiPage.vue')
      },
      {
        path: 'profil',
        name: 'KaryawanProfil',
        component: () => import('../pages/karyawan/ProfilPage.vue')
      },
      {
        path: 'pengajuan-bekerja',
        name: 'KaryawanPengajuanBekerja',
        component: () => import('../pages/karyawan/PengajuanTetapBekerjaPage.vue')
      },
      {
        path: 'status-pengajuan-kerja',
        name: 'KaryawanStatusPengajuanKerja',
        component: () => import('../pages/karyawan/StatusPengajuanKerjaPage.vue')
      },
      {
        path: 'riwayat-pengajuan-kerja',
        name: 'KaryawanRiwayatPengajuanKerja',
        component: () => import('../pages/karyawan/RiwayatPengajuanKerjaPage.vue')
      }
    ]
  },
  {
    path: '/pm',
    component: () => import('../layouts/PmLayout.vue'),
    meta: { requiresAuth: true, role: 'pm' },
    children: [
      {
        path: '',
        redirect: '/pm/dashboard'
      },
      {
        path: 'dashboard',
        name: 'PmDashboard',
        component: () => import('../pages/pm/DashboardPage.vue')
      },
      {
        path: 'persetujuan',
        name: 'PmPersetujuan',
        component: () => import('../pages/pm/PersetujuanPage.vue')
      },
      {
        path: 'persetujuan-bekerja',
        name: 'PmPersetujuanBekerja',
        component: () => import('../pages/pm/PersetujuanBekerjaPage.vue')
      },
      {
        path: 'rekap-pengajuan-kerja',
        name: 'PmRekapPengajuanKerja',
        component: () => import('../pages/pm/RekapPengajuanKerjaTimPage.vue')
      },
      {
        path: 'rekap-cuti-tim',
        name: 'PmRekapCutiTim',
        component: () => import('../pages/pm/RekapCutiTimPage.vue')
      },
      {
        path: 'kalender-tim',
        name: 'PmKalenderTim',
        component: () => import('../pages/pm/KalenderTimPage.vue')
      },
      {
        path: 'pengajuan-cuti',
        name: 'PmPengajuanCuti',
        component: () => import('../pages/karyawan/PengajuanCutiPage.vue')
      },
      {
        path: 'riwayat-cuti',
        name: 'PmRiwayatCuti',
        component: () => import('../pages/karyawan/RiwayatCutiPage.vue')
      },
      {
        path: 'status-pengajuan',
        name: 'PmStatusPengajuan',
        component: () => import('../pages/karyawan/StatusPengajuanPage.vue')
      },
      {
        path: 'profil',
        name: 'PmProfil',
        component: () => import('../pages/karyawan/ProfilPage.vue')
      },
      {
        path: 'pengajuan-bekerja',
        name: 'PmPengajuanBekerja',
        component: () => import('../pages/karyawan/PengajuanTetapBekerjaPage.vue')
      },
      {
        path: 'status-pengajuan-kerja',
        name: 'PmStatusPengajuanKerja',
        component: () => import('../pages/karyawan/StatusPengajuanKerjaPage.vue')
      },
      {
        path: 'riwayat-pengajuan-kerja',
        name: 'PmRiwayatPengajuanKerja',
        component: () => import('../pages/karyawan/RiwayatPengajuanKerjaPage.vue')
      }
    ]
  },
  {
    path: '/hr',
    component: () => import('../layouts/HrLayout.vue'),
    meta: { requiresAuth: true, role: 'hr_manager' },
    children: [
      {
        path: '',
        redirect: '/hr/dashboard'
      },
      {
        path: 'dashboard',
        name: 'HrDashboard',
        component: () => import('../pages/hr/DashboardPage.vue')
      },
      {
        path: 'persetujuan',
        name: 'HrPersetujuan',
        component: () => import('../pages/hr/PersetujuanPage.vue')
      },
      {
        path: 'log-rekap-cuti',
        name: 'HrLogRekapCuti',
        component: () => import('../pages/hr/LogRekapCutiPage.vue')
      },
      {
        path: 'data-karyawan',
        name: 'HrDataKaryawan',
        component: () => import('../pages/hr/DataKaryawanPage.vue')
      },
      {
        path: 'jatah-cuti',
        name: 'HrJatahCuti',
        component: () => import('../pages/hr/JatahCutiPage.vue')
      },
      {
        path: 'kalender-tim',
        name: 'HrKalenderTim',
        component: () => import('../pages/pm/KalenderTimPage.vue')
      },
      {
        path: 'persetujuan-kerja',
        name: 'HrPersetujuanKerja',
        component: () => import('../pages/hr/PersetujuanPenambahanKerjaPage.vue')
      },
      {
        path: 'log-rekap-kerja',
        name: 'HrLogRekapKerja',
        component: () => import('../pages/hr/LogRekapPenambahanKerjaPage.vue')
      },
      {
        path: 'pengajuan-cuti',
        name: 'HrPengajuanCuti',
        component: () => import('../pages/karyawan/PengajuanCutiPage.vue')
      },
      {
        path: 'riwayat-cuti',
        name: 'HrRiwayatCuti',
        component: () => import('../pages/karyawan/RiwayatCutiPage.vue')
      },
      {
        path: 'status-pengajuan',
        name: 'HrStatusPengajuan',
        component: () => import('../pages/karyawan/StatusPengajuanPage.vue')
      },
      {
        path: 'profil',
        name: 'HrProfil',
        component: () => import('../pages/karyawan/ProfilPage.vue')
      },
      {
        path: 'pengajuan-bekerja',
        name: 'HrPengajuanBekerja',
        component: () => import('../pages/karyawan/PengajuanTetapBekerjaPage.vue')
      },
      {
        path: 'status-pengajuan-kerja',
        name: 'HrStatusPengajuanKerja',
        component: () => import('../pages/karyawan/StatusPengajuanKerjaPage.vue')
      },
      {
        path: 'riwayat-pengajuan-kerja',
        name: 'HrRiwayatPengajuanKerja',
        component: () => import('../pages/karyawan/RiwayatPengajuanKerjaPage.vue')
      }
    ]
  },
  {
    path: '/staff_hr',
    component: () => import('../layouts/StaffHrLayout.vue'),
    meta: { requiresAuth: true, role: 'staff_hr' },
    children: [
      {
        path: '',
        redirect: '/staff_hr/dashboard'
      },
      {
        path: 'dashboard',
        name: 'StaffHrDashboard',
        component: () => import('../pages/hr/DashboardPage.vue')
      },
      {
        path: 'persetujuan',
        name: 'StaffHrPersetujuan',
        component: () => import('../pages/hr/PersetujuanPage.vue')
      },
      {
        path: 'log-rekap-cuti',
        name: 'StaffHrLogRekapCuti',
        component: () => import('../pages/hr/LogRekapCutiPage.vue')
      },
      {
        path: 'data-karyawan',
        name: 'StaffHrDataKaryawan',
        component: () => import('../pages/hr/DataKaryawanPage.vue')
      },
      {
        path: 'jatah-cuti',
        name: 'StaffHrJatahCuti',
        component: () => import('../pages/hr/JatahCutiPage.vue')
      },
      {
        path: 'kalender-tim',
        name: 'StaffHrKalenderTim',
        component: () => import('../pages/pm/KalenderTimPage.vue')
      },
      {
        path: 'persetujuan-kerja',
        name: 'StaffHrPersetujuanKerja',
        component: () => import('../pages/hr/PersetujuanPenambahanKerjaPage.vue')
      },
      {
        path: 'log-rekap-kerja',
        name: 'StaffHrLogRekapKerja',
        component: () => import('../pages/hr/LogRekapPenambahanKerjaPage.vue')
      },
      {
        path: 'pengajuan-cuti',
        name: 'StaffHrPengajuanCuti',
        component: () => import('../pages/karyawan/PengajuanCutiPage.vue')
      },
      {
        path: 'riwayat-cuti',
        name: 'StaffHrRiwayatCuti',
        component: () => import('../pages/karyawan/RiwayatCutiPage.vue')
      },
      {
        path: 'status-pengajuan',
        name: 'StaffHrStatusPengajuan',
        component: () => import('../pages/karyawan/StatusPengajuanPage.vue')
      },
      {
        path: 'profil',
        name: 'StaffHrProfil',
        component: () => import('../pages/karyawan/ProfilPage.vue')
      },
      {
        path: 'pengajuan-bekerja',
        name: 'StaffHrPengajuanBekerja',
        component: () => import('../pages/karyawan/PengajuanTetapBekerjaPage.vue')
      },
      {
        path: 'status-pengajuan-kerja',
        name: 'StaffHrStatusPengajuanKerja',
        component: () => import('../pages/karyawan/StatusPengajuanKerjaPage.vue')
      },
      {
        path: 'riwayat-pengajuan-kerja',
        name: 'StaffHrRiwayatPengajuanKerja',
        component: () => import('../pages/karyawan/RiwayatPengajuanKerjaPage.vue')
      }
    ]
  },
  {
    path: '/direktur',
    component: () => import('../layouts/DirekturLayout.vue'),
    meta: { requiresAuth: true, role: 'direktur' },
    children: [
      {
        path: '',
        redirect: '/direktur/dashboard'
      },
      {
        path: 'dashboard',
        name: 'DirekturDashboard',
        component: () => import('../pages/direktur/DashboardPage.vue')
      },
      {
        path: 'persetujuan',
        name: 'DirekturPersetujuan',
        component: () => import('../pages/direktur/PersetujuanPage.vue')
      },
      {
        path: 'log-rekap-cuti',
        name: 'DirekturLogRekapCuti',
        component: () => import('../pages/direktur/LogRekapCutiPage.vue')
      },
      {
        path: 'data-karyawan',
        name: 'DirekturDataKaryawan',
        component: () => import('../pages/direktur/DataKaryawanPage.vue')
      },
      {
        path: 'jatah-cuti',
        name: 'DirekturJatahCuti',
        component: () => import('../pages/direktur/JatahCutiPage.vue')
      },
      {
        path: 'kalender-tim',
        name: 'DirekturKalenderTim',
        component: () => import('../pages/direktur/KalenderTimPage.vue')
      },
      {
        path: 'persetujuan-kerja',
        name: 'DirekturPersetujuanKerja',
        component: () => import('../pages/hr/PersetujuanPenambahanKerjaPage.vue')
      },
      {
        path: 'log-rekap-kerja',
        name: 'DirekturLogRekapKerja',
        component: () => import('../pages/hr/LogRekapPenambahanKerjaPage.vue')
      },
      {
        path: 'profil',
        name: 'DirekturProfil',
        component: () => import('../pages/karyawan/ProfilPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token && !isTokenExpired(token)

  if (!isAuthenticated && token) {
    localStorage.removeItem('token')
    localStorage.removeItem('token_type')
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next('/karyawan/dashboard')
    return
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  next()
})

export default router
