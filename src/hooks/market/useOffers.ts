import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  offersService,
  type CreateOfferPayload,
  type ListOffersParams,
  type UpdateOfferPayload,
} from '../../services/market/offersService';

export const offerKeys = {
  all: ['shop-owner', 'offers'] as const,
  list: (params?: ListOffersParams) => [...offerKeys.all, 'list', params] as const,
  detail: (id: string) => [...offerKeys.all, 'detail', id] as const,
};

export const useOffersList = (params?: ListOffersParams) => {
  return useQuery({
    queryKey: offerKeys.list(params),
    queryFn: () => offersService.listOffers(params),
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offersService.createOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      offerId,
      payload,
    }: {
      offerId: string;
      payload: UpdateOfferPayload;
    }) => offersService.updateOffer(offerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => offersService.deleteOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};

export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: string }) =>
      offersService.updateOfferStatus(offerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
};