export interface ProductInput {
  name: string;
  category?: string;
  price?: string | number;
  features: string;
  targetCustomer?: string;
  offer?: string;
  platform?: string;
  language?: string;
  tone?: string;
}

export interface PartAOutput {
  titleOptions: string[];
  description: string;
  bulletPoints: string[];
}

export interface PartBOutput {
  instagramCaption: string;
  hashtags: string[];
  adCopy: {
    headline: string;
    primaryText: string;
    callToAction: string;
  };
}

export interface PartCOutput {
  reelScript: {
    hook: string;
    scene1: string;
    scene2: string;
    scene3: string;
    callToAction: string;
  };
  whatsappMessage: string;
}

export interface ContentPack {
  partA?: PartAOutput;
  partB?: PartBOutput;
  partC?: PartCOutput;
  errors?: {
    partA?: string;
    partB?: string;
    partC?: string;
  };
  safetyRefusal?: string;
}

export interface SavedGeneration {
  id: string;
  timestamp: string;
  productName: string;
  category?: string;
  content: ContentPack;
}

export interface AccountState {
  valid: boolean;
  isPaid: boolean;
  planId: string;
  planName: string;
  accessKey?: string;
  expiresAt?: string;
  daysLeft?: number;
  isExpired?: boolean;
  limit: number;
  used: number;
  remainingGens: number;
  needsRenewal?: boolean;
}

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  days: number;
  limit: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}
