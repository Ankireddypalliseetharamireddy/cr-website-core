import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : 'https://cavree.com/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Auto-inject token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;

export const authService = {
    login: (credentials: any) => apiClient.post('/auth/login', credentials),
    getProfile: () => apiClient.get('/auth/profile/'),
};

export const catalogService = {
    getProducts: () => apiClient.get('/products/'),
    getCategories: () => apiClient.get('/categories/'),
    getSubCategories: () => apiClient.get('/subcategories/'),
    getBrands: () => apiClient.get('/brands/'),
};

export const billingService = {
    lookupBarcode: (barcode: string) => apiClient.get(`/billing/lookup/?barcode=${barcode}`),
    checkout: (data: {
        customer_name: string;
        customer_phone: string;
        payment_method: string;
        payment_status: string;
        items: Array<{ product_id: number; quantity: number }>;
    }) => apiClient.post('/billing/checkout/', data),
};

export const dashboardService = {
    getFranchiseStats: () => apiClient.get('/dashboards/franchise/'),
};

export const transferService = {
    requestTransfer: (data: { product_id: number; quantity: number }) => 
        apiClient.post('/warehouse/transfers/request/', data), // Or custom endpoint
    getTransfers: () => apiClient.get('/transfers/'),
};

export const employeeService = {
    getEmployees: () => apiClient.get('/profiles/'),
    updateEmployeeStatus: (id: number, approval_status: string) => 
        apiClient.patch(`/profiles/${id}/`, { approval_status }),
};
