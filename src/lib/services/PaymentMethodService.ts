export interface PaymentMethod {
    _id: string;
    name: string;
    logo: string;
    accountDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        walletAddress?: string;
        network?: string;
    };
    instructions?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

let cachedMethods: PaymentMethod[] | null = null;
let fetchPromise: Promise<PaymentMethod[]> | null = null;

export const getPaymentMethods = async (forceRefetch = false): Promise<PaymentMethod[]> => {
    if (forceRefetch) {
        cachedMethods = null;
        fetchPromise = null;
    }

    if (cachedMethods) return cachedMethods;
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetch('/api/payment-methods')
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                cachedMethods = result.data;
                return cachedMethods as PaymentMethod[];
            }
            fetchPromise = null;
            return [];
        })
        .catch(error => {
            console.error('Error fetching payment methods:', error);
            fetchPromise = null;
            return [];
        });

    return fetchPromise;
};

export const clearPaymentMethodCache = () => {
    cachedMethods = null;
    fetchPromise = null;
};
