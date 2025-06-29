import '@/app/fonts'
import '@/styles/globals.css'

import { Body } from './layout.client'
import { BASE_URL } from '@/configs/urls'
import { Metadata } from 'next/types'
import { METADATA } from '@/configs/metadata'
import ClientProviders from '@/features/client-providers'
import { Suspense } from 'react'
// Hapus GeneralAnalyticsCollector jika tidak digunakan
// import { GeneralAnalyticsCollector } from '@/features/general-analytics-collector'
import { Toaster } from '@/ui/primitives/toaster'
// Hapus import Head dari 'next/head'
// import Head from 'next/head' 
// Hapus GTMHead jika tidak menggunakan Google Tag Manager
// import { GTMHead } from '@/features/google-tag-manager'
// Hapus Analytics jika tidak menggunakan Vercel Analytics
// import { Analytics } from '@vercel/analytics/next'
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s - Neosantara AI', // Mengubah judul template
    default: METADATA.title,
  },
  description: METADATA.description,
  twitter: {
    title: METADATA.title,
    description: METADATA.description,
  },
  openGraph: {
    title: METADATA.title,
    description: METADATA.description,
  },
  robots: ALLOW_SEO_INDEXING ? 'index, follow' : 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Hapus sepenuhnya tag <Head> dan konten di dalamnya */}
      {/* <Head> */}
        {/* Hapus GTMHead jika tidak digunakan */}
        {/* <GTMHead /> */}
      {/* </Head> */}
      <Body>
        <ClientProviders>
          {children}
          <Suspense>
            {/* Hapus GeneralAnalyticsCollector jika tidak digunakan */}
            {/* <GeneralAnalyticsCollector /> */}
            {/* Hapus DashboardSurveyPopover jika tidak digunakan */}
            {/* <DashboardSurveyPopover /> */}
            <Toaster />
          </Suspense>
        </ClientProviders>
        {/* Hapus Analytics jika tidak digunakan */}
        {/* <Analytics /> */}
      </Body>
    </html>
  )
}
