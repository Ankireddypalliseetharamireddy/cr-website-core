import apiClient from './apiClient';

export const catalogService = {
    getProducts: () => apiClient.get('/products/'),
    getFranchises: () => apiClient.get('/franchises/'),
    getFranchiseEmployees: (franchiseId: number) => apiClient.get(`/franchises/${franchiseId}/employees/`),
    getCategories: () => apiClient.get('/categories/'),
    getSubCategories: () => apiClient.get('/subcategories/'),
    getBrands: () => apiClient.get('/brands/'),
};

export default catalogService;
