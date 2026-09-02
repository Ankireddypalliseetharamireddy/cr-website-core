import apiClient from './apiClient';

export interface AuditPayload {
    items: Array<{ product_id: number; physical_count: number }>;
    notes?: string;
    franchise_id?: number;
}

export const orderService = {
    getOrders: (params?: { timeframe?: string; search?: string; franchise?: string }) => 
        apiClient.get('/orders/', { params }),
    getSalesSummary: (timeframe: string = 'today') => 
        apiClient.get('/orders/sales_summary/', { params: { timeframe } }),
    submitAudit: (data: AuditPayload) => 
        apiClient.post('/inventory/audit/', data),
    getAudits: () =>
        apiClient.get('/inventory/audit/'),
    getAuditDetails: (id: number) =>
        apiClient.get(`/inventory/audit/${id}/`),
    reconcileAudit: (id: number) =>
        apiClient.post(`/inventory/audit/${id}/reconcile/`),
};

export default orderService;

