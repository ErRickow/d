Edit dengan apl Dokumen
Membuat penyesuaian, memberi komentar, dan berbagi dengan yang lain agar dapat mengedit secara bersamaan.
LAIN KALIGUNAKAN APLIKASI

oke silahkan tulis full perubahannya ke format .i...

Panduan Modifikasi Frontend Dashboard Neosantara AI
Dokumen ini berisi panduan komprehensif untuk memodifikasi frontend dashboard Anda agar sesuai dengan backend Neosantara AI yang telah Anda sediakan. Karena dashboard Anda dibangun dengan Next.js (React/TypeScript), dan Jupyter Notebook (serta Google Colab) pada dasarnya adalah lingkungan untuk Python dan analisis data, Anda tidak dapat menjalankan kode frontend ini langsung di dalam notebook ini.

Notebook ini berfungsi sebagai dokumen instruksi dan referensi kode. Anda perlu:

Membuka repositori frontend dashboard Anda secara lokal (di komputer Anda, bukan di Google Colab).
Menyalin dan menempelkan perubahan kode yang disediakan di bawah ini ke file-file yang sesuai di repositori lokal Anda.
Menjalankan aplikasi Next.js secara lokal setelah semua perubahan diterapkan.
Menggunakan Git secara lokal untuk mendorong perubahan ke GitHub Anda. Integrasi GitHub di Google Colab terutama ditujukan untuk notebook Python.
1. Persiapan Lingkungan dan Variabel
Pastikan Anda memiliki file .env.local di root repositori frontend Anda (atau sistem variabel lingkungan yang setara) dengan konfigurasi berikut. Ubah nilai placeholder (YOUR_...) dengan nilai aktual Anda.

# .env.local

# Supabase (dari proyek E2B Anda jika masih relevan)
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Google OAuth
# Dapatkan ini dari Google Cloud Console Anda
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# URL Callback untuk Google OAuth
# Ini harus sesuai dengan yang dikonfigurasi di Google Cloud Console dan backend Anda.
# Format: YOUR_BACKEND_URL/magic/0auth/google/callback
GOOGLE_CALLBACK_URL="https://api.neosantara.xyz/magic/0auth/google/callback"

# URL Dasar untuk API Backend Neosantara Anda
# Ini adalah domain tempat API Anda di-deploy.
INFRA_API_URL="https://api.neosantara.xyz"

# URL Dasar untuk Autentikasi OAuth
# Ini adalah titik masuk untuk alur OAuth di backend Anda.
# Format: YOUR_BACKEND_URL/magic/0auth
NEXT_PUBLIC_AUTH_URL="https://api.neosantara.xyz/magic/0auth"

# Feature Flags
# Set ini ke false untuk menonaktifkan fitur billing lanjutan yang tidak relevan
NEXT_PUBLIC_INCLUDE_BILLING=false

# Hapus atau kosongkan variabel lingkungan analitik jika tidak digunakan
# NEXT_PUBLIC_POSTHOG_KEY=
# NEXT_PUBLIC_SENTRY_DSN=
# NEXT_PUBLIC_GA_MEASUREMENT_ID=
# ALLOW_SEO_INDEXING=false # Jika Anda tidak ingin dashboard diindeks oleh mesin pencari

2. Penghapusan File dan Direktori
Hapus file dan direktori berikut dari repositori frontend Anda. Anda dapat menggunakan perintah terminal di sistem lokal Anda:

# Hapus direktori dan file dokumentasi internal
rm -rf src/app/_docs/
rm src/styles/docs.css
rm src/configs/docs.ts
rm -rf src/features/docs/
rm src/lib/utils/docs.ts
rm src/ui/docs-code-block.tsx
rm src/ui/docs-tabs.tsx
rm -rf src/content/docs/

# Hapus file konfigurasi analitik & telemetri (jika tidak digunakan)
rm sentry.client.config.ts
rm sentry.edge.config.ts
rm sentry.server.config.ts
# Jika src/instrumentation.ts hanya untuk Sentry, hapus. Jika ada instrumen lain, modifikasi saja.
# rm src/instrumentation.ts
rm src/features/general-analytics-collector.tsx
rm src/features/dashboard/navbar/dashboard-survey-popover.tsx
rm src/features/google-tag-manager.tsx

# Hapus file dan aksi backend billing lama (E2B)
rm src/server/billing/billing-actions.ts
rm src/server/billing/get-billing-limits.ts
rm src/server/billing/get-invoices.ts
rm src/server/usage/get-usage.ts

3. Modifikasi File Utama
Salin dan tempelkan konten lengkap di bawah ini ke file yang sesuai di repositori lokal Anda. Perhatikan komentar dalam Bahasa Indonesia untuk detail perubahan.

3.1. src/configs/urls.ts
Memperbarui URL otentikasi dan URL dasar dashboard.

// src/configs/urls.ts

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

3.2. src/configs/dashboard-navs.ts
Memperbarui tautan navigasi sidebar dashboard.

// src/configs/dashboard-navs.ts
import {
 Activity,
 Box,
 Container,
 CreditCard,
 Key,
 LucideProps,
 UserRoundCog,
 Users,
} from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { INCLUDE_BILLING } from './flags' // Ini akan disetel false secara default

type DashboardNavLinkArgs = {
 teamIdOrSlug?: string
}

export type DashboardNavLink = {
 label: string
 href: (args: DashboardNavLinkArgs) => string
 icon: ForwardRefExoticComponent<
   Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
 >
 group?: string
 goesDeeper?: boolean
}

export const MAIN_DASHBOARD_LINKS: DashboardNavLink[] = [
 {
   label: 'Sandboxes',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/sandboxes`,
   icon: Box,
 },
 {
   label: 'Templates',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/templates`,
   icon: Container,
 },
 // Blok ini dikontrol oleh INCLUDE_BILLING yang akan false, jadi tidak akan muncul.
 ...(INCLUDE_BILLING
   ? [
       {
         label: 'Usage',
         href: (args: DashboardNavLinkArgs) =>
           `/dashboard/${args.teamIdOrSlug}/usage`,
         icon: Activity,
       },
     ]
   : []),
 {
   label: 'Team',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/team`,
   icon: Users,
   group: 'manage',
 },
 {
   label: 'API Keys',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/keys`,
   icon: Key,
   group: 'manage',
 },

 // Blok ini dikontrol oleh INCLUDE_BILLING yang akan false, jadi tidak akan muncul.
 ...(INCLUDE_BILLING
   ? [
       {
         label: 'Billing',
         href: (args: DashboardNavLinkArgs) =>
           `/dashboard/${args.teamIdOrSlug}/billing`,
         icon: CreditCard,
         group: 'expenses',
       },
       // Fitur 'Budget' dihapus total, jadi tidak perlu lagi ada link di sini.
       // {
       //   label: 'Budget',
       //   href: (args: DashboardNavLinkArgs) =>
       //     `/dashboard/${args.teamIdOrSlug}/budget`,
       //   group: 'expenses',
       //   icon: DollarSign,
       // },
     ]
   : []),
]

export const EXTRA_DASHBOARD_LINKS: DashboardNavLink[] = [
 {
   label: 'Account Settings',
   href: (args) => `/dashboard/account`,
   icon: UserRoundCog,
 },
 {
   label: 'Documentation',
   // Ganti dengan URL dokumentasi Neosantara AI Anda yang sudah di-deploy.
   href: () => `https://docs.neosantara.xyz`,
   icon: Book, // Pastikan Anda mengimpor ikon 'Book' dari 'lucide-react' jika menggunakannya.
   group: 'help',
 },
]

export const ALL_DASHBOARD_LINKS = [
 ...MAIN_DASHBOARD_LINKS,
 ...EXTRA_DASHBOARD_LINKS,
]

3.3. src/configs/flags.ts
Mematikan feature flag untuk billing lama.

// src/configs/flags.ts

export const ALLOW_SEO_INDEXING = process.env.ALLOW_SEO_INDEXING === '1'
export const VERBOSE = process.env.NEXT_PUBLIC_VERBOSE === '1'
// Set ini ke 'false' untuk menonaktifkan fitur billing template yang tidak relevan.
export const INCLUDE_BILLING = false // <-- Ubah ini

