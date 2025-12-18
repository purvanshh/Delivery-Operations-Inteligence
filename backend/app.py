"""
Delivery Operations Intelligence Platform - Backend API
FastAPI backend for restaurant delivery operations management.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import math

from models import (
    DashboardResponse,
    DashboardKPIs,
    PaginationInfo,
    IssueDetailResponse,
    ActionRequest,
    ActionResponse,
    FiltersResponse,
    ResolutionAction,
)
from mock_data import (
    get_all_issues,
    get_issue,
    get_store,
    get_stores,
    get_insight,
    get_resolutions,
    update_issue_status,
    add_resolution,
    generate_insight,
    DELIVERY_PARTNERS,
    ISSUE_TYPES,
    STATUSES,
)

app = FastAPI(
    title="Delivery Operations Intelligence API",
    description="API for managing delivery issues, AI insights, and resolutions",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Delivery Operations Intelligence Platform API",
        "version": "1.0.0",
        "endpoints": [
            "/dashboard",
            "/issues/{order_id}",
            "/issues/{order_id}/analyze",
            "/issues/{order_id}/action",
            "/filters",
        ],
    }


@app.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    store_id: Optional[str] = None,
    partner: Optional[str] = None,
    issue_type: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    Get dashboard with KPIs and paginated order issues.
    
    Returns key performance indicators and a filtered, paginated list of issues.
    """
    all_issues = get_all_issues()
    
    # Apply filters
    filtered_issues = all_issues
    
    if store_id:
        filtered_issues = [i for i in filtered_issues if i.store_id == store_id]
    if partner:
        filtered_issues = [i for i in filtered_issues if i.delivery_partner == partner]
    if issue_type:
        filtered_issues = [i for i in filtered_issues if i.issue_type == issue_type]
    if status:
        filtered_issues = [i for i in filtered_issues if i.status == status]
    
    # Sort by detected_at (most recent first)
    filtered_issues = sorted(filtered_issues, key=lambda x: x.detected_at, reverse=True)
    
    # Calculate KPIs from all issues (not filtered)
    total_orders = len(all_issues) * 25  # Assume issues are ~4% of total orders
    issues_with_problems = len(all_issues)
    
    open_issues = [i for i in all_issues if i.status == "open"]
    resolved_issues = [i for i in all_issues if i.status == "resolved"]
    actioned_issues = [i for i in all_issues if i.status in ["action_taken", "resolved"]]
    
    revenue_at_risk = sum(i.estimated_cost for i in all_issues if i.status != "resolved")
    chargebacks_filed = len(actioned_issues)
    chargebacks_recovered = len(resolved_issues)
    
    # Average resolution time (mock: 12-36 hours)
    avg_resolution_hours = 18.5
    
    kpis = DashboardKPIs(
        issues_percentage=round((issues_with_problems / total_orders) * 100, 1),
        revenue_at_risk=round(revenue_at_risk, 2),
        chargebacks_filed=chargebacks_filed,
        chargebacks_recovered=chargebacks_recovered,
        avg_resolution_hours=avg_resolution_hours,
    )
    
    # Paginate
    total_items = len(filtered_issues)
    total_pages = math.ceil(total_items / per_page) or 1
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_issues = filtered_issues[start_idx:end_idx]
    
    pagination = PaginationInfo(
        page=page,
        total_pages=total_pages,
        total_items=total_items,
    )
    
    return DashboardResponse(
        kpis=kpis,
        issues=paginated_issues,
        pagination=pagination,
    )


@app.get("/issues/{order_id}", response_model=IssueDetailResponse)
def get_issue_detail(order_id: str):
    """
    Get detailed information for a specific order issue.
    
    Returns the issue, store info, AI insight, and resolution history.
    """
    issue = get_issue(order_id)
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue {order_id} not found")
    
    store = get_store(issue.store_id)
    if not store:
        raise HTTPException(status_code=404, detail=f"Store {issue.store_id} not found")
    
    insight = get_insight(order_id)
    resolutions = get_resolutions(order_id)
    
    return IssueDetailResponse(
        issue=issue,
        store=store,
        insight=insight,
        resolution_history=resolutions,
    )


@app.post("/issues/{order_id}/analyze")
def analyze_issue(order_id: str):
    """
    Generate or refresh AI insight for an order issue.
    
    Uses AI analysis to determine root cause and recommended action.
    """
    issue = get_issue(order_id)
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue {order_id} not found")
    
    insight = generate_insight(order_id)
    
    # Update issue status to reviewed if it was open
    if issue.status == "open":
        update_issue_status(order_id, "reviewed")
    
    return {
        "success": True,
        "message": "AI analysis completed",
        "insight": insight,
    }


@app.post("/issues/{order_id}/action", response_model=ActionResponse)
def take_action(order_id: str, request: ActionRequest):
    """
    Take an action on an order issue.
    
    Updates issue status and creates a resolution record.
    """
    issue = get_issue(order_id)
    if not issue:
        raise HTTPException(status_code=404, detail=f"Issue {order_id} not found")
    
    # Map action to outcome
    outcome_map = {
        "file_chargeback": "recovered",
        "dismiss": "ignored",
        "escalate": "escalated",
    }
    
    # Determine new status
    new_status = "resolved" if request.action == "file_chargeback" else "action_taken"
    
    # Create resolution record
    resolution = ResolutionAction(
        order_id=order_id,
        action_taken=request.action,
        taken_at=datetime.now(),
        outcome=outcome_map[request.action],
    )
    
    # Update data
    add_resolution(resolution)
    updated_issue = update_issue_status(order_id, new_status)
    
    if not updated_issue:
        raise HTTPException(status_code=500, detail="Failed to update issue")
    
    action_messages = {
        "file_chargeback": f"Chargeback filed for {order_id}. Expected recovery: ${issue.estimated_cost:.2f}",
        "dismiss": f"Issue {order_id} dismissed. No further action required.",
        "escalate": f"Issue {order_id} escalated to account manager for review.",
    }
    
    return ActionResponse(
        success=True,
        message=action_messages[request.action],
        updated_issue=updated_issue,
        resolution=resolution,
    )


@app.get("/filters", response_model=FiltersResponse)
def get_filters():
    """
    Get available filter options for the dashboard.
    """
    return FiltersResponse(
        stores=get_stores(),
        partners=DELIVERY_PARTNERS,
        issue_types=ISSUE_TYPES,
        statuses=STATUSES,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
