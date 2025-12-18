import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationInfo } from '../types';

interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { page, total_pages, total_items } = pagination;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">
                Showing page {page} of {total_pages} ({total_items} total issues)
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

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

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= total_pages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};
