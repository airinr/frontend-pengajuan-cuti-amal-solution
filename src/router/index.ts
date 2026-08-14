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
