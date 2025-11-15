declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    notes?: {
      [key: string]: string | undefined;
    };
    order_id?: string;
    method?: {
      [key: string]: boolean;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  interface RazorpayError {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      [key: string]: any;
    };
  }

  class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<RazorpayResponse>;
  }

  export default RazorpayCheckout;
}

