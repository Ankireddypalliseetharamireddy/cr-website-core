import apiClient from './apiClient';

export interface TransferRequestPayload {
    product_id: number;
    quantity: number;
}

export const transferService = {
    requestTransfer: (data: TransferRequestPayload) => 
        apiClient.post('/transfers/request/', data),
    getTransfers: () => apiClient.get('/transfers/'),
    updateTransferStatus: (id: number, status: string) =>
        apiClient.post(`/transfers/${id}/update-status/`, { status }),
};

export default transferService;
