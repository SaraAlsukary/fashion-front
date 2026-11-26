export type CategoryStatusValue = 1 | 0 | boolean | string;

export interface CategoryParentInfo {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  status?: CategoryStatusValue;
}

export interface CategoryCountsInfo {
  products: number;
  children: number;
}

export interface CategoryEntity {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  image: string | null;
  status: CategoryStatusValue;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  parent?: CategoryParentInfo | null;
  counts?: CategoryCountsInfo;
}

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedCategoriesResponse {
  items: CategoryEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: string | number | null;
  image?: File | string | null;
  removeImage?: boolean;
  status?: 1 | 0;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: string | number | null;
  image?: File | string | null;
  removeImage?: boolean;
  status?: 1 | 0;
}

export interface CategoryServiceOptions {
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

export function slugifyCategoryName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-ء-ي]+/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCategoryActive(status: unknown): boolean {
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status === 1;
  if (typeof status === 'string') {
    const normalized = status.trim().toUpperCase();
    return normalized === '1' || normalized === 'ACTIVE' || normalized === 'TRUE';
  }
  return true;
}

function normalizeParentIdValue(
  parentId: string | number | null | undefined
): number | string | null {
  if (parentId === undefined || parentId === null || String(parentId).trim() === '') {
    return null;
  }
  const asNum = Number(parentId);
  return Number.isNaN(asNum) ? String(parentId) : asNum;
}

export class CategoryService {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;

  constructor(options: CategoryServiceOptions = {}) {
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
      throw new Error(payload?.message || `فشل طلب الفئات (${response.status})`);
    }

    const data = (payload?.data !== undefined ? payload.data : payload) as T;
    return { data, meta: payload?.meta };
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const { data } = await this.requestWithMeta<T>(endpoint, init);
    return data;
  }

  private normalizeCategory(raw: Record<string, unknown>, idx = 0): CategoryEntity {
    const parentRaw = raw.parent as Record<string, unknown> | undefined;
    const countRaw = (raw._count || raw.counts) as Record<string, unknown> | undefined;
    const rawParentId = raw.parent_id !== undefined ? raw.parent_id : raw.parentId;
    const statusVal = (raw.status ?? 1) as CategoryStatusValue;

    return {
      id: String(raw.id ?? idx + 1),
      parentId:
        rawParentId !== undefined && rawParentId !== null && String(rawParentId) !== ''
          ? String(rawParentId)
          : null,
      name: String(raw.name ?? ''),
      slug: String(raw.slug ?? ''),
      image: raw.image !== undefined ? (raw.image as string | null) : null,
      status: statusVal,
      isActive: parseCategoryActive(statusVal),
      createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
      updatedAt:
        raw.updated_at !== undefined
          ? String(raw.updated_at)
          : raw.updatedAt !== undefined
          ? String(raw.updatedAt)
          : undefined,
      parent: parentRaw
        ? {
            id: String(parentRaw.id ?? ''),
            name: String(parentRaw.name ?? ''),
            slug: String(parentRaw.slug ?? ''),
            image: parentRaw.image !== undefined ? (parentRaw.image as string | null) : null,
            status: parentRaw.status as CategoryStatusValue | undefined,
          }
        : null,
      counts: countRaw
        ? {
            products: Number(countRaw.products ?? 0),
            children: Number(countRaw.children ?? 0),
          }
        : undefined,
    };
  }

  private buildCategoryBody(
    payload: CreateCategoryPayload | UpdateCategoryPayload,
    isCreate: boolean
  ): BodyInit {
    const hasFile = typeof File !== 'undefined' && payload.image instanceof File;

    if (hasFile) {
      const formData = new FormData();
      if (payload.name !== undefined) {
        formData.append('name', payload.name.trim());
      }
      if (payload.slug !== undefined) {
        formData.append('slug', payload.slug.trim());
      }
      if (payload.parentId !== undefined || isCreate) {
        const normalizedParent = normalizeParentIdValue(payload.parentId);
        if (normalizedParent !== null) {
          formData.append('parentId', String(normalizedParent));
        }
      }
      if (isCreate && payload.status !== undefined) {
        formData.append('status', String(payload.status));
      }
      formData.append('image', payload.image as File);
      return formData;
    }

    const jsonBody: Record<string, unknown> = {};
    if (payload.name !== undefined) {
      jsonBody.name = payload.name.trim();
    }
    if (payload.slug !== undefined) {
      jsonBody.slug = payload.slug.trim();
    }
    if (payload.parentId !== undefined || isCreate) {
      jsonBody.parentId = normalizeParentIdValue(payload.parentId);
    }
    if (isCreate && payload.status !== undefined) {
      jsonBody.status = payload.status;
    }
    if (payload.removeImage) {
      jsonBody.image = null;
    } else if (typeof payload.image === 'string') {
      const trimmed = payload.image.trim();
      jsonBody.image = trimmed ? trimmed : null;
    } else if (payload.image === null) {
      jsonBody.image = null;
    }

    return JSON.stringify(jsonBody);
  }

  async getCategories(params: ListCategoriesParams = {}): Promise<PaginatedCategoriesResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    if (params.search !== undefined && params.search.trim() !== '') {
      query.set('search', params.search.trim());
    }

    const { data, meta } = await this.requestWithMeta<
      CategoryEntity[] | { items?: unknown[]; categories?: unknown[] }
    >(`/api/v1/admin/categories?${query.toString()}`);

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { categories?: unknown[] })?.categories)
      ? (data as { categories: unknown[] }).categories
      : [];

    const items = (rawList as Array<Record<string, unknown>>).map((c, i) =>
      this.normalizeCategory(c, i)
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

  async getCategoryById(categoryId: string | number): Promise<CategoryEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/categories/${categoryId}`
    );
    return this.normalizeCategory(raw);
  }

  async createCategory(payload: CreateCategoryPayload): Promise<CategoryEntity> {
    const body = this.buildCategoryBody(
      {
        ...payload,
        slug: payload.slug?.trim() || slugifyCategoryName(payload.name),
      },
      true
    );

    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/categories`, {
      method: 'POST',
      body,
    });
    return this.normalizeCategory(raw);
  }

  async updateCategory(
    categoryId: string | number,
    payload: UpdateCategoryPayload
  ): Promise<CategoryEntity> {
    const body = this.buildCategoryBody(payload, false);

    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/categories/${categoryId}`,
      {
        method: 'PATCH',
        body,
      }
    );
    return this.normalizeCategory(raw);
  }

  async setCategoryStatus(
    categoryId: string | number,
    status: 1 | 0
  ): Promise<CategoryEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/categories/${categoryId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return this.normalizeCategory(raw);
  }

  async deleteCategory(categoryId: string | number): Promise<void> {
    await this.request<unknown>(`/api/v1/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }
}

export const categoryService = new CategoryService();