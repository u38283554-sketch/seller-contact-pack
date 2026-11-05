import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileText,
  ShoppingBag,
  Instagram,
  Video,
  MessageCircle,
  TrendingUp,
  ListChecks,
  AlertCircle,
  Loader2,
  Clock,
  History,
  Crown,
  ChevronDown,
} from 'lucide-react';
import { ProductInput, ContentPack, AccountState, SavedGeneration } from '../types';
import { generateContent } from '../lib/api';
import { saveGenerationToStorage } from '../lib/storage';

interface GeneratorAppProps {
  account: AccountState | null;
  onRefreshAccount: () => void;
  onOpenPricing: () => void;
  onOpenHistory: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  activeItem?: SavedGeneration | null;
}

const CATEGORIES = [
  'Clothing & Ethnic Wear',
  'Western Wear & Dresses',
  'Footwear & Shoes',
  'Jewellery & Watches',
  'Beauty, Makeup & Skincare',
  'Home, Kitchen & Decor',
  'Mobile, Gadgets & Audio',
  'Bags, Wallets & Luggage',
  'Toys, Baby & Kids',
  'Health, Fitness & Sports',
  'Handicrafts & Puja Essentials',
  'Food, Snacks & Gourmet',
  'Other / General',
];

const PLATFORMS = ['Meesho', 'Instagram', 'WhatsApp', 'Amazon', 'Flipkart', 'General'];
const LANGUAGES = ['Hinglish (Roman script)', 'English', 'Hindi (Devanagari)'];
const TONES = ['Friendly & Persuasive', 'Professional & Premium', 'Festive Offer & Urgency'];

