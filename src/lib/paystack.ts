import { supabase } from "@/integrations/supabase/client";

interface InitializePaymentParams {
  type: "order";
  amount: number;
  email: string;
  userId: string;
  metadata?: {
    orderId?: string;
  };
}

interface PaymentResponse {
  success: boolean;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  type?: string;
  orderId?: string;
  error?: string;
  message?: string;
}

export async function initializePayment(params: InitializePaymentParams): Promise<PaymentResponse> {
  const { data, error } = await supabase.functions.invoke("paystack-initialize", {
    body: params,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}

export async function verifyPayment(reference: string): Promise<VerifyResponse> {
  const { data, error } = await supabase.functions.invoke("paystack-verify", {
    body: { reference },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}
