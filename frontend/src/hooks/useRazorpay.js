import { useCallback } from 'react';

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }

    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * useRazorpay — opens the Razorpay secure checkout popup.
 *
 * Usage:
 *   const { openPayment } = useRazorpay();
 *   openPayment({ keyId, orderId, amount, description, prefill, onSuccess, onFailure });
 *
 * onSuccess(response) — called with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * onFailure(message)  — called with a human-readable error string
 */
export function useRazorpay() {
  const openPayment = useCallback(async ({
    keyId,
    orderId,
    amount,
    currency    = 'INR',
    name        = 'FarmFi',
    description = 'Secure payment',
    prefill     = {},
    onSuccess,
    onFailure,
  }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      onFailure?.('Razorpay SDK could not be loaded. Check your internet connection.');
      return;
    }

    const options = {
      key:         keyId,
      amount,
      currency,
      name,
      description,
      order_id:    orderId,
      handler:     (response) => onSuccess?.(response),
      prefill,
      theme:       { color: '#16a34a' },
      modal:       { ondismiss: () => onFailure?.('cancelled') },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) =>
      onFailure?.(resp.error?.description || 'Payment failed'),
    );
    rzp.open();
  }, []);

  return { openPayment };
}
