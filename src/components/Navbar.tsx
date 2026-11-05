import React from 'react';
import { Sparkles, Key, MessageCircle, Crown, ShoppingBag } from 'lucide-react';
import { AccountState } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  account: AccountState | null;
  onOpenKeyModal: () => void;
  onOpenPricing: () => void;
  whatsappRaw: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  account,
  onOpenKeyModal,
  onOpenPricing,
  whatsappRaw,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E7E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-gray-900 text-lg tracking-tight">
                  Seller Content Pack
                </span>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Meesho, Amazon & Insta sellers ke liye 1-min content
              </p>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-700">
            <button
              onClick={() => onNavigate('generator')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'generator'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'hover:text-emerald-700 hover:bg-black/5'
              }`}
            >
              Content Banao
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'pricing'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'hover:text-emerald-700 hover:bg-black/5'
              }`}
            >
              Plans & Pricing
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-3 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-black/5 transition-colors"
            >
              Kaise Kaam Karta Hai
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'contact'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'hover:text-emerald-700 hover:bg-black/5'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Status Pill */}
            {account && (
              <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-[#E7E1D3] px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs">
                {account.isPaid ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-gray-900">{account.planName}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-emerald-700">{account.remainingGens} gens left</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">{account.daysLeft} din baaki</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-gray-900">Free Try:</span>
                    <span className="text-emerald-700 font-bold">
                      {account.remainingGens} bache hain
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Enter Access Key Button */}
            <button
              onClick={onOpenKeyModal}
              title="Already paid? Enter access key"
              className="inline-flex items-center gap-1.5 text-gray-700 hover:text-emerald-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Access Key</span>
            </button>

            {/* WhatsApp Support Direct Button */}
            <a
              href={`https://wa.me/${whatsappRaw}?text=${encodeURIComponent('Namaste! Mujhe Seller Content Pack ke baare mein jaankari chahiye.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 border border-[#25D366]/30 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              title="WhatsApp Support"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
              <span className="hidden lg:inline">Help</span>
            </a>

            {/* CTA Button */}
            {currentView !== 'generator' ? (
              <button
                onClick={() => onNavigate('generator')}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-800/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Content Banao</span>
              </button>
            ) : (
              <button
                onClick={onOpenPricing}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-gray-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 text-gray-950 fill-gray-950" />
                <span>Plans</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
