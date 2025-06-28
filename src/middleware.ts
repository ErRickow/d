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