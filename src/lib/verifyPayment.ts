interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: {
      id: number;
      email: string;
    };
  };
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerificationResponse> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Paystack verification failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function initializePaystackPayment(data: {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url?: string;
  metadata?: any;
}) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Paystack initialization failed: ${response.statusText}`);
  }

  return await response.json();
}

export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `MIC_${timestamp}_${random.toUpperCase()}`;
}

export function convertToKobo(nairaAmount: number): number {
  return Math.round(nairaAmount * 100);
}

export function convertFromKobo(koboAmount: number): number {
  return koboAmount / 100;
}