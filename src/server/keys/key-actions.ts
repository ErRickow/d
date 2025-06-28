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
         prefix: 'nai', // Contoh: prefix API key
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