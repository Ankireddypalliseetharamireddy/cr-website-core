// Re-export all modular services for seamless backward compatibility
import apiClient from './apiClient';

export { apiClient };
export default apiClient;

export { authService } from './authService';
export { catalogService } from './catalogService';
export { billingService } from './billingService';
export { orderService } from './orderService';
export { transferService } from './transferService';
export { employeeService } from './employeeService';
export { dashboardService } from './dashboardService';

export * from './index';
