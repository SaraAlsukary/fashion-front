import { useQuery } from '@tanstack/react-query';
import { homeService } from '../services/homeService';

export const homeKeys = {
  all: ['storefront', 'home'] as const,
  overview: () => [...homeKeys.all, 'overview'] as const,
  featuredShops: () => [...homeKeys.all, 'featured-shops'] as const,
  activeOffers: () => [...homeKeys.all, 'active-offers'] as const,
};

export const useHomeOverview = () => {
  return useQuery({
    queryKey: homeKeys.overview(),
    queryFn: () => homeService.getHome(),
  });
};

export const useHomeFeaturedShops = () => {
  return useQuery({
    queryKey: homeKeys.featuredShops(),
    queryFn: () => homeService.getFeaturedShops({ page: 1, limit: 10 }),
  });
};

export const useHomeActiveOffers = () => {
  return useQuery({
    queryKey: homeKeys.activeOffers(),
    queryFn: () => homeService.getActiveOffers({ page: 1, limit: 10 }),
  });
};