import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
type  ListShopsParams,
type  ShopEntity,
  ShopService,
type  UpdateShopPayload,
  shopService as defaultShopService,
} from '../../services/admin/shopService';

export interface ShopServiceContextValue {
  service: ShopService;
  shops: ShopEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusFilter: string;
  search: string;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setStatusFilter: (status: string) => void;
  setSearch: (query: string) => void;
  refetch: (override?: ListShopsParams) => Promise<void>;
  fetchShopDetails: (id: string) => Promise<ShopEntity>;
  updateShop: (id: string, payload: UpdateShopPayload) => Promise<ShopEntity>;
  approveShop: (id: string) => Promise<ShopEntity>;
  rejectShop: (id: string, rejectionReason?: string) => Promise<ShopEntity>;
  suspendShop: (id: string) => Promise<ShopEntity>;
  activateShop: (id: string) => Promise<ShopEntity>;
  verifyShop: (id: string) => Promise<ShopEntity>;
  unverifyShop: (id: string) => Promise<ShopEntity>;
}

const ShopServiceContext = createContext<ShopServiceContextValue | null>(null);

export interface ShopServiceProviderProps {
  service?: ShopService;
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: string;
  initialSearch?: string;
  children: React.ReactNode;
}

export const ShopServiceProvider: React.FC<ShopServiceProviderProps> = ({
  service = defaultShopService,
  initialPage = 1,
  initialLimit = 10,
  initialStatus = 'ALL',
  initialSearch = '',
  children,
}) => {
  const [shops, setShops] = useState<ShopEntity[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [search, setSearch] = useState<string>(initialSearch);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (override?: ListShopsParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getShops({
          page: override?.page ?? page,
          limit: override?.limit ?? limit,
          status: override?.status ?? statusFilter,
          search: override?.search ?? search,
        });
        setShops(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل المتاجر');
      } finally {
        setLoading(false);
      }
    },
    [service, page, limit, statusFilter, search]
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const runMutation = useCallback(
    async <T,>(action: () => Promise<T>, fallbackMessage: string): Promise<T> => {
      setMutating(true);
      setError(null);
      try {
        const result = await action();
        await refetch();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : fallbackMessage;
        setError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [refetch]
  );

  const fetchShopDetails = useCallback((id: string) => service.getShopById(id), [service]);

  const updateShop = useCallback(
    (id: string, payload: UpdateShopPayload) =>
      runMutation(() => service.updateShop(id, payload), 'تعذر تعديل بيانات المتجر'),
    [service, runMutation]
  );

  const approveShop = useCallback(
    (id: string) => runMutation(() => service.approveShop(id), 'تعذر قبول المتجر'),
    [service, runMutation]
  );

  const rejectShop = useCallback(
    (id: string, rejectionReason?: string) =>
      runMutation(() => service.rejectShop(id, rejectionReason), 'تعذر رفض المتجر'),
    [service, runMutation]
  );

  const suspendShop = useCallback(
    (id: string) => runMutation(() => service.suspendShop(id), 'تعذر تعليق/حظر المتجر'),
    [service, runMutation]
  );

  const activateShop = useCallback(
    (id: string) => runMutation(() => service.activateShop(id), 'تعذر تفعيل المتجر'),
    [service, runMutation]
  );

  const verifyShop = useCallback(
    (id: string) => runMutation(() => service.verifyShop(id), 'تعذر توثيق المتجر'),
    [service, runMutation]
  );

  const unverifyShop = useCallback(
    (id: string) => runMutation(() => service.unverifyShop(id), 'تعذر إزالة توثيق المتجر'),
    [service, runMutation]
  );

  return (
    <ShopServiceContext.Provider
      value={{
        service,
        shops,
        page,
        limit,
        total,
        totalPages,
        statusFilter,
        search,
        loading,
        mutating,
        error,
        setPage,
        setStatusFilter,
        setSearch,
        refetch,
        fetchShopDetails,
        updateShop,
        approveShop,
        rejectShop,
        suspendShop,
        activateShop,
        verifyShop,
        unverifyShop,
      }}
    >
      {children}
    </ShopServiceContext.Provider>
  );
};

export function useService(): ShopServiceContextValue {
  const ctx = useContext(ShopServiceContext);
  if (!ctx) {
    throw new Error('useService يجب أن يُستخدم داخل ShopServiceProvider');
  }
  return ctx;
}