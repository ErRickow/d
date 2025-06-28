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
export default withMDX(config) 