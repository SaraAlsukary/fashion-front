import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  subscriptionsService,
  type RequestSubscriptionPayload,
} from '../../services/market/subscriptionsService';

export const subscriptionKeys = {
  all: ['shop-owner', 'subscription'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...subscriptionKeys.all, 'history', params] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
};

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionsService.getCurrentSubscription(),
  });
};

export const useSubscriptionHistory = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: subscriptionKeys.history(params),
    queryFn: () => subscriptionsService.getSubscriptionHistory(params),
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionsService.listPlans(),
  });
};

export const useRequestSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestSubscriptionPayload) =>
      subscriptionsService.requestSubscription(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['shop-owner', 'dashboard'] });
    },
  });
};