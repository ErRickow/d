
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

 // <-- Ubah ini

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



3.6. src/app/dashboard/[teamIdOrSlug]/usage/page.tsx
Halaman "Usage" akan sepenuhnya didesain ulang untuk menampilkan ringkasan penggunaan dari metadata API key.

// src/app/dashboard/[teamIdOrSlug]/usage/page.tsx



3.7. src/app/dashboard/[teamIdOrSlug]/billing/page.tsx
Halaman "Billing" akan diubah total untuk menampilkan informasi pricing tier Anda.

// src/app/dashboard/[teamIdOrSlug]/billing/page.tsx



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


3.12. src/features/dashboard/sidebar/footer.tsx
Memperbarui tautan di sidebar footer.

// src/features/dashboard/sidebar/footer.tsx


3.13. src/features/client-providers.tsx
Menghapus penyedia analitik pihak ketiga (PostHog).

// src/features/client-providers.tsx
'use client'

// Hapus import posthog dan PHProvider jika tidak menggunakan PostHog


3.14. src/app/layout.tsx
Membersihkan root layout dari komponen analitik.

// src/app/layout.tsx



3.15. src/app/layout.client.tsx
Membersihkan client-side layout dari script analitik.

// src/app/layout.client.tsx
// Hapus import GTMBody jika tidak digunakan


3.16. src/server/auth/auth-actions.ts
Memperbarui URL redirectTo untuk Google OAuth dan memastikan aksi autentikasi email/password tetap ada.

// src/server/auth/auth-actions.ts


3.17. src/server/keys/key-actions.ts
Memperbarui aksi pembuatan API Key agar sesuai dengan endpoint GET /get/getkey di backend Anda.

// src/server/keys/key-actions.ts


3.18. src/app/robots.ts
Memperbarui URL sitemap.

// src/app/robots.ts



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



3.20. next.config.mjs
Membersihkan konfigurasi Next.js dari entri yang tidak relevan (Sentry, PostHog, redirects lama).

// next.config.mjs

// Hapus import withSentryConfig jika Sentry dihapus.
// <-- Ubah baris ini jika Anda menghapus Sentry.

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
