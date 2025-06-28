export const AUTH_URLS = {
 FORGOT_PASSWORD: '/forgot-password',
 RESET_PASSWORD: '/dashboard/account/reset-password',
 SIGN_IN: '/sign-in',
 SIGN_UP: '/sign-up',
 // URL callback Google OAuth Anda yang baru, sesuai dengan backend.
 CALLBACK: 'https://api.neosantara.xyz/magic/0auth/google/callback',
 // Sesuaikan URL CLI Auth jika diperlukan, arahkan ke endpoint backend Anda.
 CLI: 'https://api.neosantara.xyz/magic/0auth/cli',
}

export const PROTECTED_URLS = {
 DASHBOARD: '/dashboard',
 ACCOUNT_SETTINGS: '/dashboard/account',
 NEW_TEAM: '/dashboard/teams/new',
 TEAMS: '/dashboard/teams',
 TEAM: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/team`,
 SANDBOXES: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/sandboxes`,
 TEMPLATES: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/templates`,
 // Halaman 'Usage' dan 'Billing' akan dimodifikasi/dihapus,
 // jadi sesuaikan path ini jika Anda ingin mengarahkannya ke tempat lain.
 USAGE: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/usage`, // Halaman ini akan diubah isinya
 BILLING: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/billing`, // Halaman ini akan diubah isinya
 // 'Budget' dihapus total, jadi tidak ada URL di sini.
 KEYS: (teamIdOrSlug: string) => `/dashboard/${teamIdOrSlug}/keys`,
}

// URL dasar untuk dashboard Anda yang akan di-deploy.
// Pilih salah satu: app.neosantara.xyz atau platform.neosantara.xyz.
export const BASE_URL = process.env.VERCEL_ENV
 ? process.env.VERCEL_ENV === 'production'
   ? `https://app.neosantara.xyz` // Contoh domain produksi Anda
   : `https://platform.neosantara.xyz` // Contoh domain non-produksi/staging Anda
 : 'http://localhost:3000' // Untuk pengembangan lokal