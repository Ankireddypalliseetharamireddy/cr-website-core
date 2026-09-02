import apiClient from './apiClient';

export interface AuditPayload {
    items: Array<{ product_id: number; physical_count: number }>;
}

export const orderService = {
    getOrders: (params?: { timeframe?: string; search?: string; franchise?: string }) => 
        apiClient.get('/orders/', { params }),
    getSalesSummary: (timeframe: string = 'today') => 
        apiClient.get('/orders/sales_summary/', { params: { timeframe } }),
    submitAudit: (data: AuditPayload) => 
        apiClient.post('/inventory/audit/', data),
};

export default orderService;
