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