3.4. src/middleware.ts
Memperbarui logika middleware untuk mencerminkan perubahan rute dan penghapusan fitur.

// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
 getAuthRedirect,
 getUserSession,
 handleTeamResolution,
 isAuthRoute,
 isDashboardRoute,
 resolveTeamForDashboard,
} from './server/middleware'
import { PROTECTED_URLS } from './configs/urls'
import { logError } from './lib/clients/logger'
import { ERROR_CODES } from './configs/logs'
import { getRewriteForPath } from './lib/utils/rewrites'
import { ALLOW_SEO_INDEXING } from './configs/flags'

export async function middleware(request: NextRequest) {
 try {
   // Tangani rewrite route catch-all (tidak perlu diubah jika Anda tidak punya rewrite lain)
   const { config: routeRewriteConfig } = getRewriteForPath(
     request.nextUrl.pathname,
     'route'
   )

   if (routeRewriteConfig) {
     return NextResponse.next({
       request,
     })
   }

   // Tangani rewrite middleware (tidak perlu diubah jika Anda tidak punya rewrite lain)
   const { config: middlewareRewriteConfig } = getRewriteForPath(
     request.nextUrl.pathname,
     'middleware'
   )

   if (middlewareRewriteConfig) {
     const rewriteUrl = new URL(request.url)
     rewriteUrl.hostname = middlewareRewriteConfig.domain
     rewriteUrl.protocol = 'https'
     rewriteUrl.port = ''

     const headers = new Headers(request.headers)

     if (ALLOW_SEO_INDEXING) {
       headers.set('x-e2b-should-index', '1')
     }

     return NextResponse.rewrite(rewriteUrl, {
       request: {
         headers,
       },
     })
   }

   const response = NextResponse.next({
     request,
   })

   // Inisialisasi klien Supabase
   const supabase = createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       cookies: {
         getAll() {
           return request.cookies.getAll()
         },
         setAll(cookiesToSet) {
           cookiesToSet.forEach(({ name, value, options }) => {
             response.cookies.set(name, value, options)
           })
         },
       },
     }
   )

   // Alihkan ke dashboard jika pengguna sudah login dan berada di rute autentikasi
   if (
     isAuthRoute(request.nextUrl.pathname) &&
     (await supabase.auth.getSession()).data.session
   ) {
     return NextResponse.redirect(
       new URL(PROTECTED_URLS.DASHBOARD, request.url)
     )
   }

   // Perbarui sesi dan tangani pengalihan autentikasi
   const { error, data } = await getUserSession(supabase)

   // Tangani pengalihan autentikasi
   const authRedirect = getAuthRedirect(request, !error)
   if (authRedirect) return authRedirect

   // Kembali lebih awal untuk rute non-dashboard atau jika tidak ada pengguna
   if (!data?.user || !isDashboardRoute(request.nextUrl.pathname)) {
     return response
   }

   // Tangani resolusi tim untuk semua rute dashboard
   const teamResult = await resolveTeamForDashboard(request, data.user.id)

   // Proses hasil resolusi tim
   return handleTeamResolution(request, response, teamResult)
 } catch (error) {
   logError(ERROR_CODES.MIDDLEWARE, error)
   // Kembalikan respons dasar untuk menghindari loop tak terbatas
   return NextResponse.next({
     request,
   })
 }
}

export const config = {
 matcher: [
   /*
    * Cocokkan semua jalur permintaan kecuali:
    * - _next/static (file statis)
    * - _next/image (file optimasi gambar)
    * - favicon.ico (file favicon)
    * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
    * - api routes
    * - Hapus semua rute yang terkait dengan analitik (vercel, sentry, posthog)
    * karena Anda tidak ingin menggunakannya lagi.
    */
   '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|_vercel/|monitoring|ingest/).*)',
 ],
}

3.5. src/app/dashboard/route.ts
Memperbarui pemetaan URL tab dashboard.

// src/app/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PROTECTED_URLS } from '@/configs/urls'
import { cookies } from 'next/headers'
import { COOKIE_KEYS } from '@/configs/keys'
import { supabaseAdmin } from '@/lib/clients/supabase/admin'
import { createRouteClient } from '@/lib/clients/supabase/server'

// Peta URL tab. Sesuaikan dengan halaman yang ingin Anda pertahankan.
// 'usage' sekarang akan mengarah ke 'keys' atau halaman yang menampilkan penggunaan dari API Key.
// 'billing' akan mengarah ke 'account' karena halaman billing telah disederhanakan/dihapus.
const TAB_URL_MAP: Record<string, (teamId: string) => string> = {
 sandboxes: (teamId) => PROTECTED_URLS.SANDBOXES(teamId),
 templates: (teamId) => PROTECTED_URLS.TEMPLATES(teamId),
 // Mengarahkan 'usage' ke 'keys' karena penggunaan akan ditampilkan dari metadata API Key.
 usage: (teamId) => PROTECTED_URLS.KEYS(teamId),
 // Mengarahkan 'billing' ke 'account' karena halaman billing telah disederhanakan/dihapus.
 billing: (teamId) => PROTECTED_URLS.ACCOUNT_SETTINGS,
 // 'budget' telah dihapus sepenuhnya, jadi tidak perlu ada di peta ini.
 keys: (teamId) => PROTECTED_URLS.KEYS(teamId),
 team: (teamId) => PROTECTED_URLS.TEAM(teamId),
 account: (_) => PROTECTED_URLS.ACCOUNT_SETTINGS,
 personal: (_) => PROTECTED_URLS.ACCOUNT_SETTINGS,
}

export async function GET(request: NextRequest) {
 // 1. Dapatkan parameter tab dari URL
 const searchParams = request.nextUrl.searchParams
 const tab = searchParams.get('tab')

 // Default ke dashboard jika tidak ada tab yang valid atau tab tidak ada di peta.
 if (!tab || !TAB_URL_MAP[tab]) {
   return NextResponse.redirect(new URL(PROTECTED_URLS.DASHBOARD, request.url))
 }

 // 2. Buat klien Supabase dan dapatkan pengguna yang diautentikasi.
 const supabase = createRouteClient(request)

 const { data, error } = await supabase.auth.getUser()

 // Alihkan ke halaman sign-in jika pengguna tidak diautentikasi.
 if (error || !data.user) {
   return NextResponse.redirect(new URL('/sign-in', request.url))
 }
 const cookieStore = await cookies()

 // 3. Resolusi ID tim (pertama coba dari cookie, lalu ambil tim default dari database).
 let teamId = cookieStore.get(COOKIE_KEYS.SELECTED_TEAM_ID)?.value
 let teamSlug = cookieStore.get(COOKIE_KEYS.SELECTED_TEAM_SLUG)?.value

 if (!teamId) {
   // Tidak ada tim di cookie, ambil tim default pengguna.
   const { data: teamsData } = await supabaseAdmin
     .from('users_teams')
     .select(
       `
       team_id,
       is_default,
       team:teams(*)
     `
     )
     .eq('user_id', data.user.id)

   if (!teamsData?.length) {
     // Tidak ada tim sama sekali untuk pengguna, alihkan ke halaman pembuatan tim baru.
     return NextResponse.redirect(
       new URL(PROTECTED_URLS.NEW_TEAM, request.url)
     )
   }

   // Gunakan tim default atau tim pertama jika tidak ada yang default.
   const defaultTeam = teamsData.find((t) => t.is_default) || teamsData[0]!
   teamId = defaultTeam.team_id
   teamSlug = defaultTeam.team?.slug || defaultTeam.team_id
 }

 // 4. Bangun URL pengalihan menggunakan pemetaan tab yang telah diperbarui.
 const urlGenerator = TAB_URL_MAP[tab]
 const redirectPath = urlGenerator(teamSlug || teamId)

 // 5. Alihkan ke bagian dashboard yang sesuai.
 return NextResponse.redirect(new URL(redirectPath, request.url))
}

3.6. src/app/dashboard/[teamIdOrSlug]/usage/page.tsx
Halaman "Usage" akan sepenuhnya didesain ulang untuk menampilkan ringkasan penggunaan dari metadata API key.

// src/app/dashboard/[teamIdOrSlug]/usage/page.tsx

