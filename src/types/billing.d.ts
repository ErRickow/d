interface Invoice {
	// id: string;
	// amount: number;
	// date: string;
	// status: 'paid' | 'pending' | 'failed';
	// url: string;
}

interface BillingLimit {
	// Jika Anda memiliki limit spesifik yang diambil terpisah, definisikan di sini.
}

interface CustomerPortalResponse {
	// Jika Anda memiliki portal pelanggan (misalnya Stripe) yang akan diintegrasikan, definisikan tipenya.
}

// Sesuaikan UsageResponse agar sesuai dengan metadata API key Anda
// Ini adalah struktur yang mungkin Anda dapatkan dari /v1/auth/key atau /api/keys
interface UsageResponse {
	credits ? : number; // Jika ada sistem kredit
	dailyUsage ? : {
		current: number;
		limit: number;
		remaining: number;
		reset_date: string;
	};
	monthlyUsage ? : {
		current: number;
		limit: number;
		remaining: number;
		reset_date: string;
	};
	// Tambahkan properti lain yang relevan dari metadata API key Anda.
}

interface CreateTeamsResponse {
	id: string
	slug: string
}

export type {
	Invoice,
	BillingLimit,
	CustomerPortalResponse,
	CreateTeamsResponse,
	UsageResponse
}