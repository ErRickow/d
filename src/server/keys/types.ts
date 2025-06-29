import { InfApiGetApiKeysResponseBody } from '@/types/infra-api.d'

// Ini adalah struktur data API key yang dikembalikan oleh backend Anda.
// Sesuaikan agar cocok dengan properti yang sebenarnya dikembalikan oleh endpoint GET /api/keys
export interface ClientApiKey {
  id: string
  name: string
  mask: {
    prefix: string
    valueLength: number
    maskedValuePrefix: string
    maskedValueSuffix: string
  }
  createdAt: string
  createdBy?: {
    id: string
    email: string
  } | null
  lastUsed?: string | null
  // Tambahkan properti 'tier' yang Anda inginkan dari backend
  tier: string; 
  // Tambahkan properti 'usage' yang sekarang dikembalikan oleh backend Anda.
  // Struktur ini harus cocok dengan objek 'usage' yang ada di backend.
  usage: {
    daily: {
      current: number;
      limit: number;
      remaining: number;
      reset_date: string;
    };
    monthly: {
      current: number;
      limit: number;
      remaining: number;
      reset_date: string;
    };
  };
}

export interface GetTeamApiKeysResponse {
  apiKeys: ClientApiKey[]
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
}