import DashboardPageLayout from '@/features/dashboard/page-layout'
import { CardDescription, CardTitle } from '@/ui/primitives/card'
import { resolveTeamIdInServerComponent } from '@/lib/utils/server'
import { getTeamApiKeys } from '@/server/keys/get-api-keys' // Mengambil API Keys tim
import { Suspense } from 'react'
import { Loader } from '@/ui/loader'
import { UserAccessToken } from '@/features/dashboard/account/user-access-token' // Untuk menampilkan token akses pribadi

// Komponen untuk menampilkan detail penggunaan dari metadata API key
async function UsageSummaryContent({ teamId }: { teamId: string }) {
 // Ambil semua API Keys tim untuk mendapatkan data penggunaan agregat.
 // getTeamApiKeys sekarang akan mengembalikan data penggunaan yang relevan
 // sesuai dengan respons dari backend Anda.
 const result = await getTeamApiKeys({ teamId })

 if (!result?.data || result.serverError || result.validationErrors) {
   return <p className="text-error">Failed to load usage data.</p>
 }

 const { apiKeys } = result.data;

 // Hitung total penggunaan dari semua API Key.
 // Asumsi: tier dan usage info ada di metadata setiap API key (dari backend API response).
 // Anda perlu memastikan backend /api/keys mengembalikan struktur ini.
 let totalDailyUsage = 0;
 let totalMonthlyUsage = 0;
 let dailyLimit = 0;
 let monthlyLimit = 0;
 let dailyReset = '';
 let monthlyReset = '';
 let tierName = 'Unknown';

 apiKeys.forEach(key => {
   // Sesuaikan path jika struktur respons API Key Anda berbeda.
   // Misal: key.usage.daily.current
   if (key.usage) {
       totalDailyUsage += key.usage.daily.current;
       totalMonthlyUsage += key.usage.monthly.current;
       // Ambil limit dari salah satu kunci (asumsi limit sama untuk tier yang sama).
       if (dailyLimit === 0) dailyLimit = key.usage.daily.limit;
       if (monthlyLimit === 0) monthlyLimit = key.usage.monthly.limit;
       if (!dailyReset) dailyReset = key.usage.daily.reset_date;
       if (!monthlyReset) monthlyReset = key.usage.monthly.reset_date;
       if (tierName === 'Unknown') tierName = key.tier; // Asumsi 'tier' ada di objek key
   }
 });

 return (
   <div className="grid gap-4">
     <CardTitle className="font-mono">Ringkasan Penggunaan Saat Ini</CardTitle>
     <CardDescription>
       Ringkasan penggunaan API tim Anda berdasarkan kunci API aktif.
     </CardDescription>

     <div className="flex flex-col gap-2">
       <p className="font-mono text-sm">
         Tier: <span className="text-accent">{tierName}</span>
       </p>
       <p className="font-mono text-sm">
         Penggunaan Harian: <span className="text-accent">{totalDailyUsage.toLocaleString()} / {dailyLimit.toLocaleString()} token</span>
         <span className="text-fg-500 text-xs ml-2">(Reset: {dailyReset})</span>
       </p>
       <p className="font-mono text-sm">
         Penggunaan Bulanan: <span className="text-accent">{totalMonthlyUsage.toLocaleString()} / {monthlyLimit.toLocaleString()} token</span>
         <span className="text-fg-500 text-xs ml-2">(Reset: {monthlyReset})</span>
       </p>
     </div>

     <h3 className="font-mono text-base mt-4">Penggunaan Token Akses Pribadi</h3>
     <CardDescription>
       Penggunaan yang terkait dengan token akses pribadi Anda (biasanya dari login langsung).
     </CardDescription>
     {/* Menggunakan Suspense untuk memuat UserAccessToken secara asinkron */}
     <Suspense fallback={<Loader className="text-xl" />}>
       {/* Anda mungkin perlu memodifikasi UserAccessToken jika perlu menampilkan detail penggunaan khusus di sini */}
       <UserAccessToken className="max-w-md" />
     </Suspense>
   </div>
 )
}

export default async function UsagePage({
 params,
}: {
 params: Promise<{ teamIdOrSlug: string }>
}) {
 const { teamIdOrSlug } = await params
 // Memastikan teamId dapat di-resolve dari slug atau ID.
 const teamId = await resolveTeamIdInServerComponent(teamIdOrSlug)

 return (
   <DashboardPageLayout
     title="Penggunaan"
     className="relative grid max-h-full w-full grid-cols-1 self-start p-4 sm:p-6"
   >
     {/* Menggunakan Suspense untuk memuat konten penggunaan */}
     <Suspense fallback={<Loader className="text-xl" />}>
       <UsageSummaryContent teamId={teamId} />
     </Suspense>
   </DashboardPageLayout>
 )
}

3.7. src/app/dashboard/[teamIdOrSlug]/billing/page.tsx
Halaman "Billing" akan diubah total untuk menampilkan informasi pricing tier Anda.

// src/app/dashboard/[teamIdOrSlug]/billing/page.tsx

import { CardDescription, CardTitle } from '@/ui/primitives/card'
import BillingTierCard from '@/features/dashboard/billing/tier-card'
import { Suspense } from 'react'
import DashboardPageLayout from '@/features/dashboard/page-layout'
import { resolveTeamIdInServerComponent } from '@/lib/utils/server'

// Data Tier Neosantara AI.
// Anda dapat:
// 1. Hardcode ini seperti di bawah (paling mudah untuk demo).
// 2. Membuat endpoint baru di backend Anda (misal: GET /v1/tiers)
//    yang mengembalikan data ini, lalu fetch di sini.
const NEOSANTARA_TIERS = [
 {
   id: 'Free',
   name: 'Free',
   rpm: 10, // Requests Per Minute
   rpd: 100, // Requests Per Day (tidak langsung dari Upstash, untuk referensi)
   tpm: 10000, // Tokens Per Minute
   tpd: 50000, // Tokens Per Day (tidak langsung dari Upstash, untuk referensi)
   prose: [ // Deskripsi singkat manfaat tier Anda
     '10 permintaan/menit',
     '50.000 token/bulan',
     'Dukungan Komunitas',
   ],
 },
 {
   id: 'Basic',
   name: 'Basic',
   rpm: 50,
   rpd: 500,
   tpm: 100000,
   tpd: 500000,
   prose: [
     '50 permintaan/menit',
     '500.000 token/bulan',
     'Dukungan Email',
   ],
 },
 {
   id: 'Standard',
   name: 'Standard',
   rpm: 60,
   rpd: 2000,
   tpm: 100000,
   tpd: 1000000,
   prose: [
     '60 permintaan/menit',
     '1.000.000 token/bulan',
     'Dukungan Email Prioritas',
   ],
 },
 {
   id: 'Pro',
   name: 'Pro',
   rpm: 120,
   rpd: 10000,
   tpm: 200000,
   tpd: 5000000,
   prose: [
     '120 permintaan/menit',
     '5.000.000 token/bulan',
     'Dukungan Langsung 24/7',
     'Fitur Eksklusif',
   ],
 },
 {
   id: 'Enterprise',
   name: 'Enterprise',
   rpm: 200,
   rpd: 50000,
   tpm: 500000,
   tpd: 10000000,
   prose: [
     '200+ permintaan/menit',
     '10.000.000+ token/bulan',
     'Dukungan Kustom',
     'SLA & Fitur Unggulan',
   ],
 },
];


