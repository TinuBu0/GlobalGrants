export interface GrantFilters {
  country?: string;
  category?: string;
  amount?: string;
}

export interface GrantApplicationData {
  grantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  category: string;
  situation: string;
  referralName?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface DebugMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

export interface GrantStats {
  totalGrantsDistributed: number;
  totalRecipients: number;
  totalCountries: number;
  successRate: number;
}
