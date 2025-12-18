import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, FileCheck, Clock, RefreshCw } from 'lucide-react';
import { fetchDashboard, fetchFilters } from '../api';
import type { DashboardResponse, FiltersResponse, DashboardFilters, Store } from '../types';
import { KPICard } from '../components/KPICard';
import { FilterBar } from '../components/FilterBar';
import { IssuesTable } from '../components/IssuesTable';
import { Pagination } from '../components/Pagination';

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [filterOptions, setFilterOptions] = useState<FiltersResponse | null>(null);
    const [filters, setFilters] = useState<DashboardFilters>({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Store lookup map
    const storesMap = React.useMemo(() => {
        const map = new Map<string, Store>();
        filterOptions?.stores.forEach((store) => {
            map.set(store.store_id, store);
        });
        return map;
    }, [filterOptions]);

    // Fetch filters once on mount
    useEffect(() => {
        fetchFilters()
            .then(setFilterOptions)
            .catch((err) => console.error('Failed to fetch filters:', err));
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        setLoading(true);
        setError(null);

        fetchDashboard(page, 10, filters)
            .then((response) => {
                setData(response);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch dashboard data');
                setLoading(false);
            });
    }, [page, filters]);

    const handleFilterChange = (newFilters: DashboardFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleRefresh = () => {
        setPage(1);
        setFilters({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Delivery Operations Intelligence
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Monitor, analyze, and resolve delivery issues across all partners
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 font-medium">Error: {error}</p>
                        <p className="text-red-600 text-sm mt-1">
                            Make sure the backend server is running at http://localhost:8000
                        </p>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard
                        title="Orders with Issues"
                        value={data ? `${data.kpis.issues_percentage}%` : '—'}
                        icon={<AlertTriangle size={20} />}
                        color="red"
                        trend="down"
                        subtitle="of total orders"
                    />
                    <KPICard
                        title="Revenue at Risk"
                        value={data ? `$${data.kpis.revenue_at_risk.toLocaleString()}` : '—'}
                        icon={<DollarSign size={20} />}
                        color="amber"
                        trend="down"
                        subtitle="pending resolution"
                    />
                    <KPICard
                        title="Chargebacks"
                        value={
                            data
                                ? `${data.kpis.chargebacks_recovered}/${data.kpis.chargebacks_filed}`
                                : '—'
                        }
                        icon={<FileCheck size={20} />}
                        color="green"
                        trend="up"
                        subtitle="recovered / filed"
                    />
                    <KPICard
                        title="Avg Resolution Time"
                        value={data ? `${data.kpis.avg_resolution_hours}h` : '—'}
                        icon={<Clock size={20} />}
                        color="blue"
                        subtitle="hours to resolve"
                    />
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <FilterBar
                        filters={filters}
                        filterOptions={filterOptions}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                {/* Issues Table */}
                <div className="mb-4">
                    <IssuesTable
                        issues={data?.issues || []}
                        stores={storesMap}
                        loading={loading}
                    />
                </div>

                {/* Pagination */}
                {data && data.pagination.total_pages > 1 && (
                    <Pagination pagination={data.pagination} onPageChange={setPage} />
                )}
            </div>
        </div>
    );
};