export default async function BillingPage({
 params,
}: {
 params: Promise<{ teamIdOrSlug: string }>
}) {
 const { teamIdOrSlug } = await params
 const teamId = await resolveTeamIdInServerComponent(teamIdOrSlug) // Masih perlu untuk konteks tim

 return (
   <DashboardPageLayout
     title="Paket Harga" // Mengubah judul halaman menjadi "Pricing Plans"
     className="grid h-full w-full gap-4 self-start p-4 sm:gap-6 sm:p-6"
   >
     {/* Bagian Pilihan Paket */}
     <section className="col-span-1 grid gap-4 xl:col-span-12">
       <div className="flex flex-col gap-1">
         <CardTitle>Pilih Paket Anda</CardTitle>
         <CardDescription>
           Pilih paket yang paling sesuai dengan kebutuhan Anda.
         </CardDescription>
       </div>

       <div className="mt-3 flex flex-col gap-12 overflow-x-auto max-lg:mb-6 lg:flex-row">
         {NEOSANTARA_TIERS.map((tier) => ( // Iterasi melalui tier yang didefinisikan di atas
           <BillingTierCard
             key={tier.id}
             tier={tier} // Meneruskan objek tier
             isHighlighted={tier.id === 'Standard'} // Contoh: menyorot tier "Standard"
             className="min-w-[280px] shadow-xl lg:w-1/2 xl:min-w-0"
           />
         ))}
       </div>
     </section>

     {/* Bagian Riwayat Penagihan (Billing History Section) - HAPUS TOTAL */}
     {/* Jika Anda memutuskan untuk menambahkan riwayat penagihan di masa depan,
         Anda bisa menambahkannya kembali di sini dengan implementasi yang sesuai
         dengan backend Neosantara AI Anda. */}
     {/* <section className="col-span-1 mt-8 grid gap-4 xl:col-span-12">
       <div className="flex flex-col gap-1">
         <CardTitle>Riwayat Penagihan</CardTitle>
         <CardDescription>
           Lihat riwayat penagihan dan faktur tim Anda.
         </CardDescription>
       </div>
       <div className="w-full overflow-x-auto">
         <BillingInvoicesTable teamId={teamId} />
       </div>
     </section> */}
   </DashboardPageLayout>
 )
}

3.8. src/features/dashboard/billing/tier-card.tsx
Memodifikasi komponen kartu tier untuk menghapus fungsionalitas checkout E2B.

// src/features/dashboard/billing/tier-card.tsx
'use client'

import { Button } from '@/ui/primitives/button'
// Hapus import Tier dari '@/configs/tiers' karena kita menggunakan definisi kustom.
// import { Tier } from '@/configs/tiers'
import { useSelectedTeam } from '@/lib/hooks/use-teams'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/primitives/badge'
// Hapus import useAction dan toast-related imports karena tidak ada lagi proses checkout.
// import { useAction } from 'next-safe-action/hooks'
// import { defaultErrorToast } from '@/lib/hooks/use-toast'
// import { toast } from '@/ui/primitives/toast'

// Definisikan tipe Tier yang sesuai dengan data NEOSANTARA_TIERS di billing/page.tsx
interface NeosantaraTier {
 id: string;
 name: string;
 rpm: number;
 rpd: number;
 tpm: number;
 tpd: number;
 prose: string[];
}

interface BillingTierCardProps {
 tier: NeosantaraTier; // Menggunakan tipe NeosantaraTier
 isHighlighted?: boolean
 className?: string
}

const BillingTierCard = forwardRef<HTMLDivElement, BillingTierCardProps>(
 ({ tier, isHighlighted = false, className }, ref) => {
   const team = useSelectedTeam() // Masih perlu untuk menentukan tier tim saat ini

   // Logika useAction dan redirectToCheckout sekarang dihapus.
   // const { execute: redirectToCheckout, status } = useAction(...)

   // Pengecekan apakah tier ini adalah tier yang sedang aktif oleh tim.
   // Asumsi 'team.tier' akan berisi nama tier (e.g., 'Free', 'Basic').
   const isSelected = team?.tier === tier.id

   // 'isPending' tidak diperlukan lagi karena tidak ada aksi yang tertunda.
   // const isPending = status === 'executing'

   // 'handleRedirectToCheckout' tidak diperlukan lagi.
   // const handleRedirectToCheckout = () => { ... }

   return (
     <div
       ref={ref}
       className={cn(
         'from-bg bg-bg flex h-full flex-col border p-5',
         isHighlighted ? 'border-accent-200' : 'border-border', // Tambahkan border highlight jika diinginkan
         className
       )}
     >
       <div className="mb-3 flex items-center justify-between">
         <h5 className="text-lg font-semibold">{tier.name}</h5>
         {isSelected && <Badge variant="accent"> Paket Anda {'<<'} </Badge>}
       </div>
       <ul className="mb-4 space-y-1 pl-4">
         {tier.prose.map((prose, i) => (
           <li
             className="text-fg-500 marker:text-accent-200 pl-2 font-sans text-xs marker:content-['▪']"
             key={`tier-${tier.id}-prose-${i}`}
           >
             {prose}
           </li>
         ))}
       </ul>
       {/* Tombol "Select Plan" atau "Upgrade" diubah/disesuaikan. */}
       {isSelected === false ? (
         <Button
           variant={isHighlighted ? 'default' : 'outline'}
           className="mt-4 w-full rounded-none"
           size="lg"
           // loading={isPending} // Hapus jika tidak ada isPending
           onClick={() => {
             // Aksi saat tombol diklik.
             // Bisa menampilkan modal kontak, mengarahkan ke halaman kontak, dll.
             alert(`Hubungi kami untuk opsi upgrade ke paket ${tier.name}!`)
           }}
         >
           Hubungi untuk Upgrade
         </Button>
       ) : (
         <Button variant="outline" className="mt-4 w-full rounded-none" size="lg" disabled>
           Paket Saat Ini
         </Button>
       )}
     </div>
   )
 }
)

BillingTierCard.displayName = 'BillingTierCard'

export default BillingTierCard

3.9. src/types/billing.d.ts
Menyederhanakan definisi tipe data billing.

// src/types/billing.d.ts
// Tipe ini sangat disederhanakan karena sebagian besar fitur billing E2B dihapus.
// Sesuaikan dengan struktur data yang benar-benar Anda gunakan di frontend.

// Jika Anda memiliki konsep invoice/tagihan di masa depan, tambahkan tipenya di sini.
interface Invoice {
 // id: string;
 // amount: number;
 // date: string;
 // status: 'paid' | 'pending' | 'failed';
 // url: string;
}

interface BillingLimit {
 // Jika Anda memiliki limit spesifik yang diambil terpisah, definisikan di sini.
}

interface CustomerPortalResponse {
 // Jika Anda memiliki portal pelanggan (misalnya Stripe) yang akan diintegrasikan, definisikan tipenya.
}

// Sesuaikan UsageResponse agar sesuai dengan metadata API key Anda
// Ini adalah struktur yang mungkin Anda dapatkan dari /v1/auth/key atau /api/keys
interface UsageResponse {
 credits?: number; // Jika ada sistem kredit
 dailyUsage?: {
   current: number;
   limit: number;
   remaining: number;
   reset_date: string;
 };
 monthlyUsage?: {
   current: number;
   limit: number;
   remaining: number;
   reset_date: string;
 };
 // Tambahkan properti lain yang relevan dari metadata API key Anda.
}

interface CreateTeamsResponse {
 id: string
 slug: string
}

export type {
 Invoice,
 BillingLimit,
 CustomerPortalResponse,
 CreateTeamsResponse,
 UsageResponse
}

3.10. src/types/dashboard.types.ts
Memperbarui tipe ClientTeam.

// src/types/dashboard.types.ts
import { Database } from './database.types'

export type ClientTeam = Database['public']['Tables']['teams']['Row'] & {
 is_default?: boolean
 // Menyediakan nama yang diubah untuk tim default
 // e.g. "max.mustermann@gmail.com" -> "Tim Max.mustermann"
 transformed_default_name?: string;
 // Tambahkan 'tier' ke sini agar dapat diakses dari objek tim di frontend.
 // Asumsi ini akan diambil dari database atau metadata API key.
 tier?: string;
}

export type PollingInterval = 0 | 15 | 30 | 60 // detik

3.11. src/features/dashboard/team/danger-zone.tsx
Menyederhanakan logika "Danger Zone" tim.

// src/features/dashboard/team/danger-zone.tsx
import { getTeam } from '@/server/team/get-team'
import { AlertDialog } from '@/ui/alert-dialog'
import ErrorBoundary from '@/ui/error'
import { Button } from '@/ui/primitives/button'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from '@/ui/primitives/card'
// Hapus import useAction, leaveTeamAction, deleteTeamAction jika tidak ada aksi backend yang sesuai
// import { useAction } from 'next-safe-action/hooks'
// import { leaveTeamAction, deleteTeamAction } from '@/server/team/team-actions'
// import { toast } from '@/ui/primitives/toast'
// import { defaultErrorToast } from '@/lib/hooks/use-toast'
// import { useRouter } from 'next/navigation'
// import { PROTECTED_URLS } from '@/configs/urls'


interface DangerZoneProps {
 teamId: string
}

