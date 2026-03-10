import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { BarChart2, TrendingUp, CheckCircle, XCircle, Microscope, Percent } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#1F6131', '#ef4444', '#8ED968', '#1F4D2E'];

const StatCard = ({ icon, label, value, color = 'emerald', sub }) => {
    const colorMap = {
        emerald: 'bg-emerald-100 text-emerald-600',
        red: 'bg-red-100 text-red-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };
    return (
        <Card hoverEffect className="relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(icon, { size: 100 })}
            </div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl ${colorMap[color]} flex items-center justify-center mb-4`}>
                    {icon}
                </div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h2 className="text-4xl font-bold text-gray-800 mt-1">{value}</h2>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </Card>
    );
};

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/api/quality/analytics');
                setStats(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Inspector">
                <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    if (!stats) {
        return (
            <DashboardLayout role="Inspector">
                <div className="flex h-[80vh] items-center justify-center text-gray-500">Failed to load analytics.</div>
            </DashboardLayout>
        );
    }

    const passRate = stats.passRate ?? (stats.totalInspections > 0
        ? Math.round(((stats.approvedCount || 0) / stats.totalInspections) * 100)
        : 0);

    const pieData = [
        { name: 'Approved', value: stats.approvedCount || 0 },
        { name: 'Rejected', value: stats.rejectedCount || 0 },
    ];

    const barData = [
        { name: 'Total', value: stats.totalInspections || 0, fill: '#1F6131' },
        { name: 'Approved', value: stats.approvedCount || 0, fill: '#1F4D2E' },
        { name: 'Rejected', value: stats.rejectedCount || 0, fill: '#ef4444' },
    ];

    const trendData = stats.monthlyTrend || [
        { month: 'Current', avgDiameter: stats.avgDiameter || 0, avgScore: stats.avgScore || 0 },
    ];

    return (
        <DashboardLayout role="Inspector">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 rounded-xl text-teal-600">
                        <BarChart2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Quality Analytics</h1>
                        <p className="text-gray-500">Fiber quality statistics and inspection performance.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Microscope size={24} />} label="Total Inspections" value={stats.totalInspections || 0} color="blue" />
                    <StatCard icon={<Percent size={24} />} label="Pass Rate" value={`${passRate}%`} color="emerald" sub="Approved / Total" />
                    <StatCard icon={<XCircle size={24} />} label="Rejections" value={stats.rejectedCount || 0} color="red" />
                    <StatCard icon={<CheckCircle size={24} />} label="Avg Fiber Microns" value={stats.avgDiameter != null ? `${stats.avgDiameter}µm` : 'N/A'} color="purple" sub={stats.avgScore != null ? `Avg Score: ${stats.avgScore}` : ''} />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <CheckCircle size={18} className="text-primary-600" /> Decision Breakdown
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1f2937' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-2">
                            {pieData.map((entry, i) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                                    {entry.name}: <span className="text-gray-800 font-semibold">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart2 size={18} className="text-primary-500" /> Inspection Overview
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={barData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE8CF" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1f2937' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Fiber Quality Trend */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-500" /> Fiber Quality Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE8CF" />
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1f2937' }}
                            />
                            <Legend wrapperStyle={{ color: '#6b7280' }} />
                            <Line type="monotone" dataKey="avgDiameter" stroke="#1F6131" strokeWidth={2} dot={{ fill: '#1F6131', r: 4 }} name="Avg Diameter (µm)" />
                            <Line type="monotone" dataKey="avgScore" stroke="#1F4D2E" strokeWidth={2} dot={{ fill: '#1F4D2E', r: 4 }} name="Avg Score" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
