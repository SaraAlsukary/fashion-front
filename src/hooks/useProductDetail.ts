import { useQuery } from '@tanstack/react-query';
import { productDetailService } from '../services/productDetailService';

export const productDetailKeys = {
  all: ['storefront', 'products'] as const,
  detail: (id: string) => [...productDetailKeys.all, 'detail', id] as const,
  related: (id: string) => [...productDetailKeys.all, 'related', id] as const,
};

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: productDetailKeys.detail(id || ''),
    queryFn: () => productDetailService.getProductById(id!),
    enabled: Boolean(id),
  });
};

export const useRelatedProducts = (id?: string) => {
  return useQuery({
    queryKey: productDetailKeys.related(id || ''),
    queryFn: () => productDetailService.getRelatedProducts(id!),
    enabled: Boolean(id),
  });
};