export function DangerZone({ teamId }: DangerZoneProps) {
 return (
   <Card>
     <CardHeader>
       <CardTitle>Zona Bahaya</CardTitle>
       <CardDescription>
         Tindakan di sini tidak dapat dibatalkan. Harap lanjutkan dengan hati-hati.
       </CardDescription>
     </CardHeader>
     <CardContent className="flex flex-col gap-4">
       {/* Menggunakan Suspense untuk memuat konten asinkron */}
       <Suspense fallback={<div>Loading danger zone options...</div>}>
         <DangerZoneContent teamId={teamId} />
       </Suspense>
     </CardContent>
   </Card>
 )
}

async function DangerZoneContent({ teamId }: { teamId: string }) {
 // Dapatkan detail tim
 const res = await getTeam({ teamId })

 if (!res?.data || res.serverError || res.validationErrors) {
   return (
     <ErrorBoundary
       error={
         {
           name: 'Team Error',
           message: res?.serverError || 'Unknown error',
         } satisfies Error
       }
       description={'Could not load team'}
     />
   )
 }

 const team = res.data

 // Hapus useAction hooks untuk aksi tim jika Anda tidak akan mengimplementasikannya
 // const { execute: leaveTeam, status: leaveTeamStatus } = useAction(leaveTeamAction, { ... });
 // const { execute: deleteTeam, status: deleteTeamStatus } = useAction(deleteTeamAction, { ... });
 // const router = useRouter();

 // Logika untuk meninggalkan tim. Ini adalah placeholder.
 const handleLeaveTeam = () => {
   // Implementasi logika Leave Team di sini.
   // Misalnya, panggil aksi backend Anda jika ada, atau tampilkan konfirmasi.
   alert('Logika untuk meninggalkan tim akan diimplementasikan di sini.');
   // Contoh: leaveTeam({ teamId });
 };

 // Logika untuk menghapus tim. Ini adalah placeholder.
 const handleDeleteTeam = () => {
   // Implementasi logika Delete Team di sini.
   // Misalnya, panggil aksi backend Anda jika ada, atau tampilkan konfirmasi.
   alert('Logika untuk menghapus tim akan diimplementasikan di sini.');
   // Contoh: deleteTeam({ teamId });
 };

 return (
   <>
     <div className="flex items-center justify-between p-4">
       <div className="flex flex-col gap-1">
         <h4 className="font-medium">Tinggalkan Tim</h4>
         <p className="text-fg-500 font-sans text-sm">
           Hapus diri Anda dari Tim ini.
         </p>
       </div>

       <AlertDialog
         title="Tinggalkan Tim"
         description="Apakah Anda yakin ingin meninggalkan tim ini?"
         confirm="Tinggalkan"
         onConfirm={handleLeaveTeam} // Panggil fungsi placeholder
         trigger={
           // Tombol nonaktif jika tim default atau kondisi lainnya.
           <Button variant="muted" disabled={!team || team?.is_default}>
             Tinggalkan Tim
           </Button>
         }
       />
     </div>

     <div className="flex items-center justify-between p-4">
       <div className="flex flex-col gap-1">
         <h4 className="text-fg font-medium">Hapus Tim</h4>
         <p className="text-fg-500 font-sans text-sm">
           Hapus tim ini dan semua datanya secara permanen.
         </p>
       </div>
       <AlertDialog
         title="Hapus Tim"
         description="Apakah Anda yakin ingin menghapus tim ini secara permanen? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang."
         confirm="Hapus"
         onConfirm={handleDeleteTeam} // Panggil fungsi placeholder
         trigger={
           <Button variant="error">Hapus Tim</Button>
         }
       />
     </div>
   </>
 )
}

3.12. src/features/dashboard/sidebar/footer.tsx
Memperbarui tautan di sidebar footer.

// src/features/dashboard/sidebar/footer.tsx
import ExternalIcon from '@/ui/external-icon'
import {
 SidebarFooter,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
} from '@/ui/primitives/sidebar'
import { Book, Github } from 'lucide-react' // Mengimpor ikon yang diperlukan
import Link from 'next/link'
import TeamBlockageAlert from './blocked-banner'

export default function DashboardSidebarFooter() {
 return (
   <SidebarFooter>
     <SidebarMenu>
       <TeamBlockageAlert className="mb-2" />
       <SidebarMenuItem key="github">
         <SidebarMenuButton asChild tooltip="GitHub">
           {/* Ganti dengan URL repositori GitHub Neosantara AI Anda */}
           <Link href="https://github.com/your-neosantara-repo" target="_blank" rel="noopener noreferrer">
             <Github className="text-fg-500 size-4" />
             GitHub
             <ExternalIcon className="ml-auto size-4" />
           </Link>
         </SidebarMenuButton>
       </SidebarMenuItem>
       <SidebarMenuItem key="docs">
         <SidebarMenuButton asChild tooltip="Documentation">
           {/* Ganti dengan URL dokumentasi Neosantara AI Anda yang sudah di-deploy */}
           <Link href="https://docs.neosantara.xyz" target="_blank" rel="noopener noreferrer">
             <Book className="text-fg-500 size-4" />
             Documentation
             <ExternalIcon className="ml-auto size-4" />
           </Link>
         </SidebarMenuButton>
       </SidebarMenuItem>
     </SidebarMenu>
   </SidebarFooter>
 )
}

3.13. src/features/client-providers.tsx
Menghapus penyedia analitik pihak ketiga (PostHog).

// src/features/client-providers.tsx
'use client'

// Hapus import posthog dan PHProvider jika tidak menggunakan PostHog
// import posthog from 'posthog-js'
// import { PostHogProvider as PHProvider } from 'posthog-js/react'

import { RootProvider } from 'fumadocs-ui/provider'
import { TooltipProvider } from '@/ui/primitives/tooltip'
import { ToastProvider } from '@/ui/primitives/toast'

interface ClientProvidersProps {
 children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
 return (
   // Hapus PHProvider jika tidak menggunakan PostHog
   // <PostHogProvider>
     <RootProvider
       theme={{
         attribute: 'class',
         defaultTheme: 'system',
         enableSystem: true,
         disableTransitionOnChange: true,
       }}
     >
       <TooltipProvider>
         <ToastProvider>{children}</ToastProvider>
       </TooltipProvider>
     </RootProvider>
   // </PostHogProvider>
 )
}

// Hapus fungsi ini jika tidak menggunakan PostHog
// export function PostHogProvider({ children }: { children: React.ReactNode }) {
//   React.useEffect(() => {
//     if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
//       return
//     }

//     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
//       api_host: '/ingest',
//       ui_host: 'https://us.posthog.com',
//       disable_session_recording: process.env.NODE_ENV !== 'production',
//       advanced_disable_toolbar_metrics: true,
//       opt_in_site_apps: true,
//       loaded: (posthog) => {
//         if (process.env.NODE_ENV === 'development') posthog.debug()
//       },
//     })
//   }, [])

//   return <PHProvider client={posthog}>{children}</PHProvider>
// }

3.14. src/app/layout.tsx
Membersihkan root layout dari komponen analitik.

// src/app/layout.tsx

import '@/app/fonts'
import '@/styles/globals.css'

import { Body } from './layout.client'
import { BASE_URL } from '@/configs/urls'
import { Metadata } from 'next/types'
import { METADATA } from '@/configs/metadata'
import ClientProviders from '@/features/client-providers'
import { Suspense } from 'react'
// Hapus GeneralAnalyticsCollector jika tidak digunakan
// import { GeneralAnalyticsCollector } from '@/features/general-analytics-collector'
import { Toaster } from '@/ui/primitives/toaster'
import Head from 'next/head'
// Hapus GTMHead jika tidak menggunakan Google Tag Manager
// import { GTMHead } from '@/features/google-tag-manager'
// Hapus Analytics jika tidak menggunakan Vercel Analytics
// import { Analytics } from '@vercel/analytics/next'
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

