# AjuanCuti - Sistem Manajemen Cuti

Aplikasi web untuk pengajuan, persetujuan, dan manajemen cuti karyawan. Mendukung approval workflow multi-level (PM → HR → Direktur) dengan fitur rekapitulasi dan kalender cuti.

## Fitur

- **Pengajuan Cuti** — Calendar picker dengan highlight hari libur, multi-date selection (maks 4 hari), dropdown backup person
- **Edit Pengajuan** — Pengajuan yang ditolak bisa diedit melalui halaman Status Pengajuan
- **Approval Workflow** — Multi-level approval dengan stepper progress (PM → HR → Direktur)
- **Multi-PM Approval** — Mendukung persetujuan dari multiple project manager
- **Status Tracking** — Pantau status pengajuan secara real-time dengan detail step
- **Riwayat Cuti** — Histori pengajuan dengan filter tahun dan sortir
- **Log & Rekapitulasi** — Rekap penggunaan cuti per karyawan (HR/Direktur)
- **Jatah Cuti** — Manajemen kuota cuti tahunan karyawan
- **Kalender Cuti** — Kalender visual jadwal cuti pribadi dan tim
- **Pengajuan Tetap Bekerja** — Ajukan untuk tetap bekerja pada hari cuti bersama
- **Profil** — Lihat dan edit profil, ubah password
- **Multi-language** — Dukungan Bahasa Indonesia dan English

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | Vue Router 5 |
| HTTP Client | Axios |
| I18n | vue-i18n |
| Testing | Playwright (E2E) |
| Linting | oxlint |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone <repository-url>
cd manajemen_cuti_amal_solution
npm install
```

### Environment Variables

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=url.ezample
```

### Development

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`. Vite dev server akan proxy request `/api/*` ke backend yang dikonfigurasi di `.env`.

### Build & Preview

```bash
# Build untuk production
npm run build

# Preview hasil build
npm run preview
```

## Project Structure

```
src/
├── components/           # Komponen reusable (Sidebar, ErrorPopup, NetworkBanner)
├── composables/          # Composable functions (useErrorPopup, useCalendarNames)
├── i18n/                 # File terjemahan (id.json, en.json)
├── layouts/              # Layout per role (KaryawanLayout, PmLayout, HrLayout, dst)
├── lib/                  # API client (api.ts — axios instance)
├── pages/                # Halaman aplikasi
│   ├── LoginPage.vue
│   ├── karyawan/         # Dashboard, Pengajuan, Status, Riwayat, Kalender, Profil
│   ├── pm/               # Dashboard, Persetujuan, Rekap Tim, Kalender Tim
│   ├── hr/               # Dashboard, Persetujuan, Log & Rekap, Data Karyawan, Jatah Cuti
│   └── direktur/         # Dashboard, Persetujuan, Log & Rekap, Data Karyawan, Jatah Cuti
├── router/               # Konfigurasi routing (index.ts)
├── services/             # API services (auth, karyawan, hr, pm, direktur, approval)
├── types/                # TypeScript interfaces (index.ts)
├── App.vue
└── main.ts
```

## Roles & Access

| Role | Halaman yang Diakses |
|------|---------------------|
| **Karyawan** | Dashboard, Pengajuan Cuti, Status Pengajuan, Riwayat Cuti, Kalender Cuti, Pengajuan Kerja, Status Pengajuan Kerja, Riwayat Pengajuan Kerja, Profil |
| **PM** | Dashboard, Persetujuan Cuti, Persetujuan Kerja, Rekap Cuti Tim, Rekap Pengajuan Kerja, Kalender Tim, Pengajuan Cuti, Riwayat Cuti, Status Pengajuan, Profil |
| **HR** | Dashboard, Persetujuan Cuti, Persetujuan Kerja, Log & Rekap Cuti, Log & Rekap Kerja, Data Karyawan, Jatah Cuti, Kalender Tim, Pengajuan Cuti, Riwayat Cuti, Status Pengajuan, Profil |
| **Staff HR** | Sama seperti HR |
| **Direktur** | Dashboard, Persetujuan Cuti, Persetujuan Kerja, Log & Rekap Cuti, Log & Rekap Kerja, Data Karyawan, Jatah Cuti, Kalender Tim, Profil |

## Approval Workflow

```
Karyawan → PM → HR → Selesai
PM       → HR → Selesai
Staff HR → HR → Selesai
HR       → Direktur → Selesai
Direktur → Selesai
```

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run lint` | Lint dengan oxlint |
| `npm run preview` | Preview hasil production build |
| `npm run test` | Jalankan Playwright E2E tests |
| `npm run test:ui` | Playwright interactive UI mode |
| `npm run test:report` | Tampilkan Playwright HTML report |

## Testing

```bash
# Jalankan semua tests
npm run test

# Jalankan dengan UI mode (untuk debugging)
npm run test:ui

# Lihat laporan hasil test
npm run test:report
```

Tests menggunakan Playwright dan berada di folder `tests/`. Mock data tersedia di `tests/mocks/handlers.ts`.
