import React, { useState } from 'react';
import { X, Check, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { PlanConfig } from '../types';
import { createOrder } from '../lib/api';
import { setPendingOrderId } from '../lib/storage';

interface CheckoutModalProps {
  plan: PlanConfig;
  currentAccessKey?: string;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  currentAccessKey,
  onClose,
  onShowToast,
}) => {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    setError(null);
    setLoading(true);

    try {
      const result = await createOrder({
        plan: plan.id as 'starter' | 'pro',
        renewKey: currentAccessKey,
        whatsapp: whatsapp ? whatsapp.trim() : undefined,
      });

      // Save order_id in localStorage before redirect
      if (result.order_id) {
        setPendingOrderId(result.order_id);
      }

      // CRITICAL: Open in SAME tab as required
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        throw new Error('Payment link nahi mil paya. Dobara try karein.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Payment shuru karne mein error aaya.';
      setError(msg);
      onShowToast(msg, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full">
                {currentAccessKey ? 'Plan Renewal' : 'Instant Activation'}
              </span>
            </div>
            <h3 className="font-heading text-xl font-extrabold tracking-tight">
              {plan.name}
            </h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              30 din validity • {plan.limit} content generations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Tag */}
          <div className="flex items-baseline justify-between border-b border-[#E7E1D3] pb-4 mb-4">
            <span className="text-sm font-semibold text-gray-600">Total Payable Amount</span>
            <div className="text-right">
              <span className="font-heading text-3xl font-extrabold text-gray-900">
                ₹{plan.price}
              </span>
              <span className="text-xs text-gray-500 block">One-time payment • No auto-debit</span>
            </div>
          </div>

          {/* Renewal notice */}
          {currentAccessKey && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
              <p className="font-semibold">Key Renew Hogi: {currentAccessKey}</p>
              <p className="text-emerald-700 mt-0.5">
                Aapki validity current date se 30 din aage extend ho jayegi aur limit reset ho jayegi.
              </p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2 mb-5">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Number <span className="text-gray-400 font-normal">(Optional - Renewal reminder ke liye)</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9876543210"
                maxLength={15}
                className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Aapka number safe hai. Hum sirf plan expiry par zaroori reminder bhejte hain.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>ZapUPI Gateway Open Ho Raha Hai...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>ZapUPI Se Pay Karein ₹{plan.price}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>UPI, GPay, PhonePe, Paytm supported • 100% Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
