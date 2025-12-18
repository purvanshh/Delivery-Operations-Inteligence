import React from 'react';
import { Filter } from 'lucide-react';
import type { DashboardFilters, FiltersResponse } from '../types';

interface FilterBarProps {
    filters: DashboardFilters;
    filterOptions: FiltersResponse | null;
    onFilterChange: (filters: DashboardFilters) => void;
}

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

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters</span>
                </div>

                <select
                    value={filters.store_id || ''}
                    onChange={(e) => handleChange('store_id', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="">All Issue Types</option>
                    <option value="missing_item">Missing Item</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="cancellation">Cancellation</option>
                </select>

                <select
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="action_taken">Action Taken</option>
                    <option value="resolved">Resolved</option>
                </select>

                {(filters.store_id || filters.partner || filters.issue_type || filters.status) && (
                    <button
                        onClick={() => onFilterChange({})}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
        </div>
    );
};
