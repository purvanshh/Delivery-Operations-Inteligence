import React from 'react';
import { motion } from 'framer-motion';
import type { IssueStatus } from '../types';

interface StatusBadgeProps {
    status: IssueStatus;
    animate?: boolean;
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, animate = true }) => {
    const config = statusConfig[status];

    const badge = (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
            role="status"
            aria-label={`Status: ${config.label}`}
        >
            {status === 'open' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
            )}
            {config.label}
        </span>
    );

    if (!animate) {
        return badge;
    }

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.05 }}
        >
            {badge}
        </motion.span>
    );
};
