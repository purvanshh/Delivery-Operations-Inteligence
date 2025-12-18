"""
Mock data generator for Delivery Operations Intelligence Platform.
Generates realistic delivery operations data for restaurant brands.
"""

from datetime import datetime, timedelta
import random
from typing import Optional
from models import OrderIssue, AIInsight, Store, ResolutionAction


# Stores - Restaurant locations
STORES: list[Store] = [
    Store(store_id="STR-001", name="Downtown Manhattan", city="New York"),
    Store(store_id="STR-002", name="Brooklyn Heights", city="New York"),
    Store(store_id="STR-003", name="Midtown Express", city="New York"),
    Store(store_id="STR-004", name="Venice Beach", city="Los Angeles"),
    Store(store_id="STR-005", name="Santa Monica", city="Los Angeles"),
    Store(store_id="STR-006", name="Hollywood Blvd", city="Los Angeles"),
    Store(store_id="STR-007", name="River North", city="Chicago"),
    Store(store_id="STR-008", name="Lincoln Park", city="Chicago"),
]

DELIVERY_PARTNERS = ["DoorDash", "UberEats", "GrubHub"]
ISSUE_TYPES = ["missing_item", "late_delivery", "cancellation"]
STATUSES = ["open", "reviewed", "action_taken", "resolved"]

# Root cause templates by issue type
ROOT_CAUSES = {
    "missing_item": [
        "Driver confirmed pickup but customer reported missing items. High likelihood of driver error based on pattern analysis.",
        "Restaurant kitchen confirmed all items packed. Driver photo shows incomplete order at delivery.",
        "Multiple similar reports from same driver in past week. Suggests systematic issue with this courier.",
        "Order modification made after kitchen confirmation. Communication gap between platform and restaurant.",
    ],
    "late_delivery": [
        "Driver took multiple orders simultaneously. Route optimization failure by delivery platform.",
        "Restaurant preparation time exceeded estimate by 25+ minutes. Kitchen understaffing detected.",
        "Driver app showed vehicle breakdown. No replacement driver assigned for 18 minutes.",
        "Peak hour surge with insufficient driver availability. Platform capacity planning issue.",
    ],
    "cancellation": [
        "Customer cancelled after 20-minute wait. Restaurant had already prepared order - full loss.",
        "Driver cancelled mid-route citing 'restaurant closed'. Store was open - driver error.",
        "Platform system error caused duplicate order. Customer cancelled second order.",
        "Payment declined after order acceptance. No chargeback possible - direct revenue loss.",
    ],
}

RECOMMENDED_ACTIONS = {
    "missing_item": [
        "File chargeback with DoorDash citing driver error. Include delivery photo evidence.",
        "Submit refund request through partner portal. Attach customer complaint ticket.",
        "Flag driver for review and file partial recovery claim.",
        "Escalate to partner account manager for expedited resolution.",
    ],
    "late_delivery": [
        "File service level agreement violation claim. Document promised vs actual delivery time.",
        "Request platform credit for customer compensation already issued.",
        "Submit for operational review - pattern indicates systemic issue.",
        "Dismiss - delay within acceptable threshold for peak hours.",
    ],
    "cancellation": [
        "File full order value chargeback. Food was prepared before cancellation.",
        "Submit lost revenue claim through partner dispute process.",
        "Escalate to partnership team for policy exception review.",
        "Dismiss - cancellation was within platform's allowed window.",
    ],
}


