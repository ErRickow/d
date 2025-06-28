import {
 Activity,
 Box,
 Container,
 CreditCard,
 Key,
 LucideProps,
 UserRoundCog,
 Book,
 Users,
} from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { INCLUDE_BILLING } from './flags' // Ini akan disetel false secara default

type DashboardNavLinkArgs = {
 teamIdOrSlug?: string
}

export type DashboardNavLink = {
 label: string
 href: (args: DashboardNavLinkArgs) => string
 icon: ForwardRefExoticComponent<
   Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
 >
 group?: string
 goesDeeper?: boolean
}

export const MAIN_DASHBOARD_LINKS: DashboardNavLink[] = [
 {
   label: 'Sandboxes',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/sandboxes`,
   icon: Box,
 },
 {
   label: 'Templates',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/templates`,
   icon: Container,
 },
 // Blok ini dikontrol oleh INCLUDE_BILLING yang akan false, jadi tidak akan muncul.
 ...(INCLUDE_BILLING
   ? [
       {
         label: 'Usage',
         href: (args: DashboardNavLinkArgs) =>
           `/dashboard/${args.teamIdOrSlug}/usage`,
         icon: Activity,
       },
     ]
   : []),
 {
   label: 'Team',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/team`,
   icon: Users,
   group: 'manage',
 },
 {
   label: 'API Keys',
   href: (args) => `/dashboard/${args.teamIdOrSlug}/keys`,
   icon: Key,
   group: 'manage',
 },

 // Blok ini dikontrol oleh INCLUDE_BILLING yang akan false, jadi tidak akan muncul.
 ...(INCLUDE_BILLING
   ? [
       {
         label: 'Billing',
         href: (args: DashboardNavLinkArgs) =>
           `/dashboard/${args.teamIdOrSlug}/billing`,
         icon: CreditCard,
         group: 'expenses',
       },
       // Fitur 'Budget' dihapus total, jadi tidak perlu lagi ada link di sini.
       // {
       //   label: 'Budget',
       //   href: (args: DashboardNavLinkArgs) =>
       //     `/dashboard/${args.teamIdOrSlug}/budget`,
       //   group: 'expenses',
       //   icon: DollarSign,
       // },
     ]
   : []),
]

export const EXTRA_DASHBOARD_LINKS: DashboardNavLink[] = [
 {
   label: 'Account Settings',
   href: (args) => `/dashboard/account`,
   icon: UserRoundCog,
 },
 {
   label: 'Documentation',
   // Ganti dengan URL dokumentasi Neosantara AI Anda yang sudah di-deploy.
   href: () => `https://docs.neosantara.xyz`,
   icon: Book, // Pastikan Anda mengimpor ikon 'Book' dari 'lucide-react' jika menggunakannya.
   group: 'help',
 },
]

export const ALL_DASHBOARD_LINKS = [
 ...MAIN_DASHBOARD_LINKS,
 ...EXTRA_DASHBOARD_LINKS,
]