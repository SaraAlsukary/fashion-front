import { useQuery } from '@tanstack/react-query';
import {
  reviewsService,
  type ListReviewsParams,
} from '../../services/market/reviewsService';

export const reviewKeys = {
  all: ['shop-owner', 'reviews'] as const,
  list: (params?: ListReviewsParams) =>
    [...reviewKeys.all, 'list', params] as const,
  summary: () => [...reviewKeys.all, 'summary'] as const,
};

export const useShopReviews = (params?: ListReviewsParams) => {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewsService.listReviews(params),
  });
};

export const useReviewSummary = () => {
  return useQuery({
    queryKey: reviewKeys.summary(),
    queryFn: () => reviewsService.getReviewSummary(),
  });
};