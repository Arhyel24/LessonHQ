export type AffiliateStatus =
  | "Completed"
  | "Course Started"
  | "Registered"
  | "Pending";

export interface AffiliateHistoryItem {
  id: string;
  name: string;
  dateReferred: string;
  status: AffiliateStatus;
  reward: number;
}

export interface AffiliateDashboardData {
  totalEarnings: number;
  successfulAffiliates: number;
  pendingAffiliates: number;
  withdrawableBalance: number;
  AffiliateLink: string;
  earningsThisMonth: number;
  history: AffiliateHistoryItem[];
}
