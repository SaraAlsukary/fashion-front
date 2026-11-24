import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { ListProductsParams } from '../services/market/productService';

export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        [...categoryKeys.lists(), params ?? {}] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (categoryId: string | number) =>
        [...categoryKeys.details(), categoryId] as const,
    products: (categoryId: string | number, params?: ListProductsParams) =>
        [...categoryKeys.all, 'products', categoryId, params ?? {}] as const,
};

export const useCategories = (
    params?: Record<string, string | number | boolean | undefined>
) => {
    return useQuery({
        queryKey: categoryKeys.list(params),
        queryFn: () => categoryService.listCategories(params),
    });
};

export const useCategory = (categoryId?: string | number) => {
    return useQuery({
        queryKey: categoryKeys.detail(categoryId ?? ''),
        queryFn: () => categoryService.getCategoryById(categoryId!),
        enabled: Boolean(categoryId),
    });
};

export const useCategoryProducts = (
    categoryId?: string | number,
    params?: ListProductsParams
) => {
    return useQuery({
        queryKey: categoryKeys.products(categoryId ?? '', params),
        queryFn: () => categoryService.getCategoryProducts(categoryId!, params),
        enabled: Boolean(categoryId),
    });
};