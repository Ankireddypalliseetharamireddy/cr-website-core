import apiClient from './apiClient';

export const employeeService = {
    getEmployees: (params?: any) => apiClient.get('/employees/', { params }),
    createEmployee: (data: any) => apiClient.post('/employees/', data),
    toggleEmployeeActive: (id: number) => apiClient.post(`/employees/${id}/toggle_active/`),
};

export default employeeService;
