import { useCallback, useEffect, useState } from 'react';
import {
  AdminService,
 type AdminUserEntity,
 type ListUsersParams,
 type UpdateUserPayload,
  adminService as defaultAdminService,
} from '../../services/admin/AdminService';

export interface UseAdminUsersOptions extends ListUsersParams {
  service?: AdminService;
}

export interface UseAdminUsersResult {
  users: AdminUserEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchUserDetails: (id: string) => Promise<AdminUserEntity>;
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<void>;
  changeUserStatus: (id: string, status: string) => Promise<void>;
  changeUserRole: (id: string, role: string) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  removeUsersBatch: (ids: string[]) => Promise<void>;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}): UseAdminUsersResult {
  const service = options.service ?? defaultAdminService;
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const search = options.search ?? '';
  const role = options.role ?? '';
  const status = options.status ?? '';

  const [users, setUsers] = useState<AdminUserEntity[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await service.getUsers({ page, limit, search, role, status });
      setUsers(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  }, [service, page, limit, search, role, status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const fetchUserDetails = useCallback(
    async (id: string) => {
      return service.getUserById(id);
    },
    [service]
  );

  const updateUser = useCallback(
    async (id: string, payload: UpdateUserPayload) => {
      setMutating(true);
      setError(null);
      try {
        await service.updateUser(id, payload);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر تحديث بيانات المستخدم';
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [service, refetch]
  );

  const changeUserStatus = useCallback(
    async (id: string, nextStatus: string) => {
      setMutating(true);
      setError(null);
      try {
        await service.setUserStatus(id, nextStatus);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر تغيير حالة المستخدم';
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [service, refetch]
  );

  const changeUserRole = useCallback(
    async (id: string, nextRole: string) => {
      setMutating(true);
      setError(null);
      try {
        await service.setUserRole(id, nextRole);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر تغيير دور المستخدم';
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [service, refetch]
  );

  const removeUser = useCallback(
    async (id: string) => {
      setMutating(true);
      setError(null);
      try {
        await service.deleteUser(id);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر حذف المستخدم';
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [service, refetch]
  );

  const removeUsersBatch = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      setMutating(true);
      setError(null);
      try {
        await Promise.all(ids.map((id) => service.deleteUser(id)));
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر حذف المستخدمين المحددين';
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [service, refetch]
  );

  return {
    users,
    page,
    limit,
    total,
    totalPages,
    loading,
    mutating,
    error,
    refetch,
    fetchUserDetails,
    updateUser,
    changeUserStatus,
    changeUserRole,
    removeUser,
    removeUsersBatch,
  };
}