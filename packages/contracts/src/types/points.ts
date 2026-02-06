/**
 * Points and loyalty program types.
 */

export type PointsProgramType = 'airline' | 'hotel' | 'credit_card' | 'other';

export type PointsTransactionType =
  | 'earned'
  | 'redeemed'
  | 'transferred'
  | 'expired'
  | 'adjustment';

export interface PointsAccount {
  id: string;
  programType: PointsProgramType;
  programName: string;
  membershipTier: string | null;
  currentBalance: number;
  pendingPoints: number;
  expiringPoints: number | null;
  expirationDate: string | null;  // ISO 8601
  annualFee: number | null;
  nextFeeDate: string | null;  // ISO 8601
  notes: string | null;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

export interface PointsAccountWithTransactions extends PointsAccount {
  transactions: PointsTransaction[];
}

export interface PointsTransaction {
  id: string;
  type: PointsTransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;  // ISO 8601
  tripItemId: string | null;
  createdAt: string;  // ISO 8601
}

export interface CreatePointsAccount {
  programType: PointsProgramType;
  programName: string;
  accountNumber?: string;
  membershipTier?: string;
  currentBalance?: number;
  pendingPoints?: number;
  expiringPoints?: number;
  expirationDate?: string;
  annualFee?: number;
  nextFeeDate?: string;
  notes?: string;
}

export interface CreatePointsTransaction {
  type: PointsTransactionType;
  amount: number;
  description?: string;
  transactionDate: string;
  tripItemId?: string;
}
