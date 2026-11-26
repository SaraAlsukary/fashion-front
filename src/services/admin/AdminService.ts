export type ApiOrderStatus =
  | 'NEW'
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface DashboardOverviewData {
  users: {
    total: number;
    customers: number;
    shopOwners: number;
    admins: number;
    active: number;
    blocked: number;
  };
  shops: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  products: {
    total: number;
    active: number;
    hidden: number;
    archived: number;
  };
  orders: {
    total: number;
    new: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  financial: {
    successfulPayments: string | number;
    pendingPayments: string | number;
    failedPayments: string | number;
    refundedPayments: string | number;
    subscriptionRevenue: string | number;
    commissionRevenue: string | number;
  };
  subscriptions: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    shopsWithActiveSubscription: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  recentActivity?: {
    orders?: Array<{
      id: string | number;
      order_number?: string;
      orderNumber?: string;
      customer_name?: string;
      customerName?: string;
      user?: { name?: string };
      status: string;
      payment_status?: string;
      total?: string | number;
      amount?: string | number;
      created_at?: string;
      createdAt?: string;
    }>;
  };
}

export interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  amount: string | number;
  date: string;
}

export interface PaginatedOrdersResponse {
  items: AdminOrderItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SalesReportPoint {
  label: string;
  sales: number;
}

export type AdminUserRoleApi = 'ADMIN' | 'SHOP_OWNER' | 'CUSTOMER' | string;
export type AdminUserStatusApi = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED' | string;

export interface AdminUserEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AdminUserRoleApi;
  status: AdminUserStatusApi;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface PaginatedUsersResponse {
  items: AdminUserEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string | null;
  email?: string;
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

export interface AdminServiceOptions {
  baseUrl?: string;
  getToken?: () => string | null;
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

export class AdminService {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;

  constructor(options: AdminServiceOptions = {}) {
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
      throw new Error(payload?.message || `فشل الطلب (${response.status})`);
    }

    const data = (payload?.data !== undefined ? payload.data : payload) as T;
    return { data, meta: payload?.meta };
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const { data } = await this.requestWithMeta<T>(endpoint, init);
    return data;
  }

  private normalizeUser(raw: Record<string, unknown>, idx = 0): AdminUserEntity {
    return {
      id: String(raw.id ?? idx + 1),
      name: String(raw.name ?? ''),
      email: String(raw.email ?? ''),
      phone: raw.phone !== undefined ? (raw.phone as string | null) : null,
      role: String(raw.role ?? 'CUSTOMER'),
      status: String(raw.status ?? 'ACTIVE'),
      emailVerifiedAt:
        raw.email_verified_at !== undefined
          ? (raw.email_verified_at as string | null)
          : (raw.emailVerifiedAt as string | null) ?? null,
      createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
      updatedAt:
        raw.updated_at !== undefined
          ? String(raw.updated_at)
          : raw.updatedAt !== undefined
          ? String(raw.updatedAt)
          : undefined,
    };
  }

  // ---------------- Dashboard & Reports & Orders ----------------

  async getDashboardOverview(): Promise<DashboardOverviewData> {
    return this.request<DashboardOverviewData>('/api/v1/admin/dashboard');
  }

  async getOrders(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      shopId?: string;
      userId?: string;
      status?: string;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<PaginatedOrdersResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));

    const optionalKeys: Array<keyof typeof params> = [
      'search',
      'shopId',
      'userId',
      'status',
      'paymentStatus',
      'startDate',
      'endDate',
    ];

    for (const key of optionalKeys) {
      const val = params[key];
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    }

    const { data: raw, meta } = await this.requestWithMeta<
      | PaginatedOrdersResponse
      | {
          orders?: Array<Record<string, unknown>>;
          items?: Array<Record<string, unknown>>;
          data?: Array<Record<string, unknown>>;
          meta?: { total?: number; totalPages?: number; page?: number; limit?: number };
          total?: number;
          totalPages?: number;
        }
    >(`/api/v1/admin/orders?${query.toString()}`);

    const rawList = Array.isArray(raw)
      ? raw
      : (raw as { items?: unknown[]; orders?: unknown[]; data?: unknown[] }).items ||
        (raw as { orders?: unknown[] }).orders ||
        (raw as { data?: unknown[] }).data ||
        [];

    const normalizedItems: AdminOrderItem[] = (rawList as Array<Record<string, unknown>>).map(
      (row, idx) => {
        const userObj = row.user as { name?: string } | undefined;
        const customerObj = row.customer as { name?: string } | undefined;
        return {
          id: String(row.id ?? idx + 1),
          orderNumber: String(
            row.orderNumber ?? row.order_number ?? `#ORD-${row.id ?? idx + 1}`
          ),
          customerName: String(
            row.customerName ?? row.customer_name ?? userObj?.name ?? customerObj?.name ?? 'عميل'
          ),
          status: String(row.status ?? 'PENDING'),
          amount: (row.total ?? row.amount ?? 0) as string | number,
          date: String(row.date ?? row.created_at ?? row.createdAt ?? ''),
        };
      }
    );

    const resolvedMeta =
      meta || (raw as { meta?: { total?: number; totalPages?: number } }).meta;
    const total = Number(
      resolvedMeta?.total ?? (raw as { total?: number }).total ?? normalizedItems.length
    );
    const limit = params.limit ?? 10;
    const totalPages = Math.max(
      1,
      Number(
        resolvedMeta?.totalPages ??
          (raw as { totalPages?: number }).totalPages ??
          Math.ceil(total / limit)
      )
    );

    return {
      items: normalizedItems,
      page: params.page ?? 1,
      limit,
      total,
      totalPages,
    };
  }

