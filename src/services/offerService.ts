import apiClient from './apiClient';

export interface ActiveOffer {
    id: number;
    title: string;
    code: string;
    description: string;
    banner_tag: string;
    offer_type: 'TIERED_PAY' | 'FLAT_DISCOUNT' | 'PERCENTAGE';
    min_cart_value: string;
    pay_amount: string | null;
    discount_value: string;
    applicable_to_all_branches: boolean;
    applicable_to_all_products: boolean;
    branches: number[];
    products: number[];
    categories: number[];
    branch_names?: string[];
    product_names?: string[];
    category_names?: string[];
}

export const offerService = {
    getActiveOffers: (franchiseId?: number | string) =>
        apiClient.get<ActiveOffer[]>('/offers/active_offers/', { params: { franchise_id: franchiseId } }),
};

export default offerService;
