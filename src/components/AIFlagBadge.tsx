import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIFlagBadgeProps {
    flagged: boolean;
}

export const AIFlagBadge: React.FC<AIFlagBadgeProps> = ({ flagged }) => {
    if (!flagged) return null;

    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200">
            <Sparkles size={12} />
            AI
        </span>
    );
};
