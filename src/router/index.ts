import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import KaryawanLayout from '../layouts/KaryawanLayout.vue'
import DashboardPage from '../pages/karyawan/DashboardPage.vue'
import PengajuanCutiPage from '../pages/karyawan/PengajuanCutiPage.vue'
import StatusPengajuanPage from '../pages/karyawan/StatusPengajuanPage.vue'
import RiwayatCutiPage from '../pages/karyawan/RiwayatCutiPage.vue'
import KalenderCutiPage from '../pages/karyawan/KalenderCutiPage.vue'
import ProfilPage from '../pages/karyawan/ProfilPage.vue'

import PmLayout from '../layouts/PmLayout.vue'
import PmDashboardPage from '../pages/pm/DashboardPage.vue'
import PmPersetujuanPage from '../pages/pm/PersetujuanPage.vue'
import PmRekapCutiTimPage from '../pages/pm/RekapCutiTimPage.vue'
import PmKalenderTimPage from '../pages/pm/KalenderTimPage.vue'

import HrLayout from '../layouts/HrLayout.vue'
import HrDashboardPage from '../pages/hr/DashboardPage.vue'
import HrPersetujuanPage from '../pages/hr/PersetujuanPage.vue'
import HrLogRekapCutiPage from '../pages/hr/LogRekapCutiPage.vue'
import HrDataKaryawanPage from '../pages/hr/DataKaryawanPage.vue'
import HrJatahCutiPage from '../pages/hr/JatahCutiPage.vue'
import HrKalenderLiburPage from '../pages/hr/KalenderLiburPage.vue'

import DirekturLayout from '../layouts/DirekturLayout.vue'
import DirekturDashboardPage from '../pages/direktur/DashboardPage.vue'
import DirekturPersetujuanPage from '../pages/direktur/PersetujuanPage.vue'
import DirekturLogRekapCutiPage from '../pages/direktur/LogRekapCutiPage.vue'
import DirekturDataKaryawanPage from '../pages/direktur/DataKaryawanPage.vue'
import DirekturJatahCutiPage from '../pages/direktur/JatahCutiPage.vue'
import DirekturKalenderLiburPage from '../pages/direktur/KalenderLiburPage.vue'
import DirekturProfilPage from '../pages/direktur/ProfilPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/karyawan',
    component: KaryawanLayout,
    meta: { requiresAuth: true, role: 'karyawan' },
    children: [
      {
        path: '',
        redirect: '/karyawan/dashboard'
      },
      {
        path: 'dashboard',
        name: 'KaryawanDashboard',
        component: DashboardPage
      },
      {
        path: 'pengajuan-cuti',
        name: 'KaryawanPengajuanCuti',
        component: PengajuanCutiPage
      },
      {
        path: 'status-pengajuan',
        name: 'KaryawanStatusPengajuan',
        component: StatusPengajuanPage
      },
      {
        path: 'riwayat-cuti',
        name: 'KaryawanRiwayatCuti',
        component: RiwayatCutiPage
      },
      {
        path: 'kalender-cuti',
        name: 'KaryawanKalenderCuti',
        component: KalenderCutiPage
      },
      {
        path: 'profil',
        name: 'KaryawanProfil',
        component: ProfilPage
      }
    ]
  },
  {
    path: '/pm',
    component: PmLayout,
    meta: { requiresAuth: true, role: 'pm' },
    children: [
      {
        path: '',
        redirect: '/pm/dashboard'
      },
      {
        path: 'dashboard',
        name: 'PmDashboard',
        component: PmDashboardPage
      },
      {
        path: 'persetujuan',
        name: 'PmPersetujuan',
        component: PmPersetujuanPage
      },
      {
        path: 'rekap-cuti-tim',
        name: 'PmRekapCutiTim',
        component: PmRekapCutiTimPage
      },
      {
        path: 'kalender-tim',
        name: 'PmKalenderTim',
        component: PmKalenderTimPage
      },
      {
        path: 'pengajuan-cuti',
        name: 'PmPengajuanCuti',
        component: PengajuanCutiPage
      },
      {
        path: 'riwayat-cuti',
        name: 'PmRiwayatCuti',
        component: RiwayatCutiPage
      },
      {
        path: 'profil',
        name: 'PmProfil',
        component: ProfilPage
      }
    ]
  },
  {
    path: '/hr',
    component: HrLayout,
    meta: { requiresAuth: true, role: 'hr' },
    children: [
      {
        path: '',
        redirect: '/hr/dashboard'
      },
      {
        path: 'dashboard',
        name: 'HrDashboard',
        component: HrDashboardPage
      },
      {
        path: 'persetujuan',
        name: 'HrPersetujuan',
        component: HrPersetujuanPage
      },
      {
        path: 'log-rekap-cuti',
        name: 'HrLogRekapCuti',
        component: HrLogRekapCutiPage
      },
      {
        path: 'data-karyawan',
        name: 'HrDataKaryawan',
        component: HrDataKaryawanPage
      },
      {
        path: 'jatah-cuti',
        name: 'HrJatahCuti',
        component: HrJatahCutiPage
      },
      {
        path: 'kalender-libur',
        name: 'HrKalenderLibur',
        component: HrKalenderLiburPage
      },
      {
        path: 'pengajuan-cuti',
        name: 'HrPengajuanCuti',
        component: PengajuanCutiPage
      },
      {
        path: 'riwayat-cuti',
        name: 'HrRiwayatCuti',
        component: RiwayatCutiPage
      },
      {
        path: 'profil',
        name: 'HrProfil',
        component: ProfilPage
      }
    ]
  },
  {
    path: '/direktur',
    component: DirekturLayout,
    meta: { requiresAuth: true, role: 'direktur' },
    children: [
      {
        path: '',
        redirect: '/direktur/dashboard'
      },
      {
        path: 'dashboard',
        name: 'DirekturDashboard',
        component: DirekturDashboardPage
      },
      {
        path: 'persetujuan',
        name: 'DirekturPersetujuan',
        component: DirekturPersetujuanPage
      },
      {
        path: 'log-rekap-cuti',
        name: 'DirekturLogRekapCuti',
        component: DirekturLogRekapCutiPage
      },
      {
        path: 'data-karyawan',
        name: 'DirekturDataKaryawan',
        component: DirekturDataKaryawanPage
      },
      {
        path: 'jatah-cuti',
        name: 'DirekturJatahCuti',
        component: DirekturJatahCutiPage
      },
      {
        path: 'kalender-libur',
        name: 'DirekturKalenderLibur',
        component: DirekturKalenderLiburPage
      },
      {
        path: 'pengajuan-cuti',
        name: 'DirekturPengajuanCuti',
        component: PengajuanCutiPage
      },
      {
        path: 'riwayat-cuti',
        name: 'DirekturRiwayatCuti',
        component: RiwayatCutiPage
      },
      {
        path: 'profil',
        name: 'DirekturProfil',
        component: DirekturProfilPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

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
