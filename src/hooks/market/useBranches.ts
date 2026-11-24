import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    branchService,
    type CreateBranchPayload,
    type UpdateBranchPayload,
    type UpdateBranchStatusPayload,
} from '../../services/market/branchService';

export const branchKeys = {
    all: ['shop-owner', 'branches'] as const,
    lists: () => [...branchKeys.all, 'list'] as const,
    list: () => [...branchKeys.lists()] as const,
    details: () => [...branchKeys.all, 'detail'] as const,
    detail: (branchId: string | number) => [...branchKeys.details(), String(branchId)] as const,
};

// ============================================================================
// هوكات القراءة (Queries)
// ============================================================================

export const useBranches = () => {
    return useQuery({
        queryKey: branchKeys.list(),
        queryFn: () => branchService.listBranches(),
    });
};

export const useBranch = (branchId: string | number | undefined) => {
    return useQuery({
        queryKey: branchKeys.detail(branchId ?? ''),
        queryFn: () => branchService.getBranch(branchId!),
        enabled: Boolean(branchId),
    });
};

// ============================================================================
// هوكات التعديل (Mutations)
// ============================================================================

export const useCreateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBranchPayload) => branchService.createBranch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
        },
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            branchId,
            data,
        }: {
            branchId: string | number;
            data: UpdateBranchPayload;
        }) => branchService.updateBranch(branchId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: branchKeys.detail(variables.branchId),
            });
        },
    });
};

export const useDeactivateBranch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (branchId: string | number) => branchService.deactivateBranch(branchId),
        onSuccess: (_, branchId) => {
            queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
            queryClient.removeQueries({ queryKey: branchKeys.detail(branchId) });
        },
    });
};

export const useUpdateBranchStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            branchId,
            data,
        }: {
            branchId: string | number;
            data: UpdateBranchStatusPayload;
        }) => branchService.updateBranchStatus(branchId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: branchKeys.detail(variables.branchId),
            });
        },
    });
};