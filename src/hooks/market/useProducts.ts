import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    productService,
    type ListProductsParams,
    type CreateProductPayload,
    type UpdateProductPayload,
    type UpdateProductStatusPayload,
    type ProductImageInput,
    type UpdateProductImagePayload,
    type ProductVariantInput,
    type UpdateProductVariantPayload,
} from '../../services/market/productService';

export const productKeys = {
    all: ['shop-owner', 'products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (params?: ListProductsParams) => [...productKeys.lists(), params ?? {}] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (productId: string | number) => [...productKeys.details(), String(productId)] as const,
};

// ============================================================================
// هوكات القراءة (Queries)
// ============================================================================

export const useProducts = (params?: ListProductsParams) => {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => productService.listProducts(params),
    });
};

export const useProduct = (productId: string | number | undefined) => {
    return useQuery({
        queryKey: productKeys.detail(productId ?? ''),
        queryFn: () => productService.getProduct(productId!),
        enabled: Boolean(productId),
    });
};

// ============================================================================
// هوكات تعديل المنتجات (Product Mutations)
// ============================================================================

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductPayload) => productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            data,
        }: {
            productId: string | number;
            data: UpdateProductPayload;
        }) => productService.updateProduct(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
        },
    });
};

export const useArchiveProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string | number) => productService.archiveProduct(productId),
        onSuccess: (_, productId) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
        },
    });
};

export const useUpdateProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            data,
        }: {
            productId: string | number;
            data: UpdateProductStatusPayload;
        }) => productService.updateProductStatus(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
        },
    });
};

// ============================================================================
// هوكات صور المنتج (Product Images Mutations)
// ============================================================================

export const useAddProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            data,
        }: {
            productId: string | number;
            data: ProductImageInput;
        }) => productService.addProductImage(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useUpdateProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            imageId,
            data,
        }: {
            productId: string | number;
            imageId: string | number;
            data: UpdateProductImagePayload;
        }) => productService.updateProductImage(productId, imageId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useDeleteProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            imageId,
        }: {
            productId: string | number;
            imageId: string | number;
        }) => productService.deleteProductImage(productId, imageId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

// ============================================================================
// هوكات متغيرات المنتج (Product Variants Mutations)
// ============================================================================

export const useAddProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            data,
        }: {
            productId: string | number;
            data: ProductVariantInput;
        }) => productService.addProductVariant(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useUpdateProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            variantId,
            data,
        }: {
            productId: string | number;
            variantId: string | number;
            data: UpdateProductVariantPayload;
        }) => productService.updateProductVariant(productId, variantId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useDeleteProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            variantId,
        }: {
            productId: string | number;
            variantId: string | number;
        }) => productService.deleteProductVariant(productId, variantId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId),
            });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};