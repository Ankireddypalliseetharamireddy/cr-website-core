import apiClient from './apiClient';

export interface CheckoutPayload {
    customer_name: string;
    customer_phone: string;
    payment_method: string;
    payment_status: string;
    offer_id?: number;
    items: Array<{ product_id: number; quantity: number; serials?: string[]; scanned_serial_number?: string }>;
}

export const billingService = {
    lookupBarcode: (barcode: string) => apiClient.get(`/billing/lookup/?barcode=${encodeURIComponent(barcode)}`),
    checkout: (data: CheckoutPayload) => apiClient.post('/billing/checkout/', data),
};

export default billingService;
