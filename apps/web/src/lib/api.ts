const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SendCodeResponse {
  success: boolean;
  error?: string;
}

interface VerifyCodeResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    phone: string;
    role: string;
  };
  error?: string;
}

export interface Mechanic {
  id: string;
  businessName: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  priceRange: 'BUDGET' | 'MODERATE' | 'PREMIUM';
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  vehicleTypes: string[];
  services: string[];
  specialties: string[];
  photos: string[];
  averageRating?: number;
  reviewCount?: number;
}

export interface MechanicsResponse {
  mechanics: Mechanic[];
  total: number;
  page: number;
  limit: number;
}

export interface GetMechanicsParams {
  page?: number;
  limit?: number;
  vehicleType?: string;
  service?: string;
  search?: string;
}

export const api = {
  async sendCode(phone: string): Promise<SendCodeResponse> {
    const res = await fetch(`${API_URL}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  async verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    return res.json();
  },

  async getMechanics(params: GetMechanicsParams = {}): Promise<MechanicsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.vehicleType) searchParams.set('vehicleType', params.vehicleType);
    if (params.service) searchParams.set('service', params.service);
    if (params.search) searchParams.set('search', params.search);

    const res = await fetch(`${API_URL}/mechanics?${searchParams.toString()}`);
    return res.json();
  },

  async getMechanicById(id: string): Promise<Mechanic> {
    const res = await fetch(`${API_URL}/mechanics/${id}`);
    return res.json();
  },
};
