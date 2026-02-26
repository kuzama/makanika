const API_URL = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface CreateMechanicInput {
  businessName: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  priceRange?: 'BUDGET' | 'MODERATE' | 'PREMIUM';
  vehicleTypes?: string[];
  services?: string[];
  specialties?: string[];
}

export interface UpdateMechanicInput extends Partial<CreateMechanicInput> {}

interface MutationResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

interface AdminStats {
  totalMechanics: number;
  pendingVerifications: number;
  verifiedMechanics: number;
  totalUsers: number;
  totalReviews: number;
}

interface PendingMechanic {
  id: string;
  businessName: string;
  phone: string;
  verificationStatus: string;
  verificationDocs: string[];
  listedBy?: { name?: string; phone: string };
  createdAt: string;
}

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

interface GoogleLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role: string;
    image?: string;
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

export interface SearchMechanicsParams {
  query?: string;
  vehicleTypes?: string[];
  services?: string[];
  priceRange?: string;
  verifiedOnly?: boolean;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
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

  async googleLogin(credential: string): Promise<GoogleLoginResponse> {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
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
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to fetch mechanics');
    }
    return res.json();
  },

  async getMechanicById(id: string): Promise<Mechanic> {
    const res = await fetch(`${API_URL}/mechanics/${id}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Mechanic not found');
    }
    return res.json();
  },

  async searchMechanics(params: SearchMechanicsParams = {}): Promise<MechanicsResponse> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('q', params.query);
    if (params.vehicleTypes?.length) searchParams.set('vehicleTypes', params.vehicleTypes.join(','));
    if (params.services?.length) searchParams.set('services', params.services.join(','));
    if (params.priceRange) searchParams.set('priceRange', params.priceRange);
    if (params.verifiedOnly) searchParams.set('verifiedOnly', 'true');
    if (params.lat !== undefined) searchParams.set('lat', params.lat.toString());
    if (params.lng !== undefined) searchParams.set('lng', params.lng.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const res = await fetch(`${API_URL}/search/combined?${searchParams.toString()}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Search failed');
    }
    return res.json();
  },

  async createMechanic(data: CreateMechanicInput): Promise<Mechanic> {
    const res = await fetch(`${API_URL}/mechanics`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to create mechanic');
    }
    return res.json();
  },

  async updateMechanic(id: string, data: UpdateMechanicInput): Promise<Mechanic> {
    const res = await fetch(`${API_URL}/mechanics/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to update mechanic');
    }
    return res.json();
  },

  async deleteMechanic(id: string): Promise<MutationResponse> {
    const res = await fetch(`${API_URL}/mechanics/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to delete mechanic');
    }
    return res.json();
  },

  async getMyMechanics(): Promise<Mechanic[]> {
    const res = await fetch(`${API_URL}/mechanics/mine`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to load your listings');
    }
    return res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to load admin stats');
    }
    return res.json();
  },

  async getAdminPending(): Promise<PendingMechanic[]> {
    const res = await fetch(`${API_URL}/admin/verification/pending`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to load pending verifications');
    }
    return res.json();
  },

  async adminApprove(id: string): Promise<MutationResponse> {
    const res = await fetch(`${API_URL}/admin/verification/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to approve mechanic');
    }
    return res.json();
  },

  async adminReject(id: string): Promise<MutationResponse> {
    const res = await fetch(`${API_URL}/admin/verification/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to reject mechanic');
    }
    return res.json();
  },
};
