import React from 'react';
import { ShoppingBag, MessageCircle, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  supportWhatsapp: string;
  supportWhatsappRaw: string;
  supportEmail: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  supportWhatsapp,
  supportWhatsappRaw,
  supportEmail,
}) => {
  return (
    <footer className="bg-white border-t border-[#E7E1D3] pt-12 pb-8 text-gray-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-100">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-gray-900 text-base">
                Seller Content Pack
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-md">
              Indian online sellers (Meesho, Amazon, Flipkart, Instagram aur WhatsApp) ke liye all-in-one AI copywriting tool. 1 minute mein ready-to-sell titles, descriptions, reel scripts aur social copy paayein.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Made for Indian E-Commerce Entrepreneurs & Resellers</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-gray-900 text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('generator')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Content Banao
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Plans & Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('refund')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-gray-900 text-xs uppercase tracking-wider">
              Customer Support
            </h4>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${supportWhatsappRaw}?text=${encodeURIComponent('Namaste! Mujhe Seller Content Pack ke baare mein jaankari chahiye.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                <span>WhatsApp: {supportWhatsapp}</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{supportEmail}</span>
              </a>
              <p className="text-[11px] text-gray-400 pt-1">
                Mon - Sat: 10:00 AM - 8:00 PM IST
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} Seller Content Pack. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Content is AI-generated. Kripya publish karne se pehle ek baar verify kar lein.
          </p>
        </div>
      </div>
    </footer>
  );
};
