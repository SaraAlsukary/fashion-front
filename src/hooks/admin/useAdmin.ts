import { useCallback, useEffect, useState } from 'react';
import {
    type AdminOrderItem,
    AdminService,
    type DashboardOverviewData,
    type SalesReportPoint,
    adminService as defaultAdminService,
} from '../../services/admin/AdminService';

export interface UseAdminOptions {
    service?: AdminService;
    page?: number;
    limit?: number;
    salesDays?: number;
}

export interface UseAdminState {
    overview: DashboardOverviewData | null;
    orders: AdminOrderItem[];
    salesPoints: SalesReportPoint[];
    totalOrders: number;
    totalPages: number;
    loading: boolean;
    ordersLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

function formatDateISO(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function useAdmin(options: UseAdminOptions = {}): UseAdminState {
    const service = options.service ?? defaultAdminService;
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const salesDays = options.salesDays ?? 7;

    const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
    const [orders, setOrders] = useState<AdminOrderItem[]>([]);
    const [salesPoints, setSalesPoints] = useState<SalesReportPoint[]>([]);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardAndSales = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (salesDays - 1));

            const [overviewData, salesData] = await Promise.all([
                service.getDashboardOverview(),
                service.getSalesReport({
                    startDate: formatDateISO(startDate),
                    endDate: formatDateISO(endDate),
                    groupBy: 'day',
                }).catch(() => []),
            ]);

            setOverview(overviewData);
            setSalesPoints(salesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات لوحة التحكم');
        } finally {
            setLoading(false);
        }
    }, [service, salesDays]);

    const fetchOrdersPage = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const ordersRes = await service.getOrders({ page, limit });
            setOrders(ordersRes.items);
            setTotalOrders(ordersRes.total);
            setTotalPages(ordersRes.totalPages);
        } catch (err) {
            setError((prev) => prev || (err instanceof Error ? err.message : 'تعذر تحميل الطلبات'));
        } finally {
            setOrdersLoading(false);
        }
    }, [service, page, limit]);

    useEffect(() => {
        void fetchDashboardAndSales();
    }, [fetchDashboardAndSales]);

    useEffect(() => {
        void fetchOrdersPage();
    }, [fetchOrdersPage]);

    const refetch = useCallback(async () => {
        await Promise.all([fetchDashboardAndSales(), fetchOrdersPage()]);
    }, [fetchDashboardAndSales, fetchOrdersPage]);

    return {
        overview,
        orders,
        salesPoints,
        totalOrders,
        totalPages,
        loading,
        ordersLoading,
        error,
        refetch,
    };
}