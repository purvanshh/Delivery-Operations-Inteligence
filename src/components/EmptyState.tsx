import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Search,
    Sparkles,
    DollarSign,
    Clock,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

type EmptyStateVariant =
    | 'no-issues'
    | 'no-results'
    | 'no-insight'
    | 'no-recovery'
    | 'pending'
    | 'error'
    | 'loading';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    onRetry?: () => void;
    className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBg: string;
}> = {
    'no-issues': {
        icon: <CheckCircle size={24} />,
        title: 'All clear!',
        description: 'No delivery issues detected — great day for operations.',
        iconBg: 'bg-emerald-50 text-emerald-600',
    },
    'no-results': {
        icon: <Search size={24} />,
        title: 'No matches found',
        description: 'No issues match your current filters. Try adjusting your selection.',
        iconBg: 'bg-gray-100 text-gray-500',
    },
    'no-insight': {
        icon: <Sparkles size={24} />,
        title: 'AI insight unavailable',
        description: 'Manual review recommended for this order.',
        iconBg: 'bg-violet-50 text-violet-600',
    },
    'no-recovery': {
        icon: <DollarSign size={24} />,
        title: 'No recovered revenue yet',
        description: 'File chargebacks on open issues to start recovering revenue.',
        iconBg: 'bg-amber-50 text-amber-600',
    },
    'pending': {
        icon: <Clock size={24} />,
        title: 'Recovery pending',
        description: 'This issue has been escalated. Check back for updates.',
        iconBg: 'bg-blue-50 text-blue-600',
    },
    'error': {
        icon: <AlertCircle size={24} />,
        title: 'Something went wrong',
        description: 'Failed to load data. Please try again.',
        iconBg: 'bg-red-50 text-red-600',
    },
    'loading': {
        icon: <RefreshCw size={24} className="animate-spin" />,
        title: 'Loading...',
        description: 'Please wait while we fetch the data.',
        iconBg: 'bg-gray-100 text-gray-500',
    },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
    variant,
    onRetry,
    className = '',
}) => {
    const config = variantConfig[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
        >
            <div className={`p-4 rounded-2xl mb-4 ${config.iconBg}`}>
                {config.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {config.title}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
                {config.description}
            </p>
            {onRetry && variant === 'error' && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Try again
                </motion.button>
            )}
        </motion.div>
    );
};
