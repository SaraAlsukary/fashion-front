import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/market/dashboardService';

export const dashboardKeys = {
    all: ['shop-owner', 'dashboard'] as const,
    overview: () => [...dashboardKeys.all, 'overview'] as const,
};

export const useDashboardOverview = () => {
    return useQuery({
        queryKey: dashboardKeys.overview(),
        queryFn: () => dashboardService.getOverview(),
    });
};