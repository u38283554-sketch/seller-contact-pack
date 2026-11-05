import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  ShoppingBag,
  Instagram,
  MessageCircle,
  Video,
  FileText,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PlanConfig } from '../types';

interface LandingPageProps {
  onStartGenerator: () => void;
  onSelectPlan: (plan: PlanConfig) => void;
  onOpenRecoverModal: () => void;
  plans: Record<string, PlanConfig>;
  whatsappRaw: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGenerator,
  onSelectPlan,
  onOpenRecoverModal,
  plans,
  whatsappRaw,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTabPreview, setActiveTabPreview] = useState<'titles' | 'insta' | 'reel' | 'whatsapp'>('titles');

  const faqs = [
    {
      q: 'Content generate karne mein kitna samay lagta hai?',
      a: 'Hamara system parallel processing use karta hai, isliye 7 alag-alag content formats lagbhag 40 se 60 seconds ke andar aapki screen par ready mil jate hain.',
    },
    {
      q: 'Kya ye Meesho, Flipkart aur Amazon ke policies ke mutabiq hai?',
      a: 'Haan! Saara content e-commerce listing standard ke hisab se generate hota hai—clean language, no fake health guarantees, structured bullet points, aur platform-friendly format.',
    },
    {
      q: 'Free try kaise kaam karta hai?',
      a: 'Har naye device ko 1 free generation milti hai bina kisi login ya credit card ke. Aap direct product daal kar test kar sakte hain.',
    },
    {
      q: 'Payment ke baad Access Key kaise milti hai?',
      a: 'ZapUPI se payment complete hote hi aapko screen par ek unique Access Key (jaise SCP-XXXX-XXXX-XXXX) milti hai. Ye key automatically aapke browser mein activate ho jati hai.',
    },
    {
      q: 'Agar payment ho gayi par browser band ho gaya toh?',
      a: 'Aap "Payment ho gaya par key nahi mili?" recovery button par click karke apna Order ID daalein, aapki key turant mil jayegi. Aap hamare WhatsApp par bhi direct message kar sakte hain.',
    },
    {
      q: 'Kya plan renew karne par meri purani validity chali jayegi?',
      a: 'Nahi! Agar aap expiry se pehle renew karte hain, toh aapki current bachi hui validity mein 30 din aur jud jaate hain aur generations limit reset ho jati hai.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Meesho • Amazon • Flipkart • Instagram • WhatsApp</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Product ka naam daalo.{' '}
            <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy decoration-2">
              1 minute mein
            </span>{' '}
            poora selling content ready.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Title, Description, 5 Bullets, Instagram Caption + 10 Hashtags, Ad Copy, 15-Sec Reel Script aur WhatsApp Offer Message. Ek click mein copy karo aur bechna shuru karo.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartGenerator}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-8 py-4 rounded-xl text-base shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Free Try Karo (1 Try Free)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#pricing"
              className="w-full sm:w-auto bg-white hover:bg-emerald-50/50 text-gray-800 border border-[#E7E1D3] font-bold px-6 py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
            >
              <span>Plans Dekhein (₹299 Se)</span>
            </a>
          </div>

          <p className="mt-3 text-xs text-gray-500 font-medium">
            Koi credit card ya registration nahi chahiye • Instant test karein
          </p>

          {/* Live Interactive Preview Box */}
          <div className="mt-12 bg-white border border-[#E7E1D3] rounded-2xl shadow-xl overflow-hidden text-left max-w-4xl mx-auto">
            <div className="bg-[#FAF7F0] border-b border-[#E7E1D3] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Sample: Banarasi Silk Saree for Meesho & Instagram</span>
              </div>
              <div className="flex gap-1">
                {(['titles', 'insta', 'reel', 'whatsapp'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabPreview(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTabPreview === tab
                        ? 'bg-emerald-700 text-white'
                        : 'text-gray-600 hover:bg-black/5'
                    }`}
                  >
                    {tab === 'titles' && 'Titles & Bullets'}
                    {tab === 'insta' && 'Instagram & Tags'}
                    {tab === 'reel' && '15-Sec Reel'}
                    {tab === 'whatsapp' && 'WhatsApp Msg'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-white min-h-[160px] text-sm text-gray-800">
              {activeTabPreview === 'titles' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Option 1 Title
                    </span>
                    <p className="font-semibold text-gray-900 mt-1">
                      Women&apos;s Royal Banarasi Soft Silk Saree with Rich Zari Pallu & Unstitched Blouse Piece (Festive & Wedding Collection)
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500">Key Bullet:</span>
                    <p className="text-gray-700 text-xs mt-0.5">
                      ✓ Pure lightweight jacquard weave jo pura din pehanne par bhi lightweight aur comfortable rehti hai.
                    </p>
                  </div>
                </div>
              )}

              {activeTabPreview === 'insta' && (
                <div className="space-y-2">
                  <p className="text-gray-800 font-medium">
                    ✨ Shaadi ya festive season mein lagna hai sabse alag? Ye Banarasi Soft Silk Saree hai aapka perfect choice! Heavy gold zari work aur lightweight drape jo comfortable bhi hai.
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    👉 Order karne ke liye bio mein link par click karein ya DM karein!
                  </p>
                  <p className="text-xs text-gray-500 pt-1 font-mono">
                    #banarasisaree #meeshosaree #weddingoutfit #sareelover #indianethnicwear #festivelook #sareefashion
                  </p>
                </div>
              )}

              {activeTabPreview === 'reel' && (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
                    <span className="font-bold text-amber-900">0-3s Hook:</span> &quot;Stop scrolling agar aap 1000 ke andar aisi premium Banarasi saree dhoond rahe hain jo bilkul heavy feel na de!&quot;
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Scenes:</strong> Pallu ka close-up shine dikhao → Blouse piece dikhao → Price tag offer mention karo.
                  </p>
                </div>
              )}

              {activeTabPreview === 'whatsapp' && (
                <div className="bg-[#25D366]/5 border border-[#25D366]/20 p-3 rounded-xl text-xs space-y-1.5 font-sans">
                  <p className="font-bold text-[#075E54]">🌸 Special Festive Offer - Banarasi Soft Silk Saree</p>
                  <p className="text-gray-700">Namaste ji! Hamare top-rated collection ka stock wapas aa gaya hai:</p>
                  <p className="text-gray-700 font-medium">• Rich Zari Border & Soft drape fabric</p>
                  <p className="text-gray-700 font-medium">• Special Price: ₹899 (Free Delivery + Cash on Delivery)</p>
                  <p className="text-emerald-800 font-bold">Booking ke liye reply karein: &apos;BOOK&apos;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Kaise Kaam Karta Hai (3 Steps) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Simple Process
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Kaise Kaam Karta Hai? Sirf 3 Aasan Steps
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Bina kisi writing experience ke, koi bhi seller 1 minute mein professional content bana sakta hai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E7E1D3] rounded-2xl p-6 relative shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold font-heading text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
              Product Ki Details Likho
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bas product ka naam, 2-3 khaas baatein (jaise material, size ya color) aur price/offer daal dijiye.
            </p>
          </div>

          <div className="bg-white border border-[#E7E1D3] rounded-2xl p-6 relative shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold font-heading text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
              AI 1 Min Mein 7 Packs Banata Hai
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Hamara high-speed AI model Meesho, Amazon aur Instagram ke rules ke mutabiq 7 formats ek sath generate karta hai.
            </p>
          </div>

          <div className="bg-white border border-[#E7E1D3] rounded-2xl p-6 relative shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold font-heading text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
              Copy & Post Karke Becho
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Har card par Copy button hai. Direct apne listing panel ya social media par paste karein aur orders payein.
            </p>
          </div>
        </div>
      </section>

      {/* Aapko Kya Milega (7 Outputs) */}
      <section className="bg-white border-y border-[#E7E1D3] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
              Full Selling Suite
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
              Har Ek Generation Mein Aapko Milenge Ye 7 Outputs
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Alag-alag tools khareedne ki zaroorat nahi—ek hi pack mein sabkuch shaamil hai.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <FileText className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">1. Two Title Options</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Ek SEO-rich search ranking ke liye aur ek high-converting customer click ke liye.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <ShoppingBag className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">2. Product Description</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Storytelling aur daily utility ke sath likha gaya paragraph jo customer ka bharosa jeete.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">3. 5 Bullet Points</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Amazon & Flipkart ke standard bullets—material, fitting, care instructions aur package contents.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <Instagram className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">4. Insta Caption + 10 Tags</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Catchy hook caption aur 10 niche-targeted trending hashtags Indian audience ke liye.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">5. Ad Copy (Headline & Body)</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Facebook aur Instagram sponsored ads ke liye punchy headline aur CTA.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <Video className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">6. 15-Sec Reel Script</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                0-3s hook, 3 short visual scenes aur CTA jise dekh kar viewers scroll karna rok dein.
              </p>
            </div>

            <div className="bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-4 sm:col-span-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-2">
                <MessageCircle className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-heading font-bold text-gray-900 text-sm">7. WhatsApp Broadcast Message</h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Apne customer groups aur broadcast lists par bhejne ke liye ready-to-send discount offer message.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-700">
              Real Seller Comparison
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold mt-2">
              Aapke Listings Mein Farak Dekhein
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-2xl p-5">
              <div className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded-md mb-3">
                ❌ Aam Seller Ka Listing (Low Sales)
              </div>
              <p className="font-bold text-gray-200 text-sm mb-2">
                &quot;Cotton kurti best quality buy now fast delivery available red color&quot;
              </p>
              <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                <li>Search mein rank nahi hota</li>
                <li>Customer ko bharosa nahi lagta</li>
                <li>Na bullet points, na washing instructions</li>
                <li>WhatsApp par baar-baar details samjhani padti hain</li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-white text-gray-900 rounded-2xl p-5 border-2 border-amber-400 shadow-md">
              <div className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md mb-3">
                ✅ Seller Content Pack Ka AI Output (High Conversion)
              </div>
              <p className="font-bold text-gray-950 text-sm mb-2">
                &quot;Women&apos;s Breathable Pure Cotton A-Line Kurti with Handcrafted Embroidery | Everyday Office & Casual Wear&quot;
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                <li>Meesho & Amazon algorithm friendly SEO keywords</li>
                <li>Clear sizing, fabric transparency aur styling tips</li>
                <li>Ready-made 15s viral reel script for Instagram traffic</li>
                <li>Ready WhatsApp message jisse direct reply aate hain</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Apne Business Ke Hisab Se Plan Chunein
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Koi chhipa hua charge nahi • One-time UPI payment • No auto-debit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Plan */}
          <div className="bg-white border border-[#E7E1D3] rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-heading font-extrabold text-xl text-gray-900">Free Try</h3>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  Trial
                </span>
              </div>
              <div className="mb-4">
                <span className="font-heading text-3xl font-extrabold text-gray-900">₹0</span>
                <span className="text-xs text-gray-500 ml-1">/ 1 generation</span>
              </div>
              <p className="text-xs text-gray-600 mb-6">
                Try karke dekhein hamara AI model aapke products ke liye kaisa content banata hai.
              </p>
              <div className="space-y-2.5 mb-6 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Free full content generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 7 content formats included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hinglish, Hindi & English</span>
                </div>
              </div>
            </div>
            <button
              onClick={onStartGenerator}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Abhi Free Try Karein
            </button>
          </div>

          {/* Starter Plan (Most Popular) */}
          <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-amber-400 text-gray-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              ★ Most Popular
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-heading font-extrabold text-xl text-emerald-900">
                  Starter Plan
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  30 Din
                </span>
              </div>
              <div className="mb-4">
                <span className="font-heading text-4xl font-extrabold text-gray-900">
                  ₹{plans.starter?.price ?? 299}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 100 generations</span>
              </div>
              <p className="text-xs text-gray-600 mb-6">
                Regular Meesho aur Instagram sellers ke liye jo roz 2-3 products list karte hain.
              </p>
              <div className="space-y-2.5 mb-6 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">100 Full Content Packs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30 Days validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast parallel generation (&lt; 60s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single-part free regeneration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => plans.starter && onSelectPlan(plans.starter)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-sm shadow-md shadow-emerald-800/25 transition-all"
            >
              Starter Plan Lein (₹{plans.starter?.price ?? 299})
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border border-[#E7E1D3] rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-heading font-extrabold text-xl text-gray-900">Pro Plan</h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Best Value
                </span>
              </div>
              <div className="mb-4">
                <span className="font-heading text-4xl font-extrabold text-gray-900">
                  ₹{plans.pro?.price ?? 599}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 300 generations</span>
              </div>
              <p className="text-xs text-gray-600 mb-6">
                Bulk catalog uploaders, digital agencies, aur high-volume wholesalers ke liye.
              </p>
              <div className="space-y-2.5 mb-6 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">300 Full Content Packs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30 Days validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority server queue during peak hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 7 output formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority WhatsApp support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => plans.pro && onSelectPlan(plans.pro)}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-xl text-sm transition-all"
            >
              Pro Plan Lein (₹{plans.pro?.price ?? 599})
            </button>
          </div>
        </div>

        {/* Recovery Link */}
        <div className="mt-8 text-center">
          <button
            onClick={onOpenRecoverModal}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline inline-flex items-center gap-1.5"
          >
            <span>Payment ho gaya par Access Key nahi mili? Yahan click karke recover karein</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
            Aam Sawal
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-[#E7E1D3] rounded-xl overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left font-semibold text-sm text-gray-900 flex items-center justify-between gap-3 focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180 text-emerald-700' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 border-t border-gray-100 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Floating CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 text-center shadow-xl">
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold mb-2">
            Aaj Hi Apni Selling Speed 10x Karein
          </h3>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto mb-6">
            Bina content writing ke jhanjhat ke, 1 minute mein ready-to-sell content banayein.
          </p>
          <button
            onClick={onStartGenerator}
            className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all active:scale-95"
          >
            Free Content Pack Banao
          </button>
        </div>
      </section>
    </div>
  );
};
