import apiClient from './apiClient';

export const dashboardService = {
    getFranchiseStats: (params?: { franchise_id?: number | string; franchise?: number | string }) => 
        apiClient.get('/dashboards/franchise/', { params }),
};

export default dashboardService;
