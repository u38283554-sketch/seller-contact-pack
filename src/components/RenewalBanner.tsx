import React from 'react';
import { AlertTriangle, Clock, Zap, ArrowRight } from 'lucide-react';
import { AccountState } from '../types';

interface RenewalBannerProps {
  account: AccountState | null;
  onRenew: () => void;
}

export const RenewalBanner: React.FC<RenewalBannerProps> = ({ account, onRenew }) => {
  if (!account) return null;

  // For paid accounts
  if (account.isPaid) {
    const isExpired = account.isExpired || account.daysLeft === 0;
    const isLimitFinished = account.remainingGens <= 0;
    const isUrgent = isExpired || isLimitFinished || (account.daysLeft !== undefined && account.daysLeft <= 3) || account.remainingGens <= 10;

    if (!isUrgent) return null;

    let message = '';
    if (isExpired) {
      message = 'Aapka plan expire ho gaya hai! Content banana continue rakhne ke liye renew karein.';
    } else if (isLimitFinished) {
      message = 'Aapki plan generation limit khatam ho chuki hai. Agle packs ke liye abhi renew karein.';
    } else if (account.daysLeft !== undefined && account.daysLeft <= 3) {
      message = `Dhyan dein: Sirf ${account.daysLeft} din bache hain aapke plan mein. Bina rukawat ke renew karein.`;
    } else {
      message = `Dhyan dein: Sirf ${account.remainingGens} generations bachi hain. Limit khatam hone se pehle renew karein.`;
    }

    return (
      <div className="bg-amber-500 text-gray-900 border-b border-amber-600 px-4 py-2.5 text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-gray-900" />
            <span>{message}</span>
          </div>
          <button
            onClick={onRenew}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white hover:bg-gray-850 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-transform active:scale-95 ml-auto"
          >
            <span>Renew Karein</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // For free account with 0 tries remaining
  if (!account.isPaid && account.remainingGens <= 0) {
    return (
      <div className="bg-emerald-800 text-white border-b border-emerald-900 px-4 py-2.5 text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0 text-amber-300" />
            <span>Aapka 1 free try khatam ho chuka hai! Unlimited selling content ke liye Starter ya Pro plan lein.</span>
          </div>
          <button
            onClick={onRenew}
            className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-950 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95 ml-auto"
          >
            <span>Plan Dekhein (₹99 Se Shuru)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
