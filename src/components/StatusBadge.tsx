import React from 'react';
import type { IssueStatus } from '../types';

interface StatusBadgeProps {
    status: IssueStatus;
}

const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
    open: {
        label: 'Open',
        className: 'bg-red-100 text-red-700 border-red-200',
    },
    reviewed: {
        label: 'Reviewed',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    action_taken: {
        label: 'Action Taken',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    resolved: {
        label: 'Resolved',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {config.label}
        </span>
    );
};
