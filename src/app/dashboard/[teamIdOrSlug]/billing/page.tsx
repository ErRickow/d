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
     title="Paket Harga" 
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
             tier={tier} 
             isHighlighted={tier.id === 'Standard'} 
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