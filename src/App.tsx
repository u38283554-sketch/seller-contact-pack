import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RenewalBanner } from './components/RenewalBanner';
import { LandingPage } from './components/LandingPage';
import { GeneratorApp } from './components/GeneratorApp';
import { PaymentResultPage } from './components/PaymentResultPage';
import { CheckoutModal } from './components/CheckoutModal';
import { AccessKeyModal } from './components/AccessKeyModal';
import { RecoverKeyModal } from './components/RecoverKeyModal';
import { HistoryModal } from './components/HistoryModal';
import { LegalPages } from './components/LegalPages';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AccountState, PlanConfig, SavedGeneration } from './types';
import { fetchAccount, fetchPublicConfig, PublicConfig } from './lib/api';
import { getStoredAccessKey, getSavedGenerations, deleteSavedGeneration } from './lib/storage';
import { BRAND_CONFIG, PLANS } from '../netlify/lib/config.js';

export default function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | 'refund' | 'contact'>('terms');

  // Account & Config state
  const [account, setAccount] = useState<AccountState | null>(null);
  const [publicConfig, setPublicConfig] = useState<PublicConfig>({
    brand: BRAND_CONFIG,
    plans: PLANS as any,
  });

  // Modals state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanConfig | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<SavedGeneration[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<SavedGeneration | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Check URL pathname on mount
  useEffect(() => {
    if (window.location.pathname.includes('/payment-result')) {
      setCurrentView('payment-result');
    }
  }, []);

  // Load public config & account info on mount
  const refreshAccount = async () => {
    try {
      const acc = await fetchAccount();
      setAccount(acc);
    } catch (e) {
      // If error, fall back to free preview state
      setAccount({
        valid: true,
        isPaid: false,
        planId: 'free',
        planName: 'Free Try',
        limit: 1,
        used: 0,
        remainingGens: 1,
      });
    }
  };

  useEffect(() => {
    fetchPublicConfig()
      .then((cfg) => setPublicConfig(cfg))
      .catch(() => {});
    refreshAccount();
    setHistoryItems(getSavedGenerations());
  }, []);

  const handleNavigate = (view: string) => {
    if (['terms', 'privacy', 'refund', 'contact'].includes(view)) {
      setLegalPage(view as any);
      setCurrentView('legal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'pricing') {
      if (currentView === 'landing') {
        const el = document.getElementById('pricing');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCurrentView('landing');
        setTimeout(() => {
          const el = document.getElementById('pricing');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    if (view === 'how-it-works') {
      if (currentView === 'landing') {
        const el = document.getElementById('how-it-works');
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCurrentView('landing');
        setTimeout(() => {
          const el = document.getElementById('how-it-works');
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistorySelect = (item: SavedGeneration) => {
    setActiveHistoryItem(item);
    setCurrentView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistoryDelete = (id: string) => {
    deleteSavedGeneration(id);
    setHistoryItems(getSavedGenerations());
    showToast('Item history se delete kar diya gaya.', 'success');
  };

  const handleRenew = () => {
    // If account has plan, pick that plan for renewal, otherwise starter
    const targetPlanId = (account?.isPaid ? account.planId : 'starter') as string;
    const plan = publicConfig.plans[targetPlanId] || publicConfig.plans.starter;
    setSelectedPlanForCheckout(plan);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-gray-900 selection:bg-emerald-200">
      {/* Renewal / Expiry Alert Banner */}
      <RenewalBanner account={account} onRenew={handleRenew} />

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        account={account}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenPricing={() => handleNavigate('pricing')}
        whatsappRaw={publicConfig.brand.supportWhatsappRaw}
      />

      {/* Main Content Area */}
      <main className="grow">
        {currentView === 'landing' && (
          <LandingPage
            onStartGenerator={() => {
              setCurrentView('generator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectPlan={(plan) => setSelectedPlanForCheckout(plan)}
            onOpenRecoverModal={() => setIsRecoverModalOpen(true)}
            plans={publicConfig.plans}
            whatsappRaw={publicConfig.brand.supportWhatsappRaw}
          />
        )}

        {currentView === 'generator' && (
          <GeneratorApp
            account={account}
            onRefreshAccount={refreshAccount}
            onOpenPricing={() => handleNavigate('pricing')}
            onOpenHistory={() => {
              setHistoryItems(getSavedGenerations());
              setIsHistoryModalOpen(true);
            }}
            onShowToast={showToast}
            activeItem={activeHistoryItem}
          />
        )}

        {currentView === 'payment-result' && (
          <PaymentResultPage
            onGoToApp={() => {
              refreshAccount();
              setCurrentView('generator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
            whatsappRaw={publicConfig.brand.supportWhatsappRaw}
          />
        )}

        {currentView === 'legal' && (
          <LegalPages
            page={legalPage}
            onBack={() => setCurrentView('landing')}
            supportWhatsapp={publicConfig.brand.supportWhatsapp}
            supportWhatsappRaw={publicConfig.brand.supportWhatsappRaw}
            supportEmail={publicConfig.brand.supportEmail}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        supportWhatsapp={publicConfig.brand.supportWhatsapp}
        supportWhatsappRaw={publicConfig.brand.supportWhatsappRaw}
        supportEmail={publicConfig.brand.supportEmail}
      />

      {/* Modals */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          currentAccessKey={account?.isPaid ? account.accessKey : undefined}
          onClose={() => setSelectedPlanForCheckout(null)}
          onShowToast={showToast}
        />
      )}

      {isKeyModalOpen && (
        <AccessKeyModal
          currentKey={getStoredAccessKey()}
          onClose={() => setIsKeyModalOpen(false)}
          onSuccess={(acc) => {
            setAccount(acc);
            refreshAccount();
          }}
          onOpenRecover={() => setIsRecoverModalOpen(true)}
          onShowToast={showToast}
        />
      )}

      {isRecoverModalOpen && (
        <RecoverKeyModal
          onClose={() => setIsRecoverModalOpen(false)}
          onKeyRecovered={() => {
            refreshAccount();
          }}
          onShowToast={showToast}
          supportWhatsappRaw={publicConfig.brand.supportWhatsappRaw}
        />
      )}

      {isHistoryModalOpen && (
        <HistoryModal
          items={historyItems}
          onSelect={handleHistorySelect}
          onDelete={handleHistoryDelete}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
