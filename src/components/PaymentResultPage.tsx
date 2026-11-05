import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { checkPaymentStatus } from '../lib/api';
import {
  getPendingOrderId,
  clearPendingOrderId,
  setStoredAccessKey,
} from '../lib/storage';

interface PaymentResultPageProps {
  onGoToApp: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  whatsappRaw: string;
}

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({
  onGoToApp,
  onShowToast,
  whatsappRaw,
}) => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed' | 'timeout'>('pending');
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>('Paid Plan');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const pollTimerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Read order_id from query params or localStorage
    const params = new URLSearchParams(window.location.search);
    const queryOrderId = params.get('order_id');
    const localOrderId = getPendingOrderId();
    const finalOrderId = queryOrderId || localOrderId;

    if (finalOrderId) {
      setOrderId(finalOrderId);
      startPolling(finalOrderId);
    } else {
      setStatus('failed');
      setErrorMessage('Order ID nahi mil paya. Kripya check karein ya direct key recover karein.');
    }

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const startPolling = (targetOrderId: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 40 * 3s = 2 minutes

    const check = async () => {
      attempts += 1;
      setPollCount(attempts);

      try {
        const result = await checkPaymentStatus(targetOrderId);

        if (result.status === 'paid' && result.accessKey) {
          setStatus('paid');
          setAccessKey(result.accessKey);
          if (result.plan) setPlanName(result.plan);

          // Save Access Key in localStorage automatically
          setStoredAccessKey(result.accessKey);
          clearPendingOrderId();
          onShowToast('Payment verify ho gaya aur plan activate ho gaya!', 'success');
          return;
        }

        if (result.status === 'failed') {
          setStatus('failed');
          setErrorMessage(result.message || 'Payment fail ya cancel ho gaya hai.');
          clearPendingOrderId();
          return;
        }

        // Still pending
        if (attempts < maxAttempts) {
          pollTimerRef.current = setTimeout(check, 3000);
        } else {
          setStatus('timeout');
          setErrorMessage(
            'Bank se confirmation aane mein samay lag raha hai. Agar aapke paise kat gaye hain, toh thodi der mein refresh karein ya WhatsApp support par contact karein.'
          );
        }
      } catch (err: any) {
        if (attempts < maxAttempts) {
          pollTimerRef.current = setTimeout(check, 3000);
        } else {
          setStatus('failed');
          setErrorMessage(err.message || 'Payment check karne mein error aaya.');
        }
      }
    };

    check();
  };

  const handleCopy = () => {
    if (accessKey) {
      navigator.clipboard.writeText(accessKey);
      setCopied(true);
      onShowToast('Access Key copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 animate-fade-in">
      <div className="bg-white border border-[#E7E1D3] rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        {/* Status: Pending */}
        {status === 'pending' && (
          <div className="space-y-4 py-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-amber-500 absolute inset-0 m-auto" />
            </div>

            <h2 className="font-heading text-2xl font-extrabold text-gray-900">
              Payment Verify Ho Rahi Hai...
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              ZapUPI aur aapke bank se transaction confirm kiya ja raha hai. Kripya page refresh na karein (Check #{pollCount}).
            </p>

            {orderId && (
              <p className="font-mono text-xs text-gray-400 bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg inline-block">
                Order ID: {orderId}
              </p>
            )}
          </div>
        )}

        {/* Status: Paid (Success) */}
        {status === 'paid' && (
          <div className="space-y-6 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Payment Successful
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-gray-900 mt-2">
                Badhai Ho! {planName} Active Ho Gaya
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Aapka plan is device par automatically activate kar diya gaya hai.
              </p>
            </div>

            {/* Access Key Display Box */}
            <div className="bg-[#FAF7F0] border-2 border-emerald-500 rounded-2xl p-5 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Aapki Access Key (Save Kar Lein)
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Valid 30 Days</span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white border border-[#E7E1D3] rounded-xl p-3 shadow-2xs">
                <span className="font-mono font-extrabold text-gray-900 text-base sm:text-lg tracking-wider">
                  {accessKey}
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 leading-tight">
                💡 Is key ko kisi aur device (jaise laptop ya doosre phone) par bhi use kiya ja sakta hai.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={onGoToApp}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2 text-base transition-transform active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Abhi Content Banao</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Status: Failed or Timeout */}
        {(status === 'failed' || status === 'timeout') && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="font-heading text-2xl font-extrabold text-gray-900">
                {status === 'timeout' ? 'Payment Status Pending Hai' : 'Payment Confirm Nahi Ho Paya'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            {orderId && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
                <span className="font-semibold">Aapka Order ID:</span>{' '}
                <span className="font-mono font-bold text-gray-900">{orderId}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => orderId && startPolling(orderId)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Dobara Check Karein</span>
              </button>

              <a
                href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent(`Namaste! Mera order ID ${orderId || ''} hai, payment issue verify karwayein.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Support</span>
              </a>
            </div>

            <div>
              <button
                onClick={onGoToApp}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold underline"
              >
                Home Par Wapas Jayein
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
