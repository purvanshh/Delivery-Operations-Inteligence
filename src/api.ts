// API Service Layer for Delivery Operations Intelligence Platform

import type {
    DashboardResponse,
    IssueDetailResponse,
    ActionRequest,
    ActionResponse,
    FiltersResponse,
    DashboardFilters,
    AIInsight,
} from './types';

const API_BASE = 'http://localhost:8000';

/**
 * Fetch dashboard data with KPIs and paginated issues
 */
export async function fetchDashboard(
    page: number = 1,
    perPage: number = 10,
    filters: DashboardFilters = {}
): Promise<DashboardResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (filters.store_id) params.append('store_id', filters.store_id);
    if (filters.partner) params.append('partner', filters.partner);
    if (filters.issue_type) params.append('issue_type', filters.issue_type);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE}/dashboard?${params}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch detailed information for a specific order issue
 */
export async function fetchIssueDetail(orderId: string): Promise<IssueDetailResponse> {
    const response = await fetch(`${API_BASE}/issues/${orderId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Trigger AI analysis for an order issue
 */
export async function analyzeIssue(orderId: string): Promise<{ success: boolean; insight: AIInsight }> {
    const response = await fetch(`${API_BASE}/issues/${orderId}/analyze`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Failed to analyze issue: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Take an action on an order issue
 */
export async function takeAction(orderId: string, action: ActionRequest): Promise<ActionResponse> {
    const response = await fetch(`${API_BASE}/issues/${orderId}/action`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
    });
    if (!response.ok) {
        throw new Error(`Failed to take action: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch available filter options
 */
export async function fetchFilters(): Promise<FiltersResponse> {
    const response = await fetch(`${API_BASE}/filters`);
    if (!response.ok) {
        throw new Error(`Failed to fetch filters: ${response.statusText}`);
    }
    return response.json();
}