export const GeneratorApp: React.FC<GeneratorAppProps> = ({
  account,
  onRefreshAccount,
  onOpenPricing,
  onOpenHistory,
  onShowToast,
  activeItem,
}) => {
  // Form fields
  const [name, setName] = useState(activeItem?.productName || '');
  const [category, setCategory] = useState(activeItem?.category || '');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [offer, setOffer] = useState('');
  const [platform, setPlatform] = useState('Meesho');
  const [language, setLanguage] = useState('Hinglish (Roman script)');
  const [tone, setTone] = useState('Friendly & Persuasive');

  // Loading & Execution states
  const [loading, setLoading] = useState(false);
  const [retryingPart, setRetryingPart] = useState<'A' | 'B' | 'C' | null>(null);
  const [contentPack, setContentPack] = useState<ContentPack | null>(activeItem?.content || null);
  const [safetyRefusal, setSafetyRefusal] = useState<string | null>(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  // Copied indicator tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load activeItem if selected from history
  React.useEffect(() => {
    if (activeItem) {
      setName(activeItem.productName);
      if (activeItem.category) setCategory(activeItem.category);
      setContentPack(activeItem.content);
    }
  }, [activeItem]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onShowToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllContent = () => {
    if (!contentPack) return;
    const parts: string[] = [];

    if (contentPack.partA) {
      parts.push(`--- PRODUCT TITLES ---\nOption 1: ${contentPack.partA.titleOptions[0]}\nOption 2: ${contentPack.partA.titleOptions[1] || ''}`);
      parts.push(`\n--- DESCRIPTION ---\n${contentPack.partA.description}`);
      parts.push(`\n--- BULLET POINTS ---\n${contentPack.partA.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n')}`);
    }

    if (contentPack.partB) {
      parts.push(`\n--- INSTAGRAM CAPTION ---\n${contentPack.partB.instagramCaption}\n\n${contentPack.partB.hashtags.join(' ')}`);
      parts.push(`\n--- AD COPY ---\nHeadline: ${contentPack.partB.adCopy.headline}\nText: ${contentPack.partB.adCopy.primaryText}\nCTA: ${contentPack.partB.adCopy.callToAction}`);
    }

    if (contentPack.partC) {
      parts.push(`\n--- 15-SECOND REEL SCRIPT ---\nHook (0-3s): ${contentPack.partC.reelScript.hook}\nScene 1 (3-7s): ${contentPack.partC.reelScript.scene1}\nScene 2 (7-11s): ${contentPack.partC.reelScript.scene2}\nScene 3 (11-13s): ${contentPack.partC.reelScript.scene3}\nCTA (13-15s): ${contentPack.partC.reelScript.callToAction}`);
      parts.push(`\n--- WHATSAPP OFFER MESSAGE ---\n${contentPack.partC.whatsappMessage}`);
    }

    copyToClipboard(parts.join('\n\n'), 'All Content');
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      onShowToast('Kripya product ka naam enter karein.', 'error');
      return;
    }
    if (!features.trim()) {
      onShowToast('Kripya product ke 2-3 key features likhein.', 'error');
      return;
    }

    setLoading(true);
    setSafetyRefusal(null);
    setQuotaExhausted(false);

    const inputData: ProductInput = {
      name: name.trim(),
      category: category || undefined,
      price: price.trim() || undefined,
      features: features.trim(),
      targetCustomer: targetCustomer.trim() || undefined,
      offer: offer.trim() || undefined,
      platform,
      language,
      tone,
    };

    try {
      const res = await generateContent(inputData);

      if (res.content) {
        setContentPack(res.content);

        // Save in browser localStorage history
        const saved: SavedGeneration = {
          id: 'gen_' + Date.now().toString(36),
          timestamp: new Date().toISOString(),
          productName: name.trim(),
          category: category || undefined,
          content: res.content,
        };
        saveGenerationToStorage(saved);

        onShowToast('Poora Content Pack ready ho gaya!', 'success');
        onRefreshAccount();

        // Scroll smoothly to output
        setTimeout(() => {
          const el = document.getElementById('output-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err: any) {
      if (err.safetyRefusal) {
        setSafetyRefusal(err.safetyRefusal);
      } else if (err.quotaExhausted) {
        setQuotaExhausted(true);
      } else {
        onShowToast(err.message || 'Content generate nahi ho paya. Dobara try karein.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Single-part free regeneration
  const handleRegeneratePart = async (part: 'A' | 'B' | 'C') => {
    setRetryingPart(part);
    const inputData: ProductInput = {
      name: name.trim(),
      category: category || undefined,
      price: price.trim() || undefined,
      features: features.trim(),
      targetCustomer: targetCustomer.trim() || undefined,
      offer: offer.trim() || undefined,
      platform,
      language,
      tone,
    };

    try {
      const res = await generateContent(inputData, part);
      if (res.data) {
        setContentPack((prev) => {
          if (!prev) return null;
          const updated: ContentPack = { ...prev };
          if (part === 'A') updated.partA = res.data;
          if (part === 'B') updated.partB = res.data;
          if (part === 'C') updated.partC = res.data;

          if (updated.errors) {
            delete updated.errors[`part${part}` as 'partA' | 'partB' | 'partC'];
          }
          return updated;
        });
        onShowToast(`Part ${part} successfully regenerate ho gaya!`, 'success');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Part regenerate nahi ho paya.', 'error');
    } finally {
      setRetryingPart(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E7E1D3] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Sparkles className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-gray-900 text-base sm:text-lg">
              AI E-Commerce Copywriter
            </h2>
            <p className="text-xs text-gray-500">
              Details likhein aur 1 minute mein 7 formats praapt karein
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-[#E7E1D3] text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <History className="w-3.5 h-3.5 text-gray-500" />
            <span>History (Last 10)</span>
          </button>
          <button
            onClick={onOpenPricing}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>Plan Dekhein</span>
          </button>
        </div>
      </div>

      {/* Quota Exhausted Alert */}
      {quotaExhausted && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center space-y-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-red-950">
            Plan Expire Ho Gaya Ya Limit Khatam!
          </h3>
          <p className="text-xs text-red-800 max-w-md mx-auto">
            Content banana jari rakhne ke liye kripya Starter (₹99) ya Pro (₹199) plan renew karein. Aapki bachi hui validity automatically add ho jayegi.
          </p>
          <button
            onClick={onOpenPricing}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md"
          >
            Abhi Plan Renew Karein
          </button>
        </div>
      )}

      {/* Safety Policy Alert */}
      {safetyRefusal && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-amber-950 mb-1">Product Safety Notice</p>
            <p>{safetyRefusal}</p>
          </div>
        </div>
      )}

      {/* Input Form Card */}
      <form onSubmit={handleGenerate} className="bg-white border border-[#E7E1D3] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#E7E1D3] pb-4">
          <h3 className="font-heading font-extrabold text-xl text-gray-900">
            Product Ki Details
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Jitni achhi details denge, AI utna high-converting selling content banayega.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-800">
                Product Ka Naam <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{name.length}/150</span>
            </div>
            <input
              type="text"
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Women Pure Cotton Printed Straight Kurti with Pant Set"
              className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Category <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 appearance-none font-medium"
              >
                <option value="">Category chunein...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Price in Rs */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Selling Price in ₹ <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-500">₹</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 599"
                className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* Key Features (Textarea) */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-gray-800">
                2 se 5 Khaas Baatein (Features / Fabric / Size / Contents) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">{features.length}/1000</span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g. 100% breathable pure cotton fabric. Fast color print jo wash ke baad fade nahi hota. Sizes: M to XXL available. Matching dupatta aur comfortable elastic pant included. Daily wear aur office wear ke liye ideal."
              className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 font-medium leading-relaxed"
            />
          </div>

          {/* Target Customer */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Target Customer <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={100}
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g. College girls, working women, festive shoppers"
              className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
          </div>

          {/* Offer / Discount */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Special Offer / Discount <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={100}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. Buy 1 Get 1 Free, Flat 30% Off, Free Delivery + COD"
              className="w-full bg-[#FAF7F0] border border-[#E7E1D3] rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Options Row: Platform, Language, Tone */}
        <div className="pt-2 border-t border-[#E7E1D3] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Primary Platform
            </label>
            <div className="relative">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 appearance-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 appearance-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tone
            </label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 appearance-none"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2.5 text-base transition-all transform active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                <span>AI 3 Parts Mein Content Generate Kar Raha Hai (Parallel)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Poora 7-in-1 Content Pack Banao (1 Min)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Outputs Display Section */}
      {contentPack && (
        <div id="output-section" className="space-y-6 pt-4 animate-fade-in">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E7E1D3] px-5 py-4 rounded-2xl shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Result Ready
              </span>
              <h3 className="font-heading font-extrabold text-xl text-gray-900 mt-1">
                Aapka 7-in-1 Seller Pack
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAllContent}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95"
              >
                {copiedKey === 'All Content' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-300" />}
                <span>{copiedKey === 'All Content' ? 'Sab Copy Ho Gaya!' : 'Copy All Content'}</span>
              </button>

              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                title="Regenerate full pack"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl text-xs font-semibold flex items-center transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 7 Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: 2 Product Title Options */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      1. Product Title Options (2 Options)
                    </h4>
                  </div>
                  {contentPack.partA && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          contentPack.partA!.titleOptions.join('\n\n'),
                          'Title Options'
                        )
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'Title Options' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partA ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E7E1D3]">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                        Option 1 (SEO Search Optimized)
                      </span>
                      <p className="font-semibold text-gray-900 leading-snug">
                        {contentPack.partA.titleOptions[0]}
                      </p>
                    </div>

                    {contentPack.partA.titleOptions[1] && (
                      <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E7E1D3]">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                          Option 2 (Benefit / Click Driven)
                        </span>
                        <p className="font-semibold text-gray-900 leading-snug">
                          {contentPack.partA.titleOptions[1]}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>Part A create nahi ho paya.</span>
                    <button
                      onClick={() => handleRegeneratePart('A')}
                      disabled={retryingPart === 'A'}
                      className="bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                    >
                      {retryingPart === 'A' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>Dobara Banao</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Product Description */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      2. Product Description
                    </h4>
                  </div>
                  {contentPack.partA && (
                    <button
                      onClick={() =>
                        copyToClipboard(contentPack.partA!.description, 'Description')
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'Description' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partA ? (
                  <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E7E1D3] text-xs text-gray-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line font-medium">
                    {contentPack.partA.description}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>Part A load nahi hua.</span>
                    <button
                      onClick={() => handleRegeneratePart('A')}
                      disabled={retryingPart === 'A'}
                      className="bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                    >
                      <span>Dobara Banao</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: 5 Key Bullet Points */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs md:col-span-2">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ListChecks className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-heading font-bold text-gray-900 text-sm">
                    3. 5 Bullet Points (Amazon / Flipkart / Meesho Spec)
                  </h4>
                </div>
                {contentPack.partA && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        contentPack.partA!.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n'),
                        'Bullet Points'
                      )
                    }
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'Bullet Points' ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {contentPack.partA ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {contentPack.partA.bulletPoints.map((bp, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF7F0] border border-[#E7E1D3] p-2.5 rounded-xl flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-800 font-medium leading-relaxed">{bp}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Card 4: Instagram Caption + 10 Hashtags */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      4. Instagram Caption + 10 Hashtags
                    </h4>
                  </div>
                  {contentPack.partB && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${contentPack.partB!.instagramCaption}\n\n${contentPack.partB!.hashtags.join(' ')}`,
                          'Instagram Post'
                        )
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'Instagram Post' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partB ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-[#E7E1D3] text-gray-800 leading-relaxed font-medium">
                      {contentPack.partB.instagramCaption}
                    </div>
                    <div className="bg-pink-50/60 p-2.5 rounded-xl border border-pink-200 text-pink-900 font-mono text-[11px] leading-relaxed">
                      {contentPack.partB.hashtags.join(' ')}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>Part B create nahi ho paya.</span>
                    <button
                      onClick={() => handleRegeneratePart('B')}
                      disabled={retryingPart === 'B'}
                      className="bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                    >
                      {retryingPart === 'B' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>Dobara Banao</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 5: Ad Copy (Headline, Primary Text, CTA) */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      5. Meta / Google Ad Copy
                    </h4>
                  </div>
                  {contentPack.partB && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Headline: ${contentPack.partB!.adCopy.headline}\nText: ${contentPack.partB!.adCopy.primaryText}\nCTA: ${contentPack.partB!.adCopy.callToAction}`,
                          'Ad Copy'
                        )
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'Ad Copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partB ? (
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E7E1D3]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Ad Headline:
                      </span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">
                        {contentPack.partB.adCopy.headline}
                      </p>
                    </div>

                    <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E7E1D3]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Primary Ad Text:
                      </span>
                      <p className="text-gray-800 font-medium mt-0.5 leading-relaxed">
                        {contentPack.partB.adCopy.primaryText}
                      </p>
                    </div>

                    <div className="inline-block bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold px-3 py-1 rounded-lg text-xs">
                      Button CTA: {contentPack.partB.adCopy.callToAction}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Card 6: 15-Second Reel Script */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      6. 15-Second Viral Reel Script
                    </h4>
                  </div>
                  {contentPack.partC && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Hook (0-3s): ${contentPack.partC!.reelScript.hook}\nScene 1: ${contentPack.partC!.reelScript.scene1}\nScene 2: ${contentPack.partC!.reelScript.scene2}\nScene 3: ${contentPack.partC!.reelScript.scene3}\nCTA: ${contentPack.partC!.reelScript.callToAction}`,
                          'Reel Script'
                        )
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'Reel Script' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partC ? (
                  <div className="space-y-2 text-xs">
                    <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl">
                      <span className="font-bold text-amber-900 block text-[10px] uppercase">
                        ⚡ 0-3s Visual Hook
                      </span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {contentPack.partC.reelScript.hook}
                      </p>
                    </div>

                    <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E7E1D3] space-y-1 text-gray-700">
                      <p><strong>Scene 1 (3-7s):</strong> {contentPack.partC.reelScript.scene1}</p>
                      <p><strong>Scene 2 (7-11s):</strong> {contentPack.partC.reelScript.scene2}</p>
                      <p><strong>Scene 3 (11-13s):</strong> {contentPack.partC.reelScript.scene3}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-900 font-bold">
                      CTA (13-15s): {contentPack.partC.reelScript.callToAction}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                    <span>Part C create nahi ho paya.</span>
                    <button
                      onClick={() => handleRegeneratePart('C')}
                      disabled={retryingPart === 'C'}
                      className="bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                    >
                      {retryingPart === 'C' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>Dobara Banao</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 7: WhatsApp Offer Message */}
            <div className="bg-white border border-[#E7E1D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 text-[#075E54] flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm">
                      7. WhatsApp Broadcast Offer Message
                    </h4>
                  </div>
                  {contentPack.partC && (
                    <button
                      onClick={() =>
                        copyToClipboard(
                          contentPack.partC!.whatsappMessage,
                          'WhatsApp Message'
                        )
                      }
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'WhatsApp Message' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {contentPack.partC ? (
                  <div className="bg-[#25D366]/5 border border-[#25D366]/25 p-3.5 rounded-xl text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-line max-h-48 overflow-y-auto">
                    {contentPack.partC.whatsappMessage}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
