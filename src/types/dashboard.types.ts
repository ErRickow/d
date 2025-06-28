import { Database } from './database.types'

export type ClientTeam = Database['public']['Tables']['teams']['Row'] & {
	is_default ? : boolean
	// Menyediakan nama yang diubah untuk tim default
	// e.g. "max.mustermann@gmail.com" -> "Tim Max.mustermann"
	transformed_default_name ? : string;
	// Tambahkan 'tier' ke sini agar dapat diakses dari objek tim di frontend.
	// Asumsi ini akan diambil dari database atau metadata API key.
	tier ? : string;
}

export type PollingInterval = 0 | 15 | 30 | 60 // detik