import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export const catalogKeys = {
  all: ['storefront', 'catalog'] as const,
  products: (params?: Record<string, unknown>) =>
    [...catalogKeys.all, 'products', params] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
};

export const useCatalogProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  size?: string;
  sortByPrice?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogService.getProducts(params),
  });
};

export const useCatalogCategories = () => {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogService.getCategories(),
  });
};

export const useCatalogBrands = () => {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => catalogService.getBrands(),
  });
};