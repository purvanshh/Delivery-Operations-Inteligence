import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    color?: 'blue' | 'green' | 'red' | 'amber';
}

const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
    amber: 'bg-amber-500/10 text-amber-600',
};

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    trend,
    subtitle,
    color = 'blue',
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400">{subtitle}</p>
                )}
            </div>
        </div>
    );
};
