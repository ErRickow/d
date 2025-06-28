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