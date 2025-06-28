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