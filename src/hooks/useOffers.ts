import { useQuery } from '@tanstack/react-query';
import { offersService } from '../services/offersService';

export const offersKeys = {
  all: ['offers'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    activeOnly?: boolean;
  }) => [...offersKeys.all, 'list', params] as const,
  detail: (offerId: string) => [...offersKeys.all, 'detail', offerId] as const,
  shops: (offerId: string) => [...offersKeys.all, offerId, 'shops'] as const,
  byShop: (shopId: string) => ['shops', shopId, 'offers'] as const,
};

export const useOffers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}) =>
  useQuery({
    queryKey: offersKeys.list(params),
    queryFn: () => offersService.getAll(params),
  });

export const useOfferDetails = (offerId: string) =>
  useQuery({
    queryKey: offersKeys.detail(offerId),
    queryFn: () => offersService.getById(offerId),
    enabled: Boolean(offerId),
  });

export const useOfferShops = (offerId: string) =>
  useQuery({
    queryKey: offersKeys.shops(offerId),
    queryFn: () => offersService.getOfferShops(offerId),
    enabled: Boolean(offerId),
  });

export const useShopOffers = (shopId: string) =>
  useQuery({
    queryKey: offersKeys.byShop(shopId),
    queryFn: () => offersService.getShopOffers(shopId),
    enabled: Boolean(shopId),
  });