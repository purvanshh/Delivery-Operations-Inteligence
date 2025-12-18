import React from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    color?: 'blue' | 'green' | 'red' | 'amber' | 'violet';
    index?: number; // For stagger animation
}

const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
    amber: 'bg-amber-500/10 text-amber-600',
    violet: 'bg-violet-500/10 text-violet-600',
};

// Animated counter component
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
    value,
    prefix = '',
    suffix = '',
}) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    const spring = useSpring(0, { duration: 1000, bounce: 0 });
    const display = useTransform(spring, (current) => {
        if (value >= 1000) {
            return `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`;
        }
        return `${prefix}${current.toLocaleString('en-US', { minimumFractionDigits: value % 1 !== 0 ? 1 : 0, maximumFractionDigits: 1 })}${suffix}`;
    });

    React.useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, spring, value]);

    return <motion.span ref={ref}>{display}</motion.span>;
};

// Parse value string to extract numeric portion for animation
const parseValueForAnimation = (value: string | number): { prefix: string; number: number; suffix: string } | null => {
    if (typeof value === 'number') {
        return { prefix: '', number: value, suffix: '' };
    }

    // Match patterns like "$1,234", "4.0%", "18.5h", "5/10"
    const match = value.match(/^(\$?)([0-9,.]+)(.*?)$/);
    if (match) {
        const num = parseFloat(match[2].replace(/,/g, ''));
        if (!isNaN(num)) {
            return { prefix: match[1], number: num, suffix: match[3] };
        }
    }
    return null;
};

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    trend,
    subtitle,
    color = 'blue',
    index = 0,
}) => {
    const parsedValue = parseValueForAnimation(value);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut'
            }}
            whileHover={{
                y: -2,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            tabIndex={0}
            role="article"
            aria-label={`${title}: ${value}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 200 }}
                        className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
                            }`}
                    >
                        {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
                    </motion.div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">
                    {parsedValue ? (
                        <AnimatedNumber
                            value={parsedValue.number}
                            prefix={parsedValue.prefix}
                            suffix={parsedValue.suffix}
                        />
                    ) : (
                        value
                    )}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-400">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};
