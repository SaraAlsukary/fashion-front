export type BrandStatusValue = 1 | 0 | boolean | string;

export interface BrandCountsInfo {
  products: number;
}

export interface BrandEntity {
  id: string;
  name: string;
  slug?: string;
  logo: string | null;
  status: BrandStatusValue;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  counts?: BrandCountsInfo;
}

export interface ListBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedBrandsResponse {
  items: BrandEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateBrandPayload {
  name: string;
  logo?: File | string | null;
  removeLogo?: boolean;
  status?: 1 | 0;
}

export interface UpdateBrandPayload {
  name?: string;
  logo?: File | string | null;
  removeLogo?: boolean;
  status?: 1 | 0;
}

export interface BrandServiceOptions {
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

function parseBrandActive(status: unknown): boolean {
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status === 1;
  if (typeof status === 'string') {
    const normalized = status.trim().toUpperCase();
    return normalized === '1' || normalized === 'ACTIVE' || normalized === 'TRUE';
  }
  return true;
}

export class BrandService {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;

  constructor(options: BrandServiceOptions = {}) {
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
    const isFormData =
      typeof FormData !== 'undefined' && init.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
      throw new Error(payload?.message || `فشل طلب العلامات التجارية (${response.status})`);
    }

    const data = (payload?.data !== undefined ? payload.data : payload) as T;
    return { data, meta: payload?.meta };
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const { data } = await this.requestWithMeta<T>(endpoint, init);
    return data;
  }

  private normalizeBrand(raw: Record<string, unknown>, idx = 0): BrandEntity {
    const countRaw = (raw._count || raw.counts) as Record<string, unknown> | undefined;
    const statusVal = (raw.status ?? 1) as BrandStatusValue;
    const rawLogo = raw.logo !== undefined ? raw.logo : raw.image;

    return {
      id: String(raw.id ?? idx + 1),
      name: String(raw.name ?? ''),
      slug: raw.slug !== undefined ? String(raw.slug) : undefined,
      logo: rawLogo !== undefined ? (rawLogo as string | null) : null,
      status: statusVal,
      isActive: parseBrandActive(statusVal),
      createdAt:
        raw.created_at !== undefined
          ? String(raw.created_at)
          : raw.createdAt !== undefined
          ? String(raw.createdAt)
          : undefined,
      updatedAt:
        raw.updated_at !== undefined
          ? String(raw.updated_at)
          : raw.updatedAt !== undefined
          ? String(raw.updatedAt)
          : undefined,
      counts: countRaw
        ? {
            products: Number(countRaw.products ?? 0),
          }
        : undefined,
    };
  }

  private buildBrandFormData(
    payload: CreateBrandPayload | UpdateBrandPayload,
    isCreate: boolean
  ): FormData {
    const formData = new FormData();

    if (payload.name !== undefined) {
      formData.append('name', payload.name.trim());
    }

    if (isCreate && payload.status !== undefined) {
      formData.append('status', String(payload.status));
    }

    if (typeof File !== 'undefined' && payload.logo instanceof File) {
      formData.append('logo', payload.logo);
    } else if (payload.removeLogo || payload.logo === null) {
      formData.append('logo', '');
    } else if (typeof payload.logo === 'string' && payload.logo.trim() !== '') {
      formData.append('logo', payload.logo.trim());
    }

    return formData;
  }

  async getBrands(params: ListBrandsParams = {}): Promise<PaginatedBrandsResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    if (params.search !== undefined && params.search.trim() !== '') {
      query.set('search', params.search.trim());
    }

    const { data, meta } = await this.requestWithMeta<
      BrandEntity[] | { items?: unknown[]; brands?: unknown[] }
    >(`/api/v1/admin/brands?${query.toString()}`);

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { brands?: unknown[] })?.brands)
      ? (data as { brands: unknown[] }).brands
      : [];

    const items = (rawList as Array<Record<string, unknown>>).map((b, i) =>
      this.normalizeBrand(b, i)
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

  async getBrandById(brandId: string | number): Promise<BrandEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/brands/${brandId}`
    );
    return this.normalizeBrand(raw);
  }

  async createBrand(payload: CreateBrandPayload): Promise<BrandEntity> {
    const body = this.buildBrandFormData(payload, true);
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/brands`, {
      method: 'POST',
      body,
    });
    return this.normalizeBrand(raw);
  }

  async updateBrand(
    brandId: string | number,
    payload: UpdateBrandPayload
  ): Promise<BrandEntity> {
    const body = this.buildBrandFormData(payload, false);
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/brands/${brandId}`,
      {
        method: 'PATCH',
        body,
      }
    );
    return this.normalizeBrand(raw);
  }

  async setBrandStatus(brandId: string | number, status: 1 | 0): Promise<BrandEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/brands/${brandId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return this.normalizeBrand(raw);
  }

  async deleteBrand(brandId: string | number): Promise<void> {
    await this.request<unknown>(`/api/v1/admin/brands/${brandId}`, {
      method: 'DELETE',
    });
  }
}

export const brandService = new BrandService();