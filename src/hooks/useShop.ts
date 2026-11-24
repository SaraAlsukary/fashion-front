import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    shopService,
    type UpdateMyShopPayload,
    type ListPendingShopsParams,
    type ShopDecisionPayload,
} from '../services/market/shopService';

export const shopKeys = {
    all: ['shops'] as const,
    myShop: () => [...shopKeys.all, 'my-shop'] as const,
    adminList: (params?: ListPendingShopsParams) =>
        [...shopKeys.all, 'admin', 'list', params ?? {}] as const,
};

export const useMyShop = () => {
    return useQuery({
        queryKey: shopKeys.myShop(),
        queryFn: shopService.getMyShop,
    });
};

export const useUpdateMyShop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateMyShopPayload) => shopService.updateMyShop(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shopKeys.myShop() });
        },
    });
};

export const useAdminShops = (params?: ListPendingShopsParams) => {
    return useQuery({
        queryKey: shopKeys.adminList(params),
        queryFn: () => shopService.listShops(params),
    });
};

export const useDecideShopApproval = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            shopId,
            data,
        }: {
            shopId: string | number;
            data: ShopDecisionPayload;
        }) => shopService.decideShopApproval(shopId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shopKeys.all });
        },
    });
};

export const useRetryShopDecisionEmail = () => {
    return useMutation({
        mutationFn: (shopId: string | number) => shopService.retryDecisionEmail(shopId),
    });
};