def generate_mock_data():
    """Generate comprehensive mock data for the platform."""
    
    issues: list[OrderIssue] = []
    insights: dict[str, AIInsight] = {}
    resolutions: dict[str, list[ResolutionAction]] = {}
    
    base_date = datetime.now()
    
    for i in range(1, 53):  # Generate 52 issues
        order_id = f"ORD-{10000 + i}"
        store = random.choice(STORES)
        partner = random.choice(DELIVERY_PARTNERS)
        issue_type = random.choice(ISSUE_TYPES)
        
        # Vary the detection time over the past 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        detected_at = base_date - timedelta(days=days_ago, hours=hours_ago)
        
        # Cost varies by issue type
        if issue_type == "missing_item":
            estimated_cost = round(random.uniform(8, 45), 2)
        elif issue_type == "late_delivery":
            estimated_cost = round(random.uniform(5, 25), 2)  # Compensation/credits
        else:  # cancellation
            estimated_cost = round(random.uniform(20, 85), 2)
        
        # Status distribution - more open issues for realistic feel
        status_weights = [0.35, 0.25, 0.20, 0.20]  # open, reviewed, action_taken, resolved
        status = random.choices(STATUSES, weights=status_weights)[0]
        
        # AI flags more issues for attention
        ai_flag = random.random() < 0.7
        
        # Calculate recovered amount based on status and action
        recovered_amount = 0.0
        action_taken = None
        
        # Generate resolution history for non-open issues
        if status in ["action_taken", "resolved"]:
            action_options = ["file_chargeback", "dismiss", "escalate"]
            action_taken = random.choice(action_options)
            
            # Set recovered amount based on action
            if action_taken == "file_chargeback" and status == "resolved":
                # Successful chargeback: recover 85-100% of estimated cost
                recovered_amount = round(estimated_cost * random.uniform(0.85, 1.0), 2)
            elif action_taken == "escalate":
                # Escalated: pending recovery (stays 0)
                recovered_amount = 0.0
            else:
                # Dismissed: no recovery
                recovered_amount = 0.0
            
            outcome_map = {
                "file_chargeback": "recovered",
                "dismiss": "ignored",
                "escalate": "escalated",
            }
            
            resolution = ResolutionAction(
                order_id=order_id,
                action_taken=action_taken,
                taken_at=detected_at + timedelta(hours=random.randint(2, 72)),
                outcome=outcome_map[action_taken],
            )
            resolutions[order_id] = [resolution]
        
        issue = OrderIssue(
            order_id=order_id,
            store_id=store.store_id,
            delivery_partner=partner,
            issue_type=issue_type,
            detected_at=detected_at,
            estimated_cost=estimated_cost,
            status=status,
            ai_flag=ai_flag,
            recovered_amount=recovered_amount,
        )
        issues.append(issue)
        
        # Generate AI insight for most issues
        if random.random() < 0.85:
            confidence = round(random.uniform(0.65, 0.98), 2)
            recovery_rate = random.uniform(0.7, 0.95)
            
            insight = AIInsight(
                order_id=order_id,
                root_cause=random.choice(ROOT_CAUSES[issue_type]),
                confidence_score=confidence,
                recommended_action=random.choice(RECOMMENDED_ACTIONS[issue_type]),
                expected_recovery=round(estimated_cost * recovery_rate, 2),
            )
            insights[order_id] = insight
    
    return {
        "stores": STORES,
        "issues": issues,
        "insights": insights,
        "resolutions": resolutions,
    }


# Generate data once at module load
MOCK_DATA = generate_mock_data()


def get_stores() -> list[Store]:
    return MOCK_DATA["stores"]


def get_all_issues() -> list[OrderIssue]:
    return MOCK_DATA["issues"]


def get_issue(order_id: str) -> Optional[OrderIssue]:
    for issue in MOCK_DATA["issues"]:
        if issue.order_id == order_id:
            return issue
    return None


def get_store(store_id: str) -> Optional[Store]:
    for store in MOCK_DATA["stores"]:
        if store.store_id == store_id:
            return store
    return None


def get_insight(order_id: str) -> Optional[AIInsight]:
    return MOCK_DATA["insights"].get(order_id)


def get_resolutions(order_id: str) -> list[ResolutionAction]:
    return MOCK_DATA["resolutions"].get(order_id, [])


def update_issue_status(order_id: str, new_status: str) -> Optional[OrderIssue]:
    """Update issue status and return the updated issue."""
    for i, issue in enumerate(MOCK_DATA["issues"]):
        if issue.order_id == order_id:
            updated = issue.model_copy(update={"status": new_status})
            MOCK_DATA["issues"][i] = updated
            return updated
    return None


def update_issue_with_recovery(order_id: str, new_status: str, recovered_amount: float) -> Optional[OrderIssue]:
    """Update issue status and recovered amount, return the updated issue."""
    for i, issue in enumerate(MOCK_DATA["issues"]):
        if issue.order_id == order_id:
            updated = issue.model_copy(update={
                "status": new_status,
                "recovered_amount": recovered_amount
            })
            MOCK_DATA["issues"][i] = updated
            return updated
    return None


def add_resolution(resolution: ResolutionAction) -> None:
    """Add a resolution action to the history."""
    order_id = resolution.order_id
    if order_id not in MOCK_DATA["resolutions"]:
        MOCK_DATA["resolutions"][order_id] = []
    MOCK_DATA["resolutions"][order_id].append(resolution)


def generate_insight(order_id: str) -> Optional[AIInsight]:
    """Generate a new AI insight for an order."""
    issue = get_issue(order_id)
    if not issue:
        return None
    
    confidence = round(random.uniform(0.72, 0.96), 2)
    recovery_rate = random.uniform(0.75, 0.92)
    
    insight = AIInsight(
        order_id=order_id,
        root_cause=random.choice(ROOT_CAUSES[issue.issue_type]),
        confidence_score=confidence,
        recommended_action=random.choice(RECOMMENDED_ACTIONS[issue.issue_type]),
        expected_recovery=round(issue.estimated_cost * recovery_rate, 2),
    )
    MOCK_DATA["insights"][order_id] = insight
    return insight
