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