  async getSalesReport(
    params: {
      startDate?: string;
      endDate?: string;
      groupBy?: 'day' | 'week' | 'month';
    } = {}
  ): Promise<SalesReportPoint[]> {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    query.set('groupBy', params.groupBy || 'day');

    const raw = await this.request<
      | SalesReportPoint[]
      | {
          points?: Array<Record<string, unknown>>;
          series?: Array<Record<string, unknown>>;
        }
    >(`/api/v1/admin/reports/sales?${query.toString()}`);

    const list = Array.isArray(raw) ? raw : raw?.points || raw?.series || [];

    return (list as Array<Record<string, unknown>>).map((item) => ({
      label: String(item.label ?? item.day ?? item.date ?? ''),
      sales: Number(item.sales ?? item.total ?? item.amount ?? 0),
    }));
  }

  // ---------------- Users Management ----------------

  async getUsers(params: ListUsersParams = {}): Promise<PaginatedUsersResponse> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    if (params.search !== undefined) query.set('search', params.search);
    if (params.role !== undefined) query.set('role', params.role);
    if (params.status !== undefined) query.set('status', params.status);

    const { data, meta } = await this.requestWithMeta<
      | AdminUserEntity[]
      | { items?: unknown[]; users?: unknown[] }
    >(`/api/v1/admin/users?${query.toString()}`);

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] })?.items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { users?: unknown[] })?.users)
      ? (data as { users: unknown[] }).users
      : [];

    const items = (rawList as Array<Record<string, unknown>>).map((u, i) =>
      this.normalizeUser(u, i)
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

  async getUserById(userId: string | number): Promise<AdminUserEntity> {
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/users/${userId}`);
    return this.normalizeUser(raw);
  }

  async updateUser(userId: string | number, payload: UpdateUserPayload): Promise<AdminUserEntity> {
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return this.normalizeUser(raw);
  }

  async setUserStatus(
    userId: string | number,
    status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | string
  ): Promise<AdminUserEntity> {
    const raw = await this.request<Record<string, unknown>>(
      `/api/v1/admin/users/${userId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return this.normalizeUser(raw);
  }

  async setUserRole(
    userId: string | number,
    role: 'ADMIN' | 'SHOP_OWNER' | 'CUSTOMER' | string
  ): Promise<AdminUserEntity> {
    const raw = await this.request<Record<string, unknown>>(`/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return this.normalizeUser(raw);
  }

  async deleteUser(userId: string | number): Promise<void> {
    await this.request<unknown>(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const adminService = new AdminService();