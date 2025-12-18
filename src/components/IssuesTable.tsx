import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { OrderIssue, Store } from '../types';
import { StatusBadge } from './StatusBadge';
import { AIFlagBadge } from './AIFlagBadge';
import { EmptyState } from './EmptyState';

interface IssuesTableProps {
    issues: OrderIssue[];
    stores: Map<string, Store>;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

const issueTypeLabels: Record<string, string> = {
    missing_item: 'Missing Item',
    late_delivery: 'Late Delivery',
    cancellation: 'Cancellation',
};

const partnerColors: Record<string, string> = {
    DoorDash: 'text-red-600',
    UberEats: 'text-emerald-600',
    GrubHub: 'text-orange-600',
};

// Performance: skip animations for large tables
const ANIMATION_THRESHOLD = 20;

export const IssuesTable: React.FC<IssuesTableProps> = ({
    issues,
    stores,
    loading,
    error,
    onRetry,
}) => {
    const navigate = useNavigate();
    const shouldAnimate = issues.length <= ANIMATION_THRESHOLD;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    const handleRowClick = (orderId: string) => {
        console.log(`[Audit] Navigating to issue detail: ${orderId}`);
        navigate(`/issues/${orderId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent, orderId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick(orderId);
        }
    };

    // Render recovered amount based on status
    const renderRecoveredAmount = (issue: OrderIssue) => {
        if (issue.status === 'resolved' && issue.recovered_amount > 0) {
            return (
                <span className="text-emerald-600 font-semibold">
                    ${issue.recovered_amount.toFixed(2)}
                </span>
            );
        }
        if (issue.status === 'action_taken') {
            return (
                <span
                    className="text-amber-600 text-sm italic cursor-help"
                    title="Recovery pending — awaiting resolution"
                >
                    Pending
                </span>
            );
        }
        return <span className="text-gray-400">—</span>;
    };

    // Error state
    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <EmptyState variant="error" onRetry={onRetry} />
            </div>
        );
    }

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="animate-pulse p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-4 w-24 bg-gray-100 rounded" />
                                <div className="h-4 w-32 bg-gray-100 rounded" />
                                <div className="h-4 w-20 bg-gray-100 rounded" />
                                <div className="h-4 w-28 bg-gray-100 rounded" />
                                <div className="h-4 w-16 bg-gray-100 rounded" />
                                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                                <div className="flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (issues.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <EmptyState variant="no-results" />
            </div>
        );
    }

    const RowWrapper = shouldAnimate ? motion.tr : 'tr';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Store
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Partner
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Issue Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Est. Cost
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Recovered
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                AI
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Detected
                            </th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {issues.map((issue, index) => {
                            const store = stores.get(issue.store_id);
                            const rowProps = shouldAnimate ? {
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: index * 0.03, duration: 0.2 },
                                whileHover: { backgroundColor: 'rgba(249, 250, 251, 0.8)' },
                            } : {};

                            return (
                                <RowWrapper
                                    key={issue.order_id}
                                    {...rowProps}
                                    onClick={() => handleRowClick(issue.order_id)}
                                    onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, issue.order_id)}
                                    className="hover:bg-gray-50/80 cursor-pointer transition-colors group focus:outline-none focus:bg-blue-50/50"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for order ${issue.order_id}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-medium text-gray-900">
                                            {issue.order_id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {store?.name || issue.store_id}
                                            </p>
                                            <p className="text-xs text-gray-500">{store?.city}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${partnerColors[issue.delivery_partner] || 'text-gray-600'}`}>
                                            {issue.delivery_partner}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">
                                            {issueTypeLabels[issue.issue_type] || issue.issue_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            ${issue.estimated_cost.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderRecoveredAmount(issue)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={issue.status} animate={shouldAnimate} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <AIFlagBadge flagged={issue.ai_flag} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(issue.detected_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <ChevronRight
                                            size={18}
                                            className="text-gray-300 group-hover:text-gray-500 group-focus:text-blue-500 transition-colors"
                                        />
                                    </td>
                                </RowWrapper>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
