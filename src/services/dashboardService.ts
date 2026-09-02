import apiClient from './apiClient';

export const dashboardService = {
    getFranchiseStats: () => apiClient.get('/dashboards/franchise/'),
};

export default dashboardService;
