import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Store as StoreIcon,
    Truck,
    Calendar,
    DollarSign,
    Sparkles,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import { fetchIssueDetail, takeAction, analyzeIssue } from '../api';
import type { IssueDetailResponse, ActionType } from '../types';
import { StatusBadge } from '../components/StatusBadge';

const issueTypeLabels: Record<string, string> = {
    missing_item: 'Missing Item',
    late_delivery: 'Late Delivery',
    cancellation: 'Cancellation',
};

export const IssueDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<IssueDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<ActionType | null>(null);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        setLoading(true);
        setError(null);

        fetchIssueDetail(orderId)
            .then((response) => {
                setData(response);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch issue details');
                setLoading(false);
            });
    }, [orderId]);

    const handleAction = async (action: ActionType) => {
        if (!orderId) return;

        setActionLoading(action);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await takeAction(orderId, { action });
            setSuccessMessage(response.message);

            // Refresh data
            const updated = await fetchIssueDetail(orderId);
            setData(updated);
        } catch (err: any) {
            setError(err.message || 'Failed to perform action');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAnalyze = async () => {
        if (!orderId) return;

        setAnalyzeLoading(true);
        setError(null);

        try {
            await analyzeIssue(orderId);
            // Refresh data
            const updated = await fetchIssueDetail(orderId);
            setData(updated);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze issue');
        } finally {
            setAnalyzeLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading issue details...</p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <p className="text-red-700 font-medium">Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { issue, store, insight, resolution_history } = data;
    const isResolved = issue.status === 'resolved';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Order ID */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                    <span className="text-lg font-mono font-bold text-gray-900">
                        {issue.order_id}
                    </span>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                        <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-emerald-700">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* 1. Order Metadata Header */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Order Metadata
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <StoreIcon className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Store</p>
                                    <p className="font-medium text-gray-900">{store.name}</p>
                                    <p className="text-sm text-gray-500">{store.city}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Truck className="text-emerald-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Partner</p>
                                    <p className="font-medium text-gray-900">{issue.delivery_partner}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-violet-50 rounded-lg">
                                    <Calendar className="text-violet-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Detected</p>
                                    <p className="font-medium text-gray-900">{formatDate(issue.detected_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Issue Summary */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Issue Summary
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Issue Type</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {issueTypeLabels[issue.issue_type] || issue.issue_type}
                                </p>
                            </div>
                            <StatusBadge status={issue.status} />
                        </div>
                    </div>

                    {/* 3. Financial Impact */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Financial Impact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <DollarSign className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Cost</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${issue.estimated_cost.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            {insight && (
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-xl">
                                        <DollarSign className="text-emerald-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Expected Recovery</p>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            ${insight.expected_recovery.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. AI Insight Panel */}
                    <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-violet-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-violet-600" size={20} />
                                <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
                                    AI Insight
                                </h2>
                            </div>
                            {!insight && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzeLoading}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-white rounded-lg border border-violet-200 hover:bg-violet-50 disabled:opacity-50 transition-colors"
                                >
                                    {analyzeLoading ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    Analyze
                                </button>
                            )}
                        </div>

                        {insight ? (
                            <div className="bg-white rounded-xl p-5 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Root Cause</p>
                                    <p className="text-gray-900">{insight.root_cause}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Confidence</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-500 rounded-full"
                                                    style={{ width: `${insight.confidence_score * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {Math.round(insight.confidence_score * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Expected Recovery</p>
                                        <p className="text-lg font-semibold text-emerald-600">
                                            ${insight.expected_recovery.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Recommended Action</p>
                                    <p className="text-gray-900">{insight.recommended_action}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/50 rounded-xl p-6 text-center">
                                <p className="text-gray-500">
                                    No AI insight available yet. Click "Analyze" to generate insights.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 5. Action Buttons */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Actions
                        </h2>

                        {isResolved ? (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                                <CheckCircle className="text-emerald-600" size={20} />
                                <p className="text-emerald-700 font-medium">
                                    This issue has been resolved.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleAction('file_chargeback')}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    {actionLoading === 'file_chargeback' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    File Chargeback
                                </button>
                                <button
                                    onClick={() => handleAction('dismiss')}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    {actionLoading === 'dismiss' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => handleAction('escalate')}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-5 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 disabled:opacity-50 transition-colors"
                                >
                                    {actionLoading === 'escalate' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <ArrowUpRight size={18} />
                                    )}
                                    Escalate
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Resolution History (if any) */}
                    {resolution_history.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                Resolution History
                            </h2>
                            <div className="space-y-3">
                                {resolution_history.map((resolution, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">
                                                {resolution.action_taken.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(resolution.taken_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${resolution.outcome === 'recovered'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : resolution.outcome === 'escalated'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {resolution.outcome}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
