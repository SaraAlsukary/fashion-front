import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ordersService,
  type ListOrdersParams,
} from '../../services/market/ordersService';

export const orderKeys = {
  all: ['shop-owner', 'orders'] as const,
  list: (params?: ListOrdersParams) => [...orderKeys.all, 'list', params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const useOrdersList = (params?: ListOrdersParams) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersService.listOrders(params),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ['shop-owner', 'dashboard'] });
    },
  });
};