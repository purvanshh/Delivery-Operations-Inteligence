import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { OrderIssue, Store } from '../types';
import { StatusBadge } from './StatusBadge';
import { AIFlagBadge } from './AIFlagBadge';

interface IssuesTableProps {
    issues: OrderIssue[];
    stores: Map<string, Store>;
    loading?: boolean;
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

export const IssuesTable: React.FC<IssuesTableProps> = ({ issues, stores, loading }) => {
    const navigate = useNavigate();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="animate-pulse p-8">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (issues.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-500">No issues found matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        {issues.map((issue) => {
                            const store = stores.get(issue.store_id);
                            return (
                                <tr
                                    key={issue.order_id}
                                    onClick={() => navigate(`/issues/${issue.order_id}`)}
                                    className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
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
                                        <StatusBadge status={issue.status} />
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
                                            className="text-gray-300 group-hover:text-gray-500 transition-colors"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
