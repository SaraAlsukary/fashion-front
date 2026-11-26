import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type CategoryEntity,
  CategoryService,
  type CreateCategoryPayload,
  type ListCategoriesParams,
  type UpdateCategoryPayload,
  categoryService as defaultCategoryService,
} from '../../services/admin/categoryService';

export interface CategoryServiceContextValue {
  service: CategoryService;
  categories: CategoryEntity[];
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
  refetch: (override?: ListCategoriesParams) => Promise<void>;
  fetchCategoryDetails: (id: string) => Promise<CategoryEntity>;
  createCategory: (payload: CreateCategoryPayload) => Promise<CategoryEntity>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<CategoryEntity>;
  setCategoryStatus: (id: string, status: 1 | 0) => Promise<CategoryEntity>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryServiceContext = createContext<CategoryServiceContextValue | null>(null);

export interface CategoryServiceProviderProps {
  service?: CategoryService;
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  children: React.ReactNode;
}

export const CategoryServiceProvider: React.FC<CategoryServiceProviderProps> = ({
  service = defaultCategoryService,
  initialPage = 1,
  initialLimit = 10,
  initialSearch = '',
  children,
}) => {
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);
  const [search, setSearch] = useState<string>(initialSearch);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [mutating, setMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (override?: ListCategoriesParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getCategories({
          page: override?.page ?? page,
          limit: override?.limit ?? limit,
          search: override?.search ?? search,
        });
        setCategories(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل الفئات');
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

  const fetchCategoryDetails = useCallback(
    (id: string) => service.getCategoryById(id),
    [service]
  );

  const createCategory = useCallback(
    (payload: CreateCategoryPayload) =>
      runMutation(() => service.createCategory(payload), 'تعذر إضافة الفئة'),
    [service, runMutation]
  );

  const updateCategory = useCallback(
    (id: string, payload: UpdateCategoryPayload) =>
      runMutation(() => service.updateCategory(id, payload), 'تعذر تعديل الفئة'),
    [service, runMutation]
  );

  const setCategoryStatus = useCallback(
    (id: string, status: 1 | 0) =>
      runMutation(() => service.setCategoryStatus(id, status), 'تعذر تحديث حالة الفئة'),
    [service, runMutation]
  );

  const deleteCategory = useCallback(
    (id: string) =>
      runMutation(() => service.deleteCategory(id), 'تعذر حذف الفئة'),
    [service, runMutation]
  );

  return (
    <CategoryServiceContext.Provider
      value={{
        service,
        categories,
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
        fetchCategoryDetails,
        createCategory,
        updateCategory,
        setCategoryStatus,
        deleteCategory,
      }}
    >
      {children}
    </CategoryServiceContext.Provider>
  );
};

export function useCategory(): CategoryServiceContextValue {
  const ctx = useContext(CategoryServiceContext);
  if (!ctx) {
    throw new Error('useCategory يجب أن يُستخدم داخل CategoryServiceProvider');
  }
  return ctx;
}