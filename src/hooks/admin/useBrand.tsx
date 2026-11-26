import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type BrandEntity,
  BrandService,
  type CreateBrandPayload,
  type ListBrandsParams,
  type UpdateBrandPayload,
  brandService as defaultBrandService,
} from '../../services/admin/brandService';

export interface BrandServiceContextValue {
  service: BrandService;
  brands: BrandEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setSearch: (query: string) => void;
  refetch: (override?: ListBrandsParams) => Promise<void>;
  fetchBrandDetails: (id: string) => Promise<BrandEntity>;
  createBrand: (payload: CreateBrandPayload) => Promise<BrandEntity>;
  updateBrand: (id: string, payload: UpdateBrandPayload) => Promise<BrandEntity>;
  setBrandStatus: (id: string, status: 1 | 0) => Promise<BrandEntity>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandServiceContext = createContext<BrandServiceContextValue | null>(null);

export interface BrandServiceProviderProps {
  service?: BrandService;
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  children: React.ReactNode;
}

export const BrandServiceProvider: React.FC<BrandServiceProviderProps> = ({
  service = defaultBrandService,
  initialPage = 1,
  initialLimit = 10,
  initialSearch = '',
  children,
}) => {
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);
  const [search, setSearch] = useState<string>(initialSearch);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (override?: ListBrandsParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getBrands({
          page: override?.page ?? page,
          limit: override?.limit ?? limit,
          search: override?.search ?? search,
        });
        setBrands(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل العلامات التجارية');
      } finally {
        setLoading(false);
      }
    },
    [service, page, limit, search]
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

  const fetchBrandDetails = useCallback(
    (id: string) => service.getBrandById(id),
    [service]
  );

  const createBrand = useCallback(
    (payload: CreateBrandPayload) =>
      runMutation(() => service.createBrand(payload), 'تعذر إضافة العلامة التجارية'),
    [service, runMutation]
  );

  const updateBrand = useCallback(
    (id: string, payload: UpdateBrandPayload) =>
      runMutation(() => service.updateBrand(id, payload), 'تعذر تعديل العلامة التجارية'),
    [service, runMutation]
  );

  const setBrandStatus = useCallback(
    (id: string, status: 1 | 0) =>
      runMutation(() => service.setBrandStatus(id, status), 'تعذر تحديث حالة العلامة التجارية'),
    [service, runMutation]
  );

  const deleteBrand = useCallback(
    (id: string) =>
      runMutation(() => service.deleteBrand(id), 'تعذر حذف العلامة التجارية'),
    [service, runMutation]
  );

  return (
    <BrandServiceContext.Provider
      value={{
        service,
        brands,
        page,
        limit,
        total,
        totalPages,
        search,
        loading,
        mutating,
        error,
        setPage,
        setSearch,
        refetch,
        fetchBrandDetails,
        createBrand,
        updateBrand,
        setBrandStatus,
        deleteBrand,
      }}
    >
      {children}
    </BrandServiceContext.Provider>
  );
};

export function useBrand(): BrandServiceContextValue {
  const ctx = useContext(BrandServiceContext);
  if (!ctx) {
    throw new Error('useBrand يجب أن يُستخدم داخل BrandServiceProvider');
  }
  return ctx;
}