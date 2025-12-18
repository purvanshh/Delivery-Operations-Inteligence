from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class Store(BaseModel):
    store_id: str
    name: str
    city: str


class OrderIssue(BaseModel):
    order_id: str
    store_id: str
    delivery_partner: Literal["DoorDash", "UberEats", "GrubHub"]
    issue_type: Literal["missing_item", "late_delivery", "cancellation"]
    detected_at: datetime
    estimated_cost: float
    status: Literal["open", "reviewed", "action_taken", "resolved"]
    ai_flag: bool
    recovered_amount: float = 0


class AIInsight(BaseModel):
    order_id: str
    root_cause: str
    confidence_score: float  # 0.0-1.0
    recommended_action: str
    expected_recovery: float


class ResolutionAction(BaseModel):
    order_id: str
    action_taken: Literal["file_chargeback", "dismiss", "escalate"]
    taken_at: datetime
    outcome: Literal["recovered", "ignored", "escalated"]


# Request/Response models for API
class DashboardKPIs(BaseModel):
    issues_percentage: float
    revenue_at_risk: float
    chargebacks_filed: int
    chargebacks_recovered: int
    avg_resolution_hours: float
    total_recovered: float
    recovery_rate: float
    pending_recovery: float


class PaginationInfo(BaseModel):
    page: int
    total_pages: int
    total_items: int


class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    issues: list[OrderIssue]
    pagination: PaginationInfo
    last_updated: datetime


class IssueDetailResponse(BaseModel):
    issue: OrderIssue
    store: Store
    insight: Optional[AIInsight]
    resolution_history: list[ResolutionAction]


class ActionRequest(BaseModel):
    action: Literal["file_chargeback", "dismiss", "escalate"]


class ActionResponse(BaseModel):
    success: bool
    message: str
    updated_issue: OrderIssue
    resolution: ResolutionAction


class FiltersResponse(BaseModel):
    stores: list[Store]
    partners: list[str]
    issue_types: list[str]
    statuses: list[str]
