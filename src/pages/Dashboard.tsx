import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, FileCheck, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { fetchDashboard, fetchFilters } from '../api';
import type { DashboardResponse, FiltersResponse, DashboardFilters, Store } from '../types';
import { KPICard } from '../components/KPICard';
import { FilterBar } from '../components/FilterBar';
import { IssuesTable } from '../components/IssuesTable';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';

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

    // Format last updated timestamp
    const formatLastUpdated = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    };

    // Fetch filters once on mount
    useEffect(() => {
        fetchFilters()
            .then(setFilterOptions)
            .catch((err) => console.error('[Audit] Failed to fetch filters:', err));
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        setLoading(true);
        setError(null);

        console.log(`[Audit] Fetching dashboard - Page: ${page}, Filters:`, filters);

        fetchDashboard(page, 10, filters)
            .then((response) => {
                setData(response);
                setLoading(false);
                console.log('[Audit] Dashboard loaded:', {
                    totalIssues: response.pagination.total_items,
                    recovered: response.kpis.total_recovered,
                    recoveryRate: response.kpis.recovery_rate,
                });
            })
            .catch((err) => {
                console.error('[Audit] Dashboard fetch error:', err);
                setError(err.message || 'Failed to fetch dashboard data');
                setLoading(false);
            });
    }, [page, filters]);

    const handleFilterChange = (newFilters: DashboardFilters) => {
        console.log('[Audit] Filters changed:', newFilters);
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    };

    const handleRefresh = () => {
        console.log('[Audit] Manual refresh triggered');
        setPage(1);
        setFilters({});
    };

    const handleRetry = () => {
        console.log('[Audit] Retry triggered');
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
    };

    // Check if we have no issues at all (not just filtered)
    const hasNoIssuesAtAll = !loading && !error && data && data.pagination.total_items === 0 && Object.keys(filters).length === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Delivery Operations Intelligence
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-gray-500">
                                Monitor, analyze, and resolve delivery issues across all partners
                            </p>
                            {data?.last_updated && (
                                <span className="text-xs text-gray-400">
                                    Last updated: {formatLastUpdated(data.last_updated)}
                                </span>
                            )}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Refresh dashboard"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </motion.button>
                </motion.div>

                {/* Error State - Full page */}
                {error && !data && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <p className="text-red-700 font-medium">Error: {error}</p>
                        <p className="text-red-600 text-sm mt-1">
                            Make sure the backend server is running at http://localhost:8000
                        </p>
                        <button
                            onClick={handleRetry}
                            className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Try again
                        </button>
                    </motion.div>
                )}

                {/* No issues at all - celebration state */}
                {hasNoIssuesAtAll && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                        <EmptyState variant="no-issues" />
                    </div>
                )}

                {/* Main content - only show if we have data or are loading */}
                {(!hasNoIssuesAtAll || loading) && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <KPICard
                                title="Orders with Issues"
                                value={data ? `${data.kpis.issues_percentage}%` : '—'}
                                icon={<AlertTriangle size={20} />}
                                color="red"
                                trend="down"
                                subtitle="of total orders"
                                index={0}
                            />
                            <KPICard
                                title="Revenue at Risk"
                                value={data ? `$${data.kpis.revenue_at_risk.toLocaleString()}` : '—'}
                                icon={<DollarSign size={20} />}
                                color="amber"
                                trend="down"
                                subtitle="pending resolution"
                                index={1}
                            />
                            <KPICard
                                title="Total Recovered"
                                value={data ? `$${data.kpis.total_recovered.toLocaleString()}` : '—'}
                                icon={<TrendingUp size={20} />}
                                color="green"
                                trend="up"
                                subtitle={data ? `${data.kpis.recovery_rate}% recovery rate` : 'recovery rate'}
                                index={2}
                            />
                            <KPICard
                                title="Chargebacks"
                                value={
                                    data
                                        ? `${data.kpis.chargebacks_recovered}/${data.kpis.chargebacks_filed}`
                                        : '—'
                                }
                                icon={<FileCheck size={20} />}
                                color="blue"
                                trend="up"
                                subtitle="recovered / filed"
                                index={3}
                            />
                            <KPICard
                                title="Avg Resolution Time"
                                value={data ? `${data.kpis.avg_resolution_hours}h` : '—'}
                                icon={<Clock size={20} />}
                                color="violet"
                                subtitle="hours to resolve"
                                index={4}
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
                                error={error}
                                onRetry={handleRetry}
                            />
                        </div>

                        {/* Pagination */}
                        {data && data.pagination.total_pages > 1 && (
                            <Pagination pagination={data.pagination} onPageChange={setPage} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
