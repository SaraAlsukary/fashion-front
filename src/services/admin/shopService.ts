export type ShopStatusApi = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | string;

export interface ShopOwnerInfo {
  id: string;
  name: string;
  email: string;
}

export interface ShopCountsInfo {
  branches: number;
  products: number;
}

export interface ShopEntity {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  email: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  status: ShopStatusApi;
  isVerified: boolean;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  owner?: ShopOwnerInfo | null;
  counts?: ShopCountsInfo;
}

export interface ListShopsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedShopsResponse {
  items: ShopEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateShopPayload {
  name?: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ShopServiceOptions {
  baseUrl?: string;
  getToken?: () => string | null;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

const DEFAULT_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
  'http://localhost:3000';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem('adminToken') ||
    window.localStorage.getItem('accessToken') ||
    window.localStorage.getItem('token')
  );
}

export class ShopService {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;

  constructor(options: ShopServiceOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.getToken = options.getToken || getStoredToken;
  }

  private async requestWithMeta<T>(
    endpoint: string,
    init: RequestInit = {}
  ): Promise<{
    data: T;
    meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
  }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      headers,
    });

    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & T;

    if (!response.ok) {
      throw new Error(payload?.message || `فشل طلب المتاجر (${response.status})`);
    }

    const data = (payload?.data !== undefined ? payload.data : payload) as T;
    return { data, meta: payload?.meta };
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const { data } = await this.requestWithMeta<T>(endpoint, init);
    return data;
  }

  private normalizeShop(raw: Record<string, unknown>, idx = 0): ShopEntity {
    const ownerRaw = raw.owner as Record<string, unknown> | undefined;
    const countRaw = (raw._count || raw.counts) as Record<string, unknown> | undefined;

    return {
      id: String(raw.id ?? idx + 1),
      ownerId: String(raw.owner_id ?? raw.ownerId ?? ''),
      name: String(raw.name ?? ''),
      description:
        raw.description !== undefined ? (raw.description as string | null) : null,
      logo: raw.logo !== undefined ? (raw.logo as string | null) : null,
      coverImage:
        raw.cover_image !== undefined
          ? (raw.cover_image as string | null)
          : (raw.coverImage as string | null) ?? null,
      phone: raw.phone !== undefined ? (raw.phone as string | null) : null,
      email:
        raw.email !== undefined
          ? (raw.email as string | null)
          : ownerRaw?.email
          ? String(ownerRaw.email)
          : null,
      facebookUrl:
        raw.facebook_url !== undefined
          ? (raw.facebook_url as string | null)
          : (raw.facebookUrl as string | null) ?? null,
      instagramUrl:
        raw.instagram_url !== undefined
          ? (raw.instagram_url as string | null)
          : (raw.instagramUrl as string | null) ?? null,
      whatsappUrl:
        raw.whatsapp_url !== undefined
          ? (raw.whatsapp_url as string | null)
          : (raw.whatsappUrl as string | null) ?? null,
      status: String(raw.status ?? 'PENDING'),
      isVerified: Boolean(raw.is_verified ?? raw.isVerified ?? raw.verified ?? false),
      rejectionReason:
        raw.rejection_reason !== undefined
          ? (raw.rejection_reason as string | null)
          : (raw.rejectionReason as string | null) ?? null,
      approvedAt:
        raw.approved_at !== undefined
          ? (raw.approved_at as string | null)
          : (raw.approvedAt as string | null) ?? null,
      createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
      updatedAt:
        raw.updated_at !== undefined
          ? String(raw.updated_at)
          : raw.updatedAt !== undefined
          ? String(raw.updatedAt)
          : undefined,
      owner: ownerRaw
        ? {
            id: String(ownerRaw.id ?? ''),
            name: String(ownerRaw.name ?? ''),
            email: String(ownerRaw.email ?? ''),
          }
        : null,
      counts: countRaw
        ? {
            branches: Number(countRaw.branches ?? 0),
            products: Number(countRaw.products ?? 0),
          }
        : undefined,
    };
  }

  async getShops(params: ListShopsParams = {}): Promise<PaginatedShopsResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    if (params.status && params.status !== 'ALL') {
      query.set('status', params.status);
    }
    if (params.search !== undefined) {
      query.set('search', params.search);
    }

    const { data, meta } = await this.requestWithMeta<
      ShopEntity[] | { items?: unknown[]; shops?: unknown[] }
    >(`/api/v1/admin/shops?${query.toString()}`);

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { shops?: unknown[] })?.shops)
      ? (data as { shops: unknown[] }).shops
      : [];

    const items = (rawList as Array<Record<string, unknown>>).map((s, i) =>
      this.normalizeShop(s, i)
    );

    const limit = params.limit ?? 10;
    const total = Number(meta?.total ?? items.length);
    const totalPages = Math.max(1, Number(meta?.totalPages ?? Math.ceil(total / limit)));

    return {
      items,
      page: Number(meta?.page ?? params.page ?? 1),
      limit,
      total,
      totalPages,
    };
  }

  async getShopById(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/shops/${shopId}`);
    return this.normalizeShop(raw);
  }

  async updateShop(shopId: string | number, payload: UpdateShopPayload): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/shops/${shopId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return this.normalizeShop(raw);
  }

  async approveShop(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/approve`,
      { method: 'PATCH' }
    );
    return this.normalizeShop(raw);
  }

  async rejectShop(
    shopId: string | number,
    rejectionReason = 'تم رفض المتجر من الإدارة'
  ): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason }),
      }
    );
    return this.normalizeShop(raw);
  }

  async suspendShop(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/suspend`,
      { method: 'PATCH' }
    );
    return this.normalizeShop(raw);
  }

  async activateShop(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/activate`,
      { method: 'PATCH' }
    );
    return this.normalizeShop(raw);
  }

  async verifyShop(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/verify`,
      { method: 'PATCH' }
    );
    return this.normalizeShop(raw);
  }

  async unverifyShop(shopId: string | number): Promise<ShopEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/shops/${shopId}/unverify`,
      { method: 'PATCH' }
    );
    return this.normalizeShop(raw);
  }
}

export const shopService = new ShopService();