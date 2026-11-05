import React, { useState } from 'react';
import { X, Key, Check, Loader2, AlertCircle } from 'lucide-react';
import { setStoredAccessKey, clearStoredAccessKey } from '../lib/storage';
import { fetchAccount } from '../lib/api';
import { AccountState } from '../types';

interface AccessKeyModalProps {
  currentKey: string | null;
  onClose: () => void;
  onSuccess: (acc: AccountState) => void;
  onOpenRecover: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AccessKeyModal: React.FC<AccessKeyModalProps> = ({
  currentKey,
  onClose,
  onSuccess,
  onOpenRecover,
  onShowToast,
}) => {
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim().toUpperCase();
    if (!clean) {
      setError('Kripya apni Access Key enter karein.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Temporarily store to test account
      setStoredAccessKey(clean);
      const acc = await fetchAccount();

      if (!acc.valid || !acc.isPaid) {
        clearStoredAccessKey();
        throw new Error('Yeh Access Key invalid ya inactive hai. Check karein.');
      }

      onShowToast(`Plan activated: ${acc.planName}!`, 'success');
      onSuccess(acc);
      onClose();
    } catch (err: any) {
      clearStoredAccessKey();
      setError(err.message || 'Key verify karne mein error aaya.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = () => {
    clearStoredAccessKey();
    onShowToast('Access key logout ho gayi.', 'success');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-amber-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">Access Key Manage Karein</h3>
              <p className="text-emerald-100 text-xs">Apne device par active plan connect karein</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Aapki Access Key (Format: SCP-XXXX-XXXX-XXXX)
              </label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="SCP-A1B2-C3D4-E5F6"
                className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3.5 py-2.5 font-mono text-sm tracking-wider text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 uppercase"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Payment ke baad mili hui key yahan enter karein. Ek key aap multiple devices par use kar sakte hain.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
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
                  <span>Key Verify Ho Rahi Hai...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Key Activate Karein</span>
                </>
              )}
            </button>
          </form>

          {currentKey && (
            <div className="mt-4 pt-4 border-t border-[#E7E1D3] flex items-center justify-between text-xs">
              <span className="text-gray-500">Currently active on this device</span>
              <button
                type="button"
                onClick={handleRemoveKey}
                className="text-red-600 hover:text-red-800 font-semibold underline"
              >
                Key Remove Karein
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#E7E1D3] text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecover();
              }}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold hover:underline"
            >
              Payment ho gaya par key nahi mili? Yahan click karein
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
