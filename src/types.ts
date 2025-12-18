// Delivery Operations Intelligence Platform - Types

export type DeliveryPartner = 'DoorDash' | 'UberEats' | 'GrubHub';
export type IssueType = 'missing_item' | 'late_delivery' | 'cancellation';
export type IssueStatus = 'open' | 'reviewed' | 'action_taken' | 'resolved';
export type ActionType = 'file_chargeback' | 'dismiss' | 'escalate';
export type Outcome = 'recovered' | 'ignored' | 'escalated';

export interface Store {
  store_id: string;
  name: string;
  city: string;
}

export interface OrderIssue {
  order_id: string;
  store_id: string;
  delivery_partner: DeliveryPartner;
  issue_type: IssueType;
  detected_at: string;
  estimated_cost: number;
  status: IssueStatus;
  ai_flag: boolean;
}

export interface AIInsight {
  order_id: string;
  root_cause: string;
  confidence_score: number;
  recommended_action: string;
  expected_recovery: number;
}

export interface ResolutionAction {
  order_id: string;
  action_taken: ActionType;
  taken_at: string;
  outcome: Outcome;
}

// API Response Types
export interface DashboardKPIs {
  issues_percentage: number;
  revenue_at_risk: number;
  chargebacks_filed: number;
  chargebacks_recovered: number;
  avg_resolution_hours: number;
}

export interface PaginationInfo {
  page: number;
  total_pages: number;
  total_items: number;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  issues: OrderIssue[];
  pagination: PaginationInfo;
}

export interface IssueDetailResponse {
  issue: OrderIssue;
  store: Store;
  insight: AIInsight | null;
  resolution_history: ResolutionAction[];
}

export interface ActionRequest {
  action: ActionType;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  updated_issue: OrderIssue;
  resolution: ResolutionAction;
}

export interface FiltersResponse {
  stores: Store[];
  partners: string[];
  issue_types: string[];
  statuses: string[];
}

// Filter state for dashboard
export interface DashboardFilters {
  store_id?: string;
  partner?: string;
  issue_type?: string;
  status?: string;
}