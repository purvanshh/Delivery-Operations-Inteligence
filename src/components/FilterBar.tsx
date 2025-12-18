import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import type { DashboardFilters, FiltersResponse } from '../types';

interface FilterBarProps {
    filters: DashboardFilters;
    filterOptions: FiltersResponse | null;
    onFilterChange: (filters: DashboardFilters) => void;
}

const issueTypeLabels: Record<string, string> = {
    missing_item: 'Missing Item',
    late_delivery: 'Late Delivery',
    cancellation: 'Cancellation',
};

const statusLabels: Record<string, string> = {
    open: 'Open',
    reviewed: 'Reviewed',
    action_taken: 'Action Taken',
    resolved: 'Resolved',
};

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    filterOptions,
    onFilterChange,
}) => {
    const handleChange = (key: keyof DashboardFilters, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value || undefined,
        });
    };

    const removeFilter = (key: keyof DashboardFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFilterChange(newFilters);
    };

    // Get active filter chips
    const activeFilters: { key: keyof DashboardFilters; label: string; value: string }[] = [];

    if (filters.store_id) {
        const store = filterOptions?.stores.find(s => s.store_id === filters.store_id);
        activeFilters.push({ key: 'store_id', label: 'Store', value: store?.name || filters.store_id });
    }
    if (filters.partner) {
        activeFilters.push({ key: 'partner', label: 'Partner', value: filters.partner });
    }
    if (filters.issue_type) {
        activeFilters.push({ key: 'issue_type', label: 'Issue', value: issueTypeLabels[filters.issue_type] || filters.issue_type });
    }
    if (filters.status) {
        activeFilters.push({ key: 'status', label: 'Status', value: statusLabels[filters.status] || filters.status });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80"
        >
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters</span>
                </div>

                <select
                    value={filters.store_id || ''}
                    onChange={(e) => handleChange('store_id', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-shadow hover:border-gray-300"
                    aria-label="Filter by store"
                >
                    <option value="">All Stores</option>
                    {filterOptions?.stores.map((store) => (
                        <option key={store.store_id} value={store.store_id}>
                            {store.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.partner || ''}
                    onChange={(e) => handleChange('partner', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-shadow hover:border-gray-300"
                    aria-label="Filter by delivery partner"
                >
                    <option value="">All Partners</option>
                    {filterOptions?.partners.map((partner) => (
                        <option key={partner} value={partner}>
                            {partner}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.issue_type || ''}
                    onChange={(e) => handleChange('issue_type', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-shadow hover:border-gray-300"
                    aria-label="Filter by issue type"
                >
                    <option value="">All Issue Types</option>
                    <option value="missing_item">Missing Item</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="cancellation">Cancellation</option>
                </select>

                <select
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-shadow hover:border-gray-300"
                    aria-label="Filter by status"
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="action_taken">Action Taken</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Active Filter Chips */}
            <AnimatePresence>
                {activeFilters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100"
                    >
                        <span className="text-xs text-gray-400">Active:</span>
                        {activeFilters.map((filter) => (
                            <motion.button
                                key={filter.key}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeFilter(filter.key)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                aria-label={`Remove ${filter.label} filter: ${filter.value}`}
                            >
                                <span className="text-blue-400">{filter.label}:</span>
                                {filter.value}
                                <X size={12} className="text-blue-400 hover:text-blue-600" />
                            </motion.button>
                        ))}
                        <button
                            onClick={() => onFilterChange({})}
                            className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded"
                        >
                            Clear all
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
