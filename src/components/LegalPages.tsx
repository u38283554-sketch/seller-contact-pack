import React from 'react';
import { ShieldCheck, MessageCircle, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  page: 'terms' | 'privacy' | 'refund' | 'contact';
  onBack: () => void;
  supportWhatsapp: string;
  supportWhatsappRaw: string;
  supportEmail: string;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  page,
  onBack,
  supportWhatsapp,
  supportWhatsappRaw,
  supportEmail,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 bg-white border border-[#E7E1D3] px-3 py-1.5 rounded-lg shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wapas Jayein</span>
      </button>

      <div className="bg-white border border-[#E7E1D3] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-gray-800 leading-relaxed text-sm">
        {page === 'terms' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="font-heading text-3xl font-extrabold text-gray-900">
                Terms and Conditions
              </h1>
              <p className="text-xs text-gray-500 mt-1">Last Updated: November 2026</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zaroori AI Disclaimer:</p>
                <p>
                  Seller Content Pack ek AI-powered copywriting tool hai. AI dwara generate kiye gaye titles, descriptions ya scripts ko kisi bhi marketplace ya social platform par post karne se pehle ek baar dhyan se padh lena aapki zimmewari hai.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">1. Sewa Ka Upyog (Service Use)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Aap is platform ka use sirf legitimate e-commerce aur online selling products ke marketing content ke liye kar sakte hain. Kisi bhi illegal, restricted, adult, nasha, counterfeit, ya medical cures ke claims wale products ka content banana sakhti se mana hai.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">2. Plans, Validity & Expiry</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Free tier par pratyeek device ko 1 generation milti hai. Paid plans (Starter aur Pro) payment date se 30 din ke liye valid rehte hain. Expiry ya limit khatam hone ke baad plan renew karna hota hai. Koi auto-debit nahi hota.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">3. Content Ownership</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Jo content aapke product inputs se generate hota hai, uske poore commercial rights aapke paas hain. Aap use Meesho, Amazon, Flipkart, Instagram ya kisi bhi doosre platform par be-jhijhak use kar sakte hain.
              </p>
            </section>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="font-heading text-3xl font-extrabold text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-xs text-gray-500 mt-1">Sellers Ke Data Ki Suraksha</p>
            </div>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">1. Data Minimization & Privacy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Hum aapke product inputs ya generated content ko humare server par permanent store nahi karte. Aapka generation history sirf aur sirf aapke local browser mein (localStorage) save hota hai jise aap kabhi bhi clear kar sakte hain.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">2. Device & Payment Information</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Free generations abuse prevent karne ke liye device ka hashed IP identifier save kiya jata hai. Payments ke dauran UPI transactions ZapUPI ke secure gateway dwara process hoti hain; hum kisi bhi card ya bank PIN ko access nahi karte.
              </p>
            </section>
          </div>
        )}

        {page === 'refund' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="font-heading text-3xl font-extrabold text-gray-900">
                Refund & Cancellation Policy
              </h1>
              <p className="text-xs text-gray-500 mt-1">Fair & Transparent Guidelines</p>
            </div>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">1. Refund Eligibility</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Seller Content Pack ek instant digital service hai. Refund sirf nimnlikhit do sthitiyon mein diya jata hai:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Aapke account se paise kat gaye par technical error ki wajah se order fail hua aur Access Key deliver nahi hui.</li>
                <li>Humare servers par continuous failure ho aur AI content generate hi na ho raha ho.</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                Content generate hone ke baad &quot;content pasand nahi aaya&quot; ke aadhar par digital goods me refund sambhav nahi hota, kyonki hum single-part free regeneration aur multiple options provide karte hain.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-heading text-base font-bold text-gray-900">2. Refund Request Kaise Karein?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Agar payment issue hua hai, toh apne Order ID aur payment screenshot ke sath humare WhatsApp ya Email par 48 ghante ke andar sampark karein. Verify hone par 3-5 working days mein aapke original payment method par refund process kar diya jata hai.
              </p>
            </section>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="font-heading text-3xl font-extrabold text-gray-900">
                Contact & Support
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Humare sellers ke liye dedicated customer support
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${supportWhatsappRaw}?text=${encodeURIComponent('Namaste! Mujhe Seller Content Pack ke baare mein madad chahiye.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] p-5 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <h4 className="font-heading font-bold text-gray-900 text-sm">
                  WhatsApp Support (Fastest)
                </h4>
                <p className="text-xs text-[#075E54] font-semibold mt-1">
                  {supportWhatsapp}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Available Mon-Sat: 10 AM - 8 PM IST
                </p>
              </a>

              <a
                href={`mailto:${supportEmail}`}
                className="bg-emerald-50 border border-emerald-200 hover:border-emerald-500 p-5 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-gray-900 text-sm">
                  Email Support
                </h4>
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  {supportEmail}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Reply within 24 business hours
                </p>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
