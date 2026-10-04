'use client';

import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'USD' | 'LKR' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
};

// Rates normalized to USD
const RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  LKR: 305.0,
  EUR: 0.92,
  GBP: 0.78,
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencyInfo: CurrencyInfo;
  convertFee: (feeStr: string | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  currencyInfo: CURRENCIES.USD,
  convertFee: (str) => str || 'Free',
});

const STORAGE_KEY = 'uc_preferred_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return 'USD';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        return saved;
      }
    } catch {
      // ignore local storage errors
    }
    return 'USD';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  };

  /**
   * Intelligently parses admission fees (e.g. 'USD 30 (Foreign Adults)', 'LKR 500', 'Free')
   * and translates into the user's selected active currency with clean formatting.
   */
  const convertFee = (feeStr: string | null | undefined): string => {
    if (!feeStr || typeof feeStr !== 'string') return 'Free';
    const trimmed = feeStr.trim();
    if (trimmed.toLowerCase().includes('free')) return 'Free';

    // 1. Detect USD-based fee: "USD 30 ...", "$30 ..."
    const usdMatch = trimmed.match(/(?:USD|\$)\s*(\d+(?:\.\d+)?)(.*)/i);
    if (usdMatch) {
      const amountUSD = parseFloat(usdMatch[1]);
      const suffix = (usdMatch[2] || '').trim();

      const converted = amountUSD * RATES_FROM_USD[currency];
      let formatted = '';

      if (currency === 'LKR') {
        formatted = `Rs. ${Math.round(converted).toLocaleString('en-US')}`;
      } else if (currency === 'USD') {
        formatted = `$${amountUSD % 1 === 0 ? amountUSD : amountUSD.toFixed(2)}`;
      } else if (currency === 'EUR') {
        formatted = `€${Math.round(converted)}`;
      } else if (currency === 'GBP') {
        formatted = `£${Math.round(converted)}`;
      }

      return suffix ? `${formatted} ${suffix}` : formatted;
    }

    // 2. Detect LKR-based fee: "LKR 1200 ...", "Rs. 500 ..."
    const lkrMatch = trimmed.match(/(?:LKR|Rs\.?)\s*(\d+(?:,\d+)?)(.*)/i);
    if (lkrMatch) {
      const amountLKR = parseFloat(lkrMatch[1].replace(/,/g, ''));
      const suffix = (lkrMatch[2] || '').trim();

      const amountUSD = amountLKR / RATES_FROM_USD.LKR;
      const converted = amountUSD * RATES_FROM_USD[currency];
      let formatted = '';

      if (currency === 'LKR') {
        formatted = `Rs. ${Math.round(amountLKR).toLocaleString('en-US')}`;
      } else if (currency === 'USD') {
        formatted = `$${converted < 5 ? converted.toFixed(2) : Math.round(converted)}`;
      } else if (currency === 'EUR') {
        formatted = `€${converted < 5 ? converted.toFixed(2) : Math.round(converted)}`;
      } else if (currency === 'GBP') {
        formatted = `£${converted < 5 ? converted.toFixed(2) : Math.round(converted)}`;
      }

      return suffix ? `${formatted} ${suffix}` : formatted;
    }

    return trimmed;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyInfo: CURRENCIES[currency],
        convertFee,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
