import { Suspense } from 'react'
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
         onConfirm={handleLeaveTeam} 
         trigger={
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
         onConfirm={handleDeleteTeam}
         trigger={
           <Button variant="error">Hapus Tim</Button>
         }
       />
     </div>
   </>
  )
}