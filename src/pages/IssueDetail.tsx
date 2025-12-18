import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Clock,
} from 'lucide-react';
import { fetchIssueDetail, takeAction, analyzeIssue } from '../api';
import type { IssueDetailResponse, ActionType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';

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
    const [actionSuccess, setActionSuccess] = useState<ActionType | null>(null);

    // Handle Escape key to go back
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate('/');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    useEffect(() => {
        if (!orderId) return;

        setLoading(true);
        setError(null);

        console.log(`[Audit] Loading issue detail: ${orderId}`);

        fetchIssueDetail(orderId)
            .then((response) => {
                setData(response);
                setLoading(false);
            })
            .catch((err) => {
                console.error(`[Audit] Failed to load issue ${orderId}:`, err);
                setError(err.message || 'Failed to fetch issue details');
                setLoading(false);
            });
    }, [orderId]);

    const handleAction = async (action: ActionType) => {
        if (!orderId) return;

        console.log(`[Audit] Action initiated: ${action} for ${orderId}`);
        setActionLoading(action);
        setError(null);
        setSuccessMessage(null);
        setActionSuccess(null);

        try {
            const response = await takeAction(orderId, { action });
            console.log(`[Audit] Action completed: ${action} for ${orderId}`, response);
            setSuccessMessage(response.message);
            setActionSuccess(action);

            // Refresh data
            const updated = await fetchIssueDetail(orderId);
            setData(updated);

            // Clear success state after animation
            setTimeout(() => setActionSuccess(null), 2000);
        } catch (err: any) {
            console.error(`[Audit] Action failed: ${action} for ${orderId}`, err);
            setError(err.message || 'Failed to perform action');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAnalyze = async () => {
        if (!orderId) return;

        console.log(`[Audit] Analyzing issue: ${orderId}`);
        setAnalyzeLoading(true);
        setError(null);

        try {
            await analyzeIssue(orderId);
            // Refresh data
            const updated = await fetchIssueDetail(orderId);
            setData(updated);
            console.log(`[Audit] Analysis complete for ${orderId}`);
        } catch (err: any) {
            console.error(`[Audit] Analysis failed for ${orderId}`, err);
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

    // Render recovered amount section
    const renderRecoveredAmount = () => {
        if (!data) return null;
        const { issue, resolution_history } = data;

        if (issue.status === 'resolved' && issue.recovered_amount > 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4"
                >
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <CheckCircle className="text-emerald-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Recovered Amount</p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-bold text-emerald-600"
                        >
                            ${issue.recovered_amount.toFixed(2)}
                        </motion.p>
                    </div>
                </motion.div>
            );
        }

        // Check if escalated (pending recovery)
        const isEscalated = resolution_history.some(r => r.action_taken === 'escalate');
        if (issue.status === 'action_taken' && isEscalated) {
            return (
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Clock className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Recovery Status</p>
                        <p className="text-lg font-semibold text-amber-600" title="Issue escalated — awaiting resolution">
                            Pending Recovery
                        </p>
                        <p className="text-xs text-gray-400">Escalated to account manager</p>
                    </div>
                </div>
            );
        }

        // Dismissed
        const isDismissed = resolution_history.some(r => r.action_taken === 'dismiss');
        if (issue.status === 'action_taken' && isDismissed) {
            return (
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                        <XCircle className="text-gray-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Recovery Status</p>
                        <p className="text-lg font-medium text-gray-600">
                            No Recovery — Dismissed
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading issue details...</p>
                </motion.div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <EmptyState variant="error" onRetry={() => window.location.reload()} />
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { issue, store, insight, resolution_history } = data;
    const isResolved = issue.status === 'resolved';
    const hasResolutionHistory = resolution_history.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button & Order ID */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
                        aria-label="Back to dashboard"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>
                    <span className="text-lg font-mono font-bold text-gray-900">
                        {issue.order_id}
                    </span>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
                        >
                            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-emerald-700">{successMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    {/* 1. Order Metadata Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80"
                    >
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
                    </motion.div>

                    {/* 2. Issue Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80"
                    >
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
                    </motion.div>

                    {/* 3. Financial Impact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80"
                    >
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Financial Impact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <Sparkles className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Expected Recovery</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${insight.expected_recovery.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {renderRecoveredAmount()}
                        </div>
                    </motion.div>

                    {/* 4. AI Insight Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-violet-100/80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-violet-600" size={20} />
                                <h2 className="text-sm font-semibold text-violet-600 uppercase tracking-wider">
                                    AI Insight
                                </h2>
                            </div>
                            {!insight && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAnalyze}
                                    disabled={analyzeLoading}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 bg-white rounded-lg border border-violet-200 hover:bg-violet-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    aria-label="Generate AI analysis"
                                >
                                    {analyzeLoading ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    Analyze
                                </motion.button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {insight ? (
                                <motion.div
                                    key="insight"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl p-5 space-y-4"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Root Cause</p>
                                        <p className="text-gray-900">{insight.root_cause}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 mb-2">Confidence</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${insight.confidence_score * 100}%` }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
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
                                </motion.div>
                            ) : analyzeLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white/50 rounded-xl p-8 text-center"
                                >
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto mb-2" />
                                    <p className="text-gray-500">Analyzing order details...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white/50 rounded-xl p-6 text-center"
                                >
                                    <p className="text-gray-500">
                                        AI insight unavailable — manual review recommended.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Click "Analyze" to generate insights.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* 5. Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80"
                    >
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Actions
                        </h2>

                        {isResolved ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl"
                            >
                                <CheckCircle className="text-emerald-600" size={20} />
                                <p className="text-emerald-700 font-medium">
                                    This issue has been resolved.
                                </p>
                            </motion.div>
                        ) : hasResolutionHistory ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl"
                            >
                                <AlertCircle className="text-blue-600" size={20} />
                                <p className="text-blue-700 font-medium">
                                    Action already taken on this issue.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAction('file_chargeback')}
                                    disabled={actionLoading !== null}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${actionSuccess === 'file_chargeback'
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
                                        } disabled:opacity-50`}
                                    aria-label={`File chargeback for order ${issue.order_id}`}
                                >
                                    {actionLoading === 'file_chargeback' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : actionSuccess === 'file_chargeback' ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    File Chargeback
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAction('dismiss')}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                    aria-label={`Dismiss issue ${issue.order_id}`}
                                >
                                    {actionLoading === 'dismiss' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    Dismiss
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAction('escalate')}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-5 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                                    aria-label={`Escalate issue ${issue.order_id}`}
                                >
                                    {actionLoading === 'escalate' ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <ArrowUpRight size={18} />
                                    )}
                                    Escalate
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Resolution History (if any) */}
                    <AnimatePresence>
                        {resolution_history.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80"
                            >
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    Resolution History
                                </h2>
                                <div className="space-y-3">
                                    {resolution_history.map((resolution, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.35 + index * 0.05 }}
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
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
