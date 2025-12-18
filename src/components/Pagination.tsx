import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationInfo } from '../types';

interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { page, total_pages, total_items } = pagination;

    const handlePageChange = (newPage: number) => {
        console.log(`[Audit] Page changed: ${page} → ${newPage}`);
        onPageChange(newPage);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/80"
        >
            <div className="text-sm text-gray-500">
                Showing page <span className="font-medium text-gray-700">{page}</span> of{' '}
                <span className="font-medium text-gray-700">{total_pages}</span>{' '}
                <span className="text-gray-400">({total_items} issues)</span>
            </div>
            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </motion.button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                        let pageNum: number;
                        if (total_pages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= total_pages - 2) {
                            pageNum = total_pages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }

                        const isActive = pageNum === page;

                        return (
                            <motion.button
                                key={pageNum}
                                whileHover={!isActive ? { scale: 1.1 } : undefined}
                                whileTap={!isActive ? { scale: 0.95 } : undefined}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                aria-label={`Page ${pageNum}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {pageNum}
                            </motion.button>
                        );
                    })}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= total_pages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Next page"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>
        </motion.div>
    );
};
