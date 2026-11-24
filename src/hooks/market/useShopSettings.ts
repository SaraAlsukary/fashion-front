import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopService, type UpdateShopPayload } from '../../services/market/shopSettingsService';

export const shopKeys = {
  all: ['shop-owner', 'shop'] as const,
  profile: () => [...shopKeys.all, 'profile'] as const,
};

export const useMyShop = () => {
  return useQuery({
    queryKey: shopKeys.profile(),
    queryFn: () => shopService.getMyShop(),
  });
};

export const useUpdateMyShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopPayload) => shopService.updateMyShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['shop-owner', 'dashboard'] });
    },
  });
};