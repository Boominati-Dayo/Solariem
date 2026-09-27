export const DEFAULT_CURRENCY = 'USD';

export const COUNTRY_CURRENCIES: Record<string, string> = {
  AU: 'AUD',
  CA: 'CAD',
  GB: 'GBP',
  US: 'USD',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  AT: 'EUR',
  BE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  LU: 'EUR',
  PT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  CH: 'CHF',
  NZ: 'NZD',
  SG: 'SGD',
  HK: 'HKD',
  KR: 'KRW',
  IN: 'INR',
  BR: 'BRL',
  MX: 'MXN',
  ZA: 'ZAR',
  NG: 'NGN',
  AE: 'AED',
  SA: 'SAR',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  TR: 'TRY',
  IL: 'ILS',
  RU: 'RUB',
  ID: 'IDR',
  MY: 'MYR',
  TH: 'THB',
  PH: 'PHP',
  VN: 'VND',
  AR: 'ARS',
  CL: 'CLP',
  CO: 'COP',
  PE: 'PEN',
  EG: 'EGP',
  KE: 'KES',
  GH: 'GHS',
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
  NP: 'NPR',
  QA: 'QAR',
  KW: 'KWD',
  OM: 'OMR',
  BH: 'BHD',
  JO: 'JOD',
  LB: 'LBP',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AUD: '$',
  CAD: '$',
  NZD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  CHF: 'CHF',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  ZAR: 'R',
  NGN: '₦',
  AED: 'د.إ',
  SAR: '﷼',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  TRY: '₺',
  ILS: '₪',
  RUB: '₽',
  IDR: 'Rp',
  MYR: 'RM',
  THB: '฿',
  PHP: '₱',
  VND: '₫',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  EGP: '£',
  KES: 'KSh',
  GHS: 'GH₵',
  PKR: '₨',
  BDT: '৳',
  LKR: '₨',
  NPR: '₨',
  QAR: '﷼',
  KWD: 'د.ك',
  OMR: '﷼',
  BHD: '.د.ب',
  JOD: 'د.ا',
  LBP: 'ل.ل',
};

export function getCurrencyForCountry(country?: string | null): string {
  if (!country) return DEFAULT_CURRENCY;
  const code = country.trim().toUpperCase();
  return COUNTRY_CURRENCIES[code] || DEFAULT_CURRENCY;
}

export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return CURRENCY_SYMBOLS[DEFAULT_CURRENCY] || DEFAULT_CURRENCY;
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
}

export function formatCurrency(amount: number, currency?: string | null): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(code)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
