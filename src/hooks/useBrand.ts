import { useQuery } from '@tanstack/react-query';
import { brandService } from '../services/brandService';
import type { ListProductsParams } from '../services/market/productService';

export const brandKeys = {
    all: ['brands'] as const,
    lists: () => [...brandKeys.all, 'list'] as const,
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        [...brandKeys.lists(), params ?? {}] as const,
    products: (brandId: string | number, params?: ListProductsParams) =>
        [...brandKeys.all, 'products', brandId, params ?? {}] as const,
};

export const useBrands = (
    params?: Record<string, string | number | boolean | undefined>
) => {
    return useQuery({
        queryKey: brandKeys.list(params),
        queryFn: () => brandService.listBrands(params),
    });
};

export const useBrandProducts = (
    brandId?: string | number,
    params?: ListProductsParams
) => {
    return useQuery({
        queryKey: brandKeys.products(brandId ?? '', params),
        queryFn: () => brandService.getBrandProducts(brandId!, params),
        enabled: Boolean(brandId),
    });
};