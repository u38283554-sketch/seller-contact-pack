import React, { useState } from 'react';
import { X, Search, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { recoverKeyByOrderId } from '../lib/api';
import { setStoredAccessKey } from '../lib/storage';

interface RecoverKeyModalProps {
  onClose: () => void;
  onKeyRecovered: (key: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  supportWhatsappRaw: string;
}

export const RecoverKeyModal: React.FC<RecoverKeyModalProps> = ({
  onClose,
  onKeyRecovered,
  onShowToast,
  supportWhatsappRaw,
}) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveredKey, setRecoveredKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderId.trim();
    if (!clean) {
      setError('Kripya apna Order ID enter karein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await recoverKeyByOrderId(clean);

      if (res.found && res.status === 'paid' && res.accessKey) {
        setRecoveredKey(res.accessKey);
        setStoredAccessKey(res.accessKey);
        onKeyRecovered(res.accessKey);
        onShowToast('Access Key mil gayi aur activate ho gayi!', 'success');
      } else if (res.message) {
        setError(res.message);
      } else {
        setError('Order mila lekin abhi payment verify nahi hui. Kripya 2 minute baad try karein.');
      }
    } catch (err: any) {
      setError(err.message || 'Key recover karne mein error aaya.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (recoveredKey) {
      navigator.clipboard.writeText(recoveredKey);
      setCopied(true);
      onShowToast('Access Key copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-amber-300">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">Key Recover Karein</h3>
              <p className="text-emerald-100 text-xs">Payment ho gaya par key screen band ho gayi?</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!recoveredKey ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Order ID (Aapke payment page ya SMS mein dekhein)
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. SCPM3K9A7F8"
                  className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3.5 py-2.5 font-mono text-sm tracking-wider text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 uppercase"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Jab aapne pay kiya tha, tab ek unique Order ID generate hua tha.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Order Check Ho Raha Hai...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>Status Check Karein</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-extrabold text-gray-900 text-lg">
                Badhai Ho! Key Recover Ho Gayi
              </h4>
              <p className="text-xs text-gray-600">
                Aapki Access Key automatically is device par activate kar di gayi hai.
              </p>

              <div className="bg-white border-2 border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
                <span className="font-mono font-bold text-emerald-950 text-sm tracking-wider">
                  {recoveredKey}
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md"
              >
                Content Banao
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#E7E1D3] text-center">
            <p className="text-xs text-gray-500">
              Koi pareshani hai?{' '}
              <a
                href={`https://wa.me/${supportWhatsappRaw}?text=${encodeURIComponent('Namaste! Mujhe Seller Content Pack payment/key recovery mein help chahiye.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 font-bold hover:underline"
              >
                WhatsApp par humse connect karein
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