export const metadata: Metadata = {
 metadataBase: new URL(BASE_URL),
 title: {
   template: '%s - Neosantara AI', // Mengubah judul template
   default: METADATA.title,
 },
 description: METADATA.description,
 twitter: {
   title: METADATA.title,
   description: METADATA.description,
 },
 openGraph: {
   title: METADATA.title,
   description: METADATA.description,
 },
 robots: ALLOW_SEO_INDEXING ? 'index, follow' : 'noindex, nofollow',
}

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
   <html lang="en" suppressHydrationWarning>
     <Head>
       {/* Hapus GTMHead jika tidak digunakan */}
       {/* <GTMHead /> */}
     </Head>
     <Body>
       <ClientProviders>
         {children}
         <Suspense>
           {/* Hapus GeneralAnalyticsCollector jika tidak digunakan */}
           {/* <GeneralAnalyticsCollector /> */}
           {/* Hapus DashboardSurveyPopover jika tidak digunakan */}
           {/* <DashboardSurveyPopover /> */}
           <Toaster />
         </Suspense>
       </ClientProviders>
       {/* Hapus Analytics jika tidak digunakan */}
       {/* <Analytics /> */}
     </Body>
   </html>
 )
}

3.15. src/app/layout.client.tsx
Membersihkan client-side layout dari script analitik.

// src/app/layout.client.tsx
// Hapus import GTMBody jika tidak digunakan
// import { GTMBody } from '@/features/google-tag-manager'
import { cn } from '@/lib/utils'
import { useParams } from 'next/navigation'
import Script from 'next/script'
import { type ReactNode } from 'react'

export function Body({
 children,
}: {
 children: ReactNode
}): React.ReactElement<unknown> {
 const mode = useMode()

 return (
   <body className={cn(mode, 'relative flex min-h-[100svh] flex-col')}>
     {/* Hapus Script ini jika NEXT_PUBLIC_SCAN tidak digunakan */}
     {process.env.NEXT_PUBLIC_SCAN && process.env.NEXT_PUBLIC_SCAN === '1' && (
       <Script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
     )}
     {/* Hapus GTMBody jika tidak digunakan */}
     {/* <GTMBody /> */}
     {children}
   </body>
 )
}

export function useMode(): string | undefined {
 const { slug } = useParams()
 return Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined
}

3.16. src/server/auth/auth-actions.ts
Memperbarui URL redirectTo untuk Google OAuth dan memastikan aksi autentikasi email/password tetap ada.

// src/server/auth/auth-actions.ts
'use server'

import { encodedRedirect } from '@/lib/utils/auth'
import { createClient } from '@/lib/clients/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Provider } from '@supabase/supabase-js'
import { AUTH_URLS, PROTECTED_URLS } from '@/configs/urls'
import { actionClient } from '@/lib/clients/action'
import { returnServerError } from '@/lib/utils/action'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import {
 shouldWarnAboutAlternateEmail,
 validateEmail,
} from '@/server/auth/validate-email'

export const signInWithOAuthAction = actionClient
 .schema(
   z.object({
     provider: z.string() as unknown as z.ZodType<Provider>,
     returnTo: z.string().optional(),
   })
 )
 .metadata({ actionName: 'signInWithOAuth' })
 .action(async ({ parsedInput, ctx }) => {
   const { provider, returnTo } = parsedInput

   const supabase = await createClient()

   const origin = (await headers()).get('origin')

   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: provider,
     options: {
       // Ini adalah URL callback lengkap untuk Google OAuth di backend Neosantara AI Anda.
       // Frontend akan mengarahkan ke sini setelah otorisasi di Google.
       redirectTo: `${AUTH_URLS.CALLBACK}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
       scopes: 'email', // Sesuaikan scope jika Anda memerlukan lebih banyak dari Google (mis. 'profile')
     },
   })

   if (error) {
     const queryParams = returnTo ? { returnTo } : undefined
     throw encodedRedirect(
       'error',
       AUTH_URLS.SIGN_IN,
       error.message,
       queryParams
     )
   }

   if (data.url) {
     // Jika Supabase mengembalikan URL, redirect pengguna ke URL tersebut
     redirect(data.url)
   }

   // Fallback jika tidak ada URL yang dikembalikan (jarang terjadi)
   throw encodedRedirect(
     'error',
     AUTH_URLS.SIGN_IN,
     'Ada yang salah saat mencoba login OAuth.',
     returnTo ? { returnTo } : undefined
   )
 })

// signUpAction: Biarkan kode ini tidak berubah karena Anda ingin mempertahankan fungsionalitas register email.
const signUpSchema = zfd
 .formData({
   email: zfd.text(z.string().email('Valid email is required')),
   password: zfd.text(
     z.string().min(8, 'Password must be at least 8 characters')
   ),
   confirmPassword: zfd.text(),
   returnTo: zfd.text(z.string().optional()),
 })
 .refine((data) => data.password === data.confirmPassword, {
   path: ['confirmPassword'],
   message: 'Passwords do not match',
 })

export const signUpAction = actionClient
 .schema(signUpSchema)
 .metadata({ actionName: 'signUp' })
 .action(async ({ parsedInput }) => {
   const { email, password, confirmPassword, returnTo = '' } = parsedInput
   const supabase = await createClient()
   const origin = (await headers()).get('origin') || ''

   // Validasi email menggunakan layanan eksternal (misal: ZeroBounce), jika dikonfigurasi.
   const validationResult = await validateEmail(email)

   if (validationResult?.data) {
     if (!validationResult.valid) {
       return returnServerError(
         'Harap gunakan alamat email yang valid - email perusahaan Anda adalah yang terbaik.'
       )
     }

     if (await shouldWarnAboutAlternateEmail(validationResult.data)) {
       return returnServerError(
         'Apakah ini email sekunder? Gunakan email utama Anda untuk akses cepat.'
       )
     }
   }

   // Melakukan pendaftaran pengguna dengan Supabase Auth.
   const { error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       // URL pengalihan email setelah verifikasi (digunakan untuk alur email aja)
       emailRedirectTo: `${origin}${AUTH_URLS.CALLBACK}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
       data: validationResult?.data
         ? {
             email_validation: validationResult?.data,
           }
         : undefined,
     },
   })

   if (error) {
     switch (error.code) {
       case 'email_exists':
         return returnServerError('Email sudah digunakan.')
       case 'weak_password':
         return returnServerError('Kata sandi terlalu lemah.')
       default:
         throw error // Lempar error lain untuk penanganan umum.
     }
   }
 })

// signInAction: Biarkan kode ini tidak berubah karena Anda ingin mempertahankan fungsionalitas login email.
const signInSchema = zfd.formData({
 email: zfd.text(z.string().email('Valid email is required')),
 password: zfd.text(
   z.string().min(8, 'Password must be at least 8 characters')
 ),
 returnTo: zfd.text(z.string().optional()),
})

export const signInAction = actionClient
 .schema(signInSchema)
 .metadata({ actionName: 'signInWithEmailAndPassword' })
 .action(async ({ parsedInput }) => {
   const { email, password, returnTo = '' } = parsedInput
   const supabase = await createClient()

   // Mencoba masuk dengan email dan kata sandi.
   const { error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })

   if (error) {
     if (error.code === 'invalid_credentials') {
       return returnServerError('Kredensial tidak valid.')
     }
     throw error // Lempar error lain.
   }

   // Arahkan ke dashboard atau URL yang ditentukan setelah login berhasil.
   redirect(returnTo || PROTECTED_URLS.DASHBOARD)
 })

// forgotPasswordAction: Biarkan kode ini tidak berubah karena Anda ingin mempertahankan fungsionalitas reset password.
const forgotPasswordSchema = zfd.formData({
 email: zfd.text(z.string().email('Valid email is required')),
 callbackUrl: zfd.text(z.string().optional()),
})

