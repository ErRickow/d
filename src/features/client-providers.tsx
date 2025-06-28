// import posthog from 'posthog-js'
// import { PostHogProvider as PHProvider } from 'posthog-js/react'

import { RootProvider } from 'fumadocs-ui/provider'
import { TooltipProvider } from '@/ui/primitives/tooltip'
import { ToastProvider } from '@/ui/primitives/toast'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    // Hapus PHProvider jika tidak menggunakan PostHog
    // <PostHogProvider>
    <RootProvider
       theme={{
         attribute: 'class',
         defaultTheme: 'system',
         enableSystem: true,
         disableTransitionOnChange: true,
       }}
     >
       <TooltipProvider>
         <ToastProvider>{children}</ToastProvider>
       </TooltipProvider>
     </RootProvider>
    // </PostHogProvider>
  )
}

// Hapus fungsi ini jika tidak menggunakan PostHog
// export function PostHogProvider({ children }: { children: React.ReactNode }) {
//   React.useEffect(() => {
//     if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
//       return
//     }

//     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
//       api_host: '/ingest',
//       ui_host: 'https://us.posthog.com',
//       disable_session_recording: process.env.NODE_ENV !== 'production',
//       advanced_disable_toolbar_metrics: true,
//       opt_in_site_apps: true,
//       loaded: (posthog) => {
//         if (process.env.NODE_ENV === 'development') posthog.debug()
//       },
//     })
//   }, [])

//   return <PHProvider client={posthog}>{children}</PHProvider>
// }