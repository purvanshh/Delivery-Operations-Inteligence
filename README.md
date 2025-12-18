# Delivery Operations Intelligence Platform

> A frontend-heavy operations intelligence platform that helps restaurant teams identify, prioritize, and resolve costly delivery issues using AI-driven insights.

<p align="center">
  <img src="assets/dashboard.png" alt="Dashboard" width="100%" />
</p>

## Problem

Third-party delivery platforms (DoorDash, UberEats, GrubHub) create significant **revenue leakage** for restaurant brands through:

- Missing items not refunded
- Late deliveries requiring customer compensation
- Cancellations after food preparation
- Failed chargebacks and dispute processes

Without a centralized system, operations teams spend hours manually tracking issues and recovering lost revenue.

## Solution

This platform provides restaurant operators with a **single pane of glass** to:

1. **Monitor** — Real-time KPIs showing revenue at risk and resolution status
2. **Identify** — AI-flagged issues prioritized by financial impact
3. **Analyze** — Root cause analysis with confidence scores
4. **Resolve** — One-click actions to file chargebacks, dismiss, or escalate

## Core Workflow

```
Issue Detected → AI Analysis → Human Decision → Action Taken → Revenue Recovered
```

### Dashboard View
- Track orders with issues (%), revenue at risk, chargeback recovery rate
- Filter by store, delivery partner, issue type, status
- Click any issue to deep dive

### Issue Deep Dive
- Order metadata and financial impact
- AI-generated root cause and recommended action
- Take action: File Chargeback, Dismiss, or Escalate
- Changes sync back to dashboard instantly

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Data | Mock data simulating real operations |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd delivery-operations-intelligence

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | KPIs + paginated issues list |
| `/issues/{order_id}` | GET | Issue details + AI insight |
| `/issues/{order_id}/analyze` | POST | Generate AI insight |
| `/issues/{order_id}/action` | POST | Take action on issue |
| `/filters` | GET | Available filter options |

## Project Structure

```
├── backend/
│   ├── app.py          # FastAPI application
│   ├── models.py       # Pydantic data models
│   └── mock_data.py    # Realistic mock data generator
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Main dashboard screen
│   │   └── IssueDetail.tsx    # Issue deep dive screen
│   ├── components/
│   │   ├── KPICard.tsx        # Metric display cards
│   │   ├── IssuesTable.tsx    # Clickable issues table
│   │   ├── FilterBar.tsx      # Filter dropdowns
│   │   └── StatusBadge.tsx    # Status indicators
│   ├── api.ts          # API service layer
│   └── types.ts        # TypeScript definitions
└── README.md
```

## Screenshots

### Dashboard
![Dashboard](assets/dashboard.png)

### Issue Deep Dive
![Issue Detail](assets/issue-detail.png)

---

## License

Apache License 2.0