export const forgotPasswordAction = actionClient
 .schema(forgotPasswordSchema)
 .metadata({ actionName: 'forgotPassword' })
 .action(async ({ parsedInput }) => {
   const { email } = parsedInput
   const supabase = await createClient()
   const origin = (await headers()).get('origin')

   // Mengirim email reset password.
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${origin}${AUTH_URLS.CALLBACK}?redirect_to=${AUTH_URLS.RESET_PASSWORD}`,
   })

   if (error) {
     throw error // Lempar error jika gagal mengirim email.
   }
 })

// signOutAction: Biarkan kode ini tidak berubah.
export const signOutAction = async () => {
 const supabase = await createClient()
 await supabase.auth.signOut()

 throw redirect(AUTH_URLS.SIGN_IN)
}

3.17. src/server/keys/key-actions.ts
Memperbarui aksi pembuatan API Key agar sesuai dengan endpoint GET /get/getkey di backend Anda.

// src/server/keys/key-actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { authActionClient } from '@/lib/clients/action'
import { returnServerError } from '@/lib/utils/action'
import { SUPABASE_AUTH_HEADERS } from '@/configs/api'
import { logError } from '@/lib/clients/logger'
import { ERROR_CODES } from '@/configs/logs'
import { infra } from '@/lib/clients/api'

// Skema validasi untuk membuat API Key baru.
const CreateApiKeySchema = z.object({
 teamId: z.string({ required_error: 'Team ID is required' }).uuid(),
 name: z
   .string({ required_error: 'Name is required' })
   .min(1, 'Name cannot be empty')
   .max(50, 'Name cannot be longer than 50 characters')
   .trim(),
 // Tambahkan 'tier' ke skema, karena backend Anda mendukung pemilihan tier.
 tier: z.string().optional(),
})

export const createApiKeyAction = authActionClient
 .schema(CreateApiKeySchema)
 .metadata({ actionName: 'createApiKey' })
 .action(async ({ parsedInput, ctx }) => {
   const { teamId, name, tier } = parsedInput // Dapatkan 'name' dan 'tier' dari input.
   const { session } = ctx

   const accessToken = session.access_token

   // Mengubah panggilan API dari POST menjadi GET.
   // Asumsi: Endpoint backend Anda adalah 'GET /get/getkey' dan menerima 'name' serta 'tier'
   // sebagai query parameters.
   const res = await infra.GET('/get/getkey', { // <-- Endpoint disesuaikan
     params: {
       query: {
         name,
         ...(tier && { tier }), // Tambahkan parameter 'tier' jika disediakan.
       },
     },
     headers: {
       ...SUPABASE_AUTH_HEADERS(accessToken, teamId),
     },
   })

   if (res.error) {
     logError(ERROR_CODES.INFRA, '/get/getkey', res.error) // <-- Ubah log endpoint
     return returnServerError('Gagal membuat API key.')
   }

   // Revalidasi jalur untuk memperbarui cache halaman setelah API key dibuat.
   revalidatePath(`/dashboard/[teamIdOrSlug]/keys`, 'page')

   // Sesuaikan format respons agar sesuai dengan apa yang dikembalikan oleh backend Anda.
   // Asumsi: backend mengembalikan { status: true, creator: ..., result: { apikey, name, tier, created_at, ... } }
   return {
     createdApiKey: {
       id: res.data.result.apikey, // API key string sebagai ID untuk frontend.
       key: res.data.result.apikey, // Nilai API key.
       name: res.data.result.name, // Nama API key.
       mask: { // Membangun objek mask berdasarkan format API key Anda.
         prefix: 'nai', // Contoh: prefix API key Anda.
         valueLength: res.data.result.apikey.length,
         maskedValuePrefix: res.data.result.apikey.substring(0, 4),
         maskedValueSuffix: res.data.result.apikey.substring(res.data.result.apikey.length - 4),
       },
       createdAt: res.data.result.created_at, // Tanggal pembuatan.
       createdBy: null, // Jika tidak ada info creator dari backend, set null.
       lastUsed: null, // Jika tidak ada info lastUsed dari backend, set null.
       // Anda mungkin perlu menambahkan properti lain seperti 'tier', 'usage' jika ingin menampilkan detailnya segera.
       tier: res.data.result.tier,
       usage: res.data.result.usage,
     },
   }
 })

// deleteApiKeyAction: Biarkan kode ini tidak berubah.
export const deleteApiKeyAction = authActionClient
 .schema(z.object({ apiKeyId: z.string() }))
 .metadata({ actionName: 'deleteApiKey' })
 .action(async ({ parsedInput, ctx }) => {
   const { apiKeyId } = parsedInput
   const { session } = ctx

   const accessToken = session.access_token

   const res = await infra.DELETE(`/api/keys/${apiKeyId}`, {
     headers: {
       ...SUPABASE_AUTH_HEADERS(accessToken),
     },
   })

   if (res.error) {
     logError(ERROR_CODES.INFRA, `/api/keys/${apiKeyId}`, res.error)
     return returnServerError('Gagal menghapus API key.')
   }

   revalidatePath(`/dashboard/[teamIdOrSlug]/keys`, 'page')

   return { success: true }
 })

3.18. src/app/robots.ts
Memperbarui URL sitemap.

// src/app/robots.ts

import type { MetadataRoute } from 'next'
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

export default function robots(): MetadataRoute.Robots {
 if (!ALLOW_SEO_INDEXING) {
   // Kita menyajikan robots.txt kosong untuk kode status 200 jika tidak diindeks.
   return {
     rules: {},
   }
 }

 return {
   rules: {
     userAgent: '*',
     allow: '/',
   },
   // Pastikan sitemap mengarah ke domain dashboard Anda yang benar.
   sitemap: `https://app.neosantara.xyz/sitemap.xml`, // Contoh: Ubah ke domain dashboard Anda.
 }
}

3.19. src/app/sitemap.ts
Membersihkan logika sitemap dari referensi E2B Docs dan rewrites yang tidak relevan.

// src/app/sitemap.ts
/**
* Pembuat Sitemap untuk Website Neosantara AI
*
* Modul ini menghasilkan sitemap terpadu dengan mengagregasikan sitemaps
* dari berbagai sumber termasuk halaman utama dan blog (jika ada).
* Ini menangani pengambilan, parsing, deduplikasi, dan pemformatan URL yang tepat.
*/

import { MetadataRoute } from 'next'
import { XMLParser } from 'fast-xml-parser'
import {
 LANDING_PAGE_DOMAIN,
} from '@/configs/rewrites' // Pastikan LANDING_PAGE_DOMAIN relevan atau dihapus.
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

// Cache sitemap selama 15 menit (dalam detik)
const SITEMAP_CACHE_TIME = 15 * 60

/**
* Nilai frekuensi perubahan yang valid untuk entri sitemap
* @see https://www.sitemaps.org/protocol.html
*/
type ChangeFrequency =
 | 'always'
 | 'hourly'
 | 'daily'
 | 'weekly'
 | 'monthly'
 | 'yearly'
 | 'never'

/**
* Konfigurasi untuk situs yang sitemap-nya harus disertakan.
* Hanya sertakan sitemap yang relevan dengan domain Neosantara Anda.
*/
type Site = {
 sitemapUrl: string // URL ke sitemap.xml situs
 lastModified?: string | Date // Tanggal modifikasi terakhir default untuk entri
 changeFrequency?: ChangeFrequency // Frekuensi perubahan default untuk entri
 priority?: number // Prioritas default untuk entri (0.0 hingga 1.0)
 baseUrl?: string // URL dasar untuk digunakan untuk entri sitemap akhir
}

/**
* Daftar situs yang akan disertakan dalam sitemap terpadu.
* Sesuaikan ini hanya untuk domain Anda (misal: Neosantara.xyz jika Anda punya blog terpisah
* atau landing page dengan sitemap sendiri). Jika sitemap ini hanya untuk dashboard,
* Anda bisa mengosongkan array ini atau hanya menyertakan entri untuk dashboard itu sendiri.
*/
const sites: Site[] = [
 {
   sitemapUrl: `https://${LANDING_PAGE_DOMAIN}/sitemap.xml`, // Contoh: Sitemap untuk landing page Neosantara.xyz
   priority: 1.0,
   changeFrequency: 'weekly',
   baseUrl: 'https://neosantara.xyz', // Sesuaikan dengan domain landing page Anda
 },
 // Hapus semua entri yang tidak relevan dengan Neosantara AI.
 // Contoh: Hapus entri untuk docs.e2b.dev
 // {
 //   sitemapUrl: `https://${DOCS_NEXT_DOMAIN}/sitemap.xml`,
 //   priority: 0.9,
 //   changeFrequency: 'weekly',
 //   baseUrl: 'https://e2b.dev',
 // },
]

/**
* Struktur entri URL tunggal dalam sitemap
*/
type SitemapData = {
 loc: string // Lokasi URL
 lastmod?: string | Date // Tanggal modifikasi terakhir
 changefreq?: ChangeFrequency // Frekuensi perubahan
 priority?: number // Prioritas (0.0 hingga 1.0)
}

