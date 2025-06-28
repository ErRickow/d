import type { MetadataRoute } from 'next'
import { ALLOW_SEO_INDEXING } from '@/configs/flags'

export default function robots(): MetadataRoute.Robots {
	if (!ALLOW_SEO_INDEXING) {
		// Kita menyajikan robots.txt kosong untuk kode status 200 jika tidak diindeks.
		return {
			rules: {},
		}
	}
	
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		// Pastikan sitemap mengarah ke domain dashboard Anda yang benar.
		sitemap: `https://app.neosantara.xyz/sitemap.xml`, // 
	}
}