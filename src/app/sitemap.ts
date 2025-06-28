import { MetadataRoute } from 'next'
import { XMLParser } from 'fast-xml-parser'
import {
 LANDING_PAGE_DOMAIN,
} from '@/configs/rewrites' // Pastikan LANDING_PAGE_DOMAIN relevan atau dihapus.
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

// Cache sitemap selama 15 menit (dalam detik)
const SITEMAP_CACHE_TIME = 15 * 60

/**
* Nilai frekuensi perubahan yang valid untuk entri sitemap
* @see https://www.sitemaps.org/protocol.html
*/
type ChangeFrequency =
 | 'always'
 | 'hourly'
 | 'daily'
 | 'weekly'
 | 'monthly'
 | 'yearly'
 | 'never'

/**
* Konfigurasi untuk situs yang sitemap-nya harus disertakan.
* Hanya sertakan sitemap yang relevan dengan domain Neosantara Anda.
*/
type Site = {
 sitemapUrl: string // URL ke sitemap.xml situs
 lastModified?: string | Date // Tanggal modifikasi terakhir default untuk entri
 changeFrequency?: ChangeFrequency // Frekuensi perubahan default untuk entri
 priority?: number // Prioritas default untuk entri (0.0 hingga 1.0)
 baseUrl?: string // URL dasar untuk digunakan untuk entri sitemap akhir
}

/**
* Daftar situs yang akan disertakan dalam sitemap terpadu.
* Sesuaikan ini hanya untuk domain Anda (misal: Neosantara.xyz jika Anda punya blog terpisah
* atau landing page dengan sitemap sendiri). Jika sitemap ini hanya untuk dashboard,
* Anda bisa mengosongkan array ini atau hanya menyertakan entri untuk dashboard itu sendiri.
*/
const sites: Site[] = [
 {
   sitemapUrl: `https://${LANDING_PAGE_DOMAIN}/sitemap.xml`, // Contoh: Sitemap untuk landing page Neosantara.xyz
   priority: 1.0,
   changeFrequency: 'weekly',
   baseUrl: 'https://neosantara.xyz', // Sesuaikan dengan domain landing page Anda
 },
 // Hapus semua entri yang tidak relevan dengan Neosantara AI.
 // Contoh: Hapus entri untuk docs.e2b.dev
 // {
 //   sitemapUrl: `https://${DOCS_NEXT_DOMAIN}/sitemap.xml`,
 //   priority: 0.9,
 //   changeFrequency: 'weekly',
 //   baseUrl: 'https://e2b.dev',
 // },
]

/**
* Struktur entri URL tunggal dalam sitemap
*/
type SitemapData = {
 loc: string // Lokasi URL
 lastmod?: string | Date // Tanggal modifikasi terakhir
 changefreq?: ChangeFrequency // Frekuensi perubahan
 priority?: number // Prioritas (0.0 hingga 1.0)
}

/**
* Struktur dokumen XML sitemap
*/
type Sitemap = {
 urlset: {
   url: SitemapData | SitemapData[] // URL tunggal atau array URL
 }
}

/**
* Mengambil dan mem-parsing file XML sitemap dari URL yang diberikan.
*
* @param url URL file sitemap.xml yang akan diambil.
* @returns Data sitemap yang di-parse atau sitemap kosong jika ada kesalahan.
*/
async function getXmlData(url: string): Promise<Sitemap> {
 const parser = new XMLParser()

 try {
   const response = await fetch(url, {
     next: { revalidate: SITEMAP_CACHE_TIME },
     headers: {
       Accept: 'application/xml',
     },
   })

   if (!response.ok) {
     console.warn(`Gagal mengambil sitemap dari ${url}:`, response.statusText)
     return { urlset: { url: [] } }
   }

   const text = await response.text()
   return parser.parse(text) as Sitemap
 } catch (error) {
   console.error(`Kesalahan saat mengambil sitemap dari ${url}:`, error)
   return { urlset: { url: [] } }
 }
}

/**
* Memproses sitemap situs dan mengonversinya ke format sitemap Next.js.
* Tidak ada logika rewrite internal yang kompleks lagi.
*
* @param site Konfigurasi situs yang akan diproses.
* @returns Array entri sitemap dalam format Next.js.
*/
async function getSitemap(site: Site): Promise<MetadataRoute.Sitemap> {
 const data = await getXmlData(site.sitemapUrl)

 if (!data || !site.baseUrl) {
   if (!site.baseUrl) {
     console.warn(
       `Situs ${site.sitemapUrl} tidak memiliki baseUrl, melewati pembuatan sitemap untuk situs ini.`
     )
   }
   return []
 }

 const processUrl = (
   line: SitemapData
 ): MetadataRoute.Sitemap[number] | null => {
   try {
     const originalUrl = new URL(line.loc)
     // Karena tidak ada rewrite internal yang kompleks, pathname langsung digunakan.
     const finalPathname = originalUrl.pathname

     // Bangun URL akhir menggunakan URL dasar situs dan pathname yang ditentukan.
     const finalUrl = new URL(finalPathname, site.baseUrl).toString()

     return {
       url: finalUrl,
       priority: line?.priority ?? site.priority,
       changeFrequency: line?.changefreq ?? site.changeFrequency,
       lastModified: line?.lastmod ?? site.lastModified,
     }
   } catch (error) {
     console.error(`Kesalahan saat memproses URL sitemap ${line.loc}:`, error)
     return null
   }
 }

 if (!data.urlset?.url) {
   console.warn(
     `Sitemap dari ${site.sitemapUrl} tidak memiliki properti urlset atau url.`
   )
   return []
 }

 if (Array.isArray(data.urlset.url)) {
   return data.urlset.url
     .map(processUrl)
     .filter((entry) => entry !== null) as MetadataRoute.Sitemap
 } else if (typeof data.urlset.url === 'object' && data.urlset.url !== null) {
   const entry = processUrl(data.urlset.url)
   return entry ? [entry] : []
 } else {
   console.warn(
     `Sitemap dari ${site.sitemapUrl} memiliki struktur urlset.url yang tidak terduga:`,
     data.urlset.url
   )
   return []
 }
}

/**
* Fungsi pembuatan sitemap utama yang dipanggil Next.js.
*
* Mengambil dan menggabungkan sitemaps dari semua situs yang dikonfigurasi,
* mende-duplikasi entri, dan mengembalikan daftar URL yang diurutkan.
*
* @returns Sitemap lengkap untuk website Neosantara AI.
*/
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 if (!ALLOW_SEO_INDEXING) {
   return []
 }

 let mergedSitemap: MetadataRoute.Sitemap = []

 // Ambil sitemaps dari semua situs yang dikonfigurasi.
 for (const site of sites) {
   const urls = await getSitemap(site)
   mergedSitemap = mergedSitemap.concat(urls)
 }

 // Deduplikasi URL, pertahankan yang dengan prioritas tertinggi.
 const urlMap = new Map<string, MetadataRoute.Sitemap[number]>()
 mergedSitemap.forEach((entry) => {
   const existingEntry = urlMap.get(entry.url)
   const currentPriority = entry.priority ?? 0
   const existingPriority = existingEntry?.priority ?? 0

   if (!existingEntry || currentPriority > existingPriority) {
     urlMap.set(entry.url, entry)
   }
 })

 const uniqueSitemap = Array.from(urlMap.values())

 // Urutkan semua URL unik secara alfabetis.
 return uniqueSitemap.sort((a, b) => a.url.localeCompare(b.url))
}