/**
* Struktur dokumen XML sitemap
*/
type Sitemap = {
 urlset: {
   url: SitemapData | SitemapData[] // URL tunggal atau array URL
 }
}

/**
* Mengambil dan mem-parsing file XML sitemap dari URL yang diberikan.
*
* @param url URL file sitemap.xml yang akan diambil.
* @returns Data sitemap yang di-parse atau sitemap kosong jika ada kesalahan.
*/
async function getXmlData(url: string): Promise<Sitemap> {
 const parser = new XMLParser()

 try {
   const response = await fetch(url, {
     next: { revalidate: SITEMAP_CACHE_TIME },
     headers: {
       Accept: 'application/xml',
     },
   })

   if (!response.ok) {
     console.warn(`Gagal mengambil sitemap dari ${url}:`, response.statusText)
     return { urlset: { url: [] } }
   }

   const text = await response.text()
   return parser.parse(text) as Sitemap
 } catch (error) {
   console.error(`Kesalahan saat mengambil sitemap dari ${url}:`, error)
   return { urlset: { url: [] } }
 }
}

/**
* Memproses sitemap situs dan mengonversinya ke format sitemap Next.js.
* Tidak ada logika rewrite internal yang kompleks lagi.
*
* @param site Konfigurasi situs yang akan diproses.
* @returns Array entri sitemap dalam format Next.js.
*/
async function getSitemap(site: Site): Promise<MetadataRoute.Sitemap> {
 const data = await getXmlData(site.sitemapUrl)

 if (!data || !site.baseUrl) {
   if (!site.baseUrl) {
     console.warn(
       `Situs ${site.sitemapUrl} tidak memiliki baseUrl, melewati pembuatan sitemap untuk situs ini.`
     )
   }
   return []
 }

 const processUrl = (
   line: SitemapData
 ): MetadataRoute.Sitemap[number] | null => {
   try {
     const originalUrl = new URL(line.loc)
     // Karena tidak ada rewrite internal yang kompleks, pathname langsung digunakan.
     const finalPathname = originalUrl.pathname

     // Bangun URL akhir menggunakan URL dasar situs dan pathname yang ditentukan.
     const finalUrl = new URL(finalPathname, site.baseUrl).toString()

     return {
       url: finalUrl,
       priority: line?.priority ?? site.priority,
       changeFrequency: line?.changefreq ?? site.changeFrequency,
       lastModified: line?.lastmod ?? site.lastModified,
     }
   } catch (error) {
     console.error(`Kesalahan saat memproses URL sitemap ${line.loc}:`, error)
     return null
   }
 }

 if (!data.urlset?.url) {
   console.warn(
     `Sitemap dari ${site.sitemapUrl} tidak memiliki properti urlset atau url.`
   )
   return []
 }

 if (Array.isArray(data.urlset.url)) {
   return data.urlset.url
     .map(processUrl)
     .filter((entry) => entry !== null) as MetadataRoute.Sitemap
 } else if (typeof data.urlset.url === 'object' && data.urlset.url !== null) {
   const entry = processUrl(data.urlset.url)
   return entry ? [entry] : []
 } else {
   console.warn(
     `Sitemap dari ${site.sitemapUrl} memiliki struktur urlset.url yang tidak terduga:`,
     data.urlset.url
   )
   return []
 }
}

/**
* Fungsi pembuatan sitemap utama yang dipanggil Next.js.
*
* Mengambil dan menggabungkan sitemaps dari semua situs yang dikonfigurasi,
* mende-duplikasi entri, dan mengembalikan daftar URL yang diurutkan.
*
* @returns Sitemap lengkap untuk website Neosantara AI.
*/
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 if (!ALLOW_SEO_INDEXING) {
   return []
 }

 let mergedSitemap: MetadataRoute.Sitemap = []

 // Ambil sitemaps dari semua situs yang dikonfigurasi.
 for (const site of sites) {
   const urls = await getSitemap(site)
   mergedSitemap = mergedSitemap.concat(urls)
 }

 // Deduplikasi URL, pertahankan yang dengan prioritas tertinggi.
 const urlMap = new Map<string, MetadataRoute.Sitemap[number]>()
 mergedSitemap.forEach((entry) => {
   const existingEntry = urlMap.get(entry.url)
   const currentPriority = entry.priority ?? 0
   const existingPriority = existingEntry?.priority ?? 0

   if (!existingEntry || currentPriority > existingPriority) {
     urlMap.set(entry.url, entry)
   }
 })

 const uniqueSitemap = Array.from(urlMap.values())

 // Urutkan semua URL unik secara alfabetis.
 return uniqueSitemap.sort((a, b) => a.url.localeCompare(b.url))
}

3.20. next.config.mjs
Membersihkan konfigurasi Next.js dari entri yang tidak relevan (Sentry, PostHog, redirects lama).

// next.config.mjs

// Hapus import withSentryConfig jika Sentry dihapus.
// import { withSentryConfig } from '@sentry/nextjs'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
 reactStrictMode: true,
 experimental: {
   reactCompiler: true,
   ppr: true,
   staleTimes: {
     dynamic: 180,
     static: 180,
   },
   serverActions: {
     bodySizeLimit: '5mb',
   },
 },
 logging: {
   fetches: {
     fullUrl: true,
   },
 },
 trailingSlash: false,
 headers: async () => [
   {
     source: '/:path*',
     headers: [
       {
         // Konfigurasi untuk mencegah browser merender halaman di dalam frame atau iframe
         // dan menghindari serangan clickjacking.
         key: 'X-Frame-Options',
         value: 'SAMEORIGIN',
       },
     ],
   },
 ],
 // Bagian 'rewrites' sekarang kosong atau hanya berisi rewrite khusus Anda.
 rewrites: async () => [], // Hapus semua PostHog rewrites dan lainnya yang tidak relevan.
 // Bagian 'redirects' sekarang kosong atau hanya berisi redirect khusus Anda.
 redirects: async () => [
   // Jika Anda memiliki redirect lain yang ingin dipertahankan, tambahkan di sini.
   // Contoh:
   // {
   //   source: '/old-path',
   //   destination: '/new-path',
   //   permanent: true,
   // },
   // Redirect untuk CLI Auth jika URL Anda berbeda dari /docs/api/cli.
   {
     source: '/docs/api/cli',
     destination: '/auth/cli', // Pastikan ini mengarah ke URL CLI Auth yang benar.
     permanent: true,
   },
   // Redirect yang mengarahkan dari /auth/sign-in ke /sign-in (jika diperlukan oleh struktur folder).
   {
     source: '/auth/sign-in',
     destination: '/sign-in',
     permanent: true,
   },
   {
     source: '/auth/sign-up',
     destination: '/sign-up',
     permanent: true,
   },
 ],
 skipTrailingSlashRedirect: true,
}

// Hapus withSentryConfig jika Sentry telah dihapus dari proyek Anda.
// export default withSentryConfig(withMDX(config), { ... });
export default withMDX(config) // <-- Ubah baris ini jika Anda menghapus Sentry.

4. Menjalankan Aplikasi Frontend
Setelah Anda selesai menyalin dan menempelkan semua perubahan kode ke file yang sesuai di repositori lokal Anda:

Buka Terminal di root repositori frontend Anda.
Instal Dependensi:
Jika Anda menggunakan npm:
npm install

Jika Anda menggunakan yarn:
yarn install
Jalankan Aplikasi dalam Mode Pengembangan:
Jika Anda menggunakan npm:
npm run dev

Jika Anda menggunakan yarn:
yarn dev
Buka browser Anda dan kunjungi http://localhost:3000 (atau port lain yang ditampilkan di terminal).
5. Mendorong Perubahan ke GitHub
Setelah Anda menguji perubahan secara lokal dan puas dengan hasilnya:

Stage Perubahan:
git add .
Commit Perubahan:
git commit -m "feat: Menyesuaikan dashboard frontend dengan backend Neosantara AI"
Push ke GitHub:
git push origin main # Atau nama branch Anda
Dokumen ini mencakup semua perubahan yang disepakati untuk mengadaptasi frontend dashboard Anda. Jika Anda memiliki pertanyaan lebih lanjut saat menerapkan ini, jangan ragu untuk bertanya!
