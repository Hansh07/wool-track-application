import React, { useState, useEffect } from 'react';
import client from '../api/axiosClient';
import { Thermometer, Droplets, Activity, CheckCircle, AlertTriangle, CloudSun } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const MonitoringDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const res = await client.get('/api/monitoring/sensors');
            setData(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching sensor data:', err);
            setError('Failed to load sensor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <DashboardLayout role="Operator">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout role="Operator">
            <div className="flex h-[80vh] items-center justify-center text-red-400">{error}</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Mill Operator">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary-500/20 rounded-xl text-secondary-400">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Factory Monitoring</h1>
                        <p className="text-gray-500">Real-time IoT sensor data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Environmental Sensors */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <CloudSun size={20} className="text-orange-400" /> Environment (Live)
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="text-center p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-orange-400/5 transition-opacity group-hover:opacity-10" />
                                <Thermometer className="text-orange-400 mb-3" size={32} />
                                <div className="text-4xl font-bold text-gray-800 mb-1">
                                    {data?.weather?.temperature?.toFixed(1)}°
                                </div>
                                <p className="text-sm text-orange-200/60 font-medium tracking-wide">TEMPERATURE</p>
                            </div>

                            <div className="text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-400/5 transition-opacity group-hover:opacity-10" />
                                <Droplets className="text-blue-400 mb-3" size={32} />
                                <div className="text-4xl font-bold text-gray-800 mb-1">
                                    {data?.weather?.humidity}%
                                </div>
                                <p className="text-sm text-blue-200/60 font-medium tracking-wide">HUMIDITY</p>
                            </div>

                            {data?.weather?.condition && (
                                <div className="col-span-2 text-center p-3 bg-gray-50 rounded-xl text-sm text-gray-500 border border-gray-100">
                                    Current Condition: <strong className="text-gray-800 ml-1">{data.weather.condition}</strong> in {data.weather.location}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Machine Status */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-secondary-50 to-transparent">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Activity size={20} className="text-secondary-400" /> Machine Status
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {data?.machines?.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div>
                                        <span className="font-bold text-gray-800 block mb-1">{m.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-200 h-1.5 w-24 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${m.health > 80 ? 'bg-green-500' : m.health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${m.health}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">Health: {m.health}%</span>
                                        </div>
                                    </div>
                                    <Badge variant={m.status === 'Running' ? 'success' : 'warning'} className="flex items-center gap-1">
                                        {m.status === 'Running' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {m.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="text-center text-xs text-gray-400 font-mono">
                    Last updated: {new Date(data?.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MonitoringDashboard;
