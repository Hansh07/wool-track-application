import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, FileText, ArrowRight, DollarSign, Info, Star, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const InspectorDashboard = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEarningsInfo, setShowEarningsInfo] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                // Inspectors only see Finished batches (server also enforces this)
                const { data } = await client.get('/api/batches?stage=Finished');
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            } catch (error) {
                console.error("Error fetching batches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Inspector">
                <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    const pendingBatches = batches.filter(b => b.qualityStatus === 'Pending');
    const completedBatches = batches.filter(b => b.qualityStatus !== 'Pending');

    return (
        <DashboardLayout role="Inspector">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lab Hub</h1>
                        <p className="text-gray-600">Welcome, <span className="text-primary-600 font-semibold">{user?.name}</span>. Manage quality inspections and lab reports.</p>
                    </div>
                    <button
                        onClick={() => setShowEarningsInfo(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                        <Info size={16} /> How Earnings Work
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card hoverEffect className="relative overflow-hidden group border-gray-100">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4">
                                <FileText size={24} />
                            </div>
                            <p className="text-gray-800 font-bold">Pending Review</p>
                            <h2 className="text-4xl font-bold text-gray-800 mt-1">{pendingBatches.length}</h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group border-gray-100">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-gray-800 font-bold">Completed Today</p>
                            <h2 className="text-4xl font-bold text-gray-800 mt-1">
                                {completedBatches.filter(b => new Date(b.updatedAt).toDateString() === new Date().toDateString()).length}
                            </h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group bg-purple-50 border-purple-200 backdrop-blur-md">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                                <DollarSign size={24} />
                            </div>
                            <p className="text-gray-800 font-bold">Total Earnings</p>
                            <h2 className="text-4xl font-bold text-gray-800 mt-1">
                                ₹{(completedBatches.length * 500).toLocaleString()}
                            </h2>
                            <p className="text-xs text-purple-600 mt-2 bg-purple-100 inline-block px-2 py-1 rounded">
                                Fixed Rate: ₹500 / Batch
                            </p>
                        </div>
                    </Card>

                    <Card hoverEffect className="bg-primary-50 flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary-300 backdrop-blur-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Analytics</h3>
                        <p className="text-sm text-gray-500 mb-4">View detailed quality reports</p>
                        <Link to="/quality/analytics">
                            <Button variant="primary">View Dashboard</Button>
                        </Link>
                    </Card>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pending Inspections List (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Batches Awaiting Inspection</h2>
                            <Badge variant="warning">{pendingBatches.length} Pending</Badge>
                        </div>

                        <div className="space-y-3">
                            {pendingBatches.length > 0 ? (
                                pendingBatches.map(batch => (
                                    <Card key={batch._id} className="p-0 overflow-hidden flex flex-col md:flex-row md:items-center border-gray-100">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="neutral" className="font-mono">#{batch.batchId || batch._id.slice(-6)}</Badge>
                                                <h3 className="text-lg font-bold text-gray-800">{batch.woolType}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{batch.weight}kg</span>
                                                <span>•</span>
                                                <span>Stage: {batch.currentStage}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 md:p-6 md:w-48 flex items-center justify-center md:border-l border-gray-100">
                                            <Link to={`/inspect/${batch._id}`} className="w-full">
                                                <Button className="w-full">Start <ArrowRight size={16} className="ml-2" /></Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 bg-gray-50">
                                    <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-gray-800">All Caught Up!</h3>
                                    <p className="text-gray-500">No pending inspections at the moment.</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Recent History (1/3 width) */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent History</h2>
                        <div className="space-y-3">
                            {completedBatches.slice(0, 5).map(batch => (
                                <Card key={batch._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-gray-100">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{batch.woolType}</p>
                                        <p className="text-xs text-gray-500 font-mono">#{batch.batchId || batch._id.slice(-6)}</p>
                                    </div>
                                    <Badge variant={batch.qualityStatus === 'Approved' ? 'success' : 'danger'}>
                                        {batch.qualityStatus}
                                    </Badge>
                                </Card>
                            ))}
                            {completedBatches.length === 0 && <p className="text-gray-500 text-sm">No inspection history.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Info Modal */}
            {showEarningsInfo && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowEarningsInfo(false)}
                >
                    <div
                        className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Info size={18} /></div>
                                <h2 className="text-base font-bold text-gray-800">How Your Earnings Work</h2>
                            </div>
                            <button onClick={() => setShowEarningsInfo(false)} className="text-gray-500 hover:text-gray-800 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <span className="text-4xl font-bold text-purple-600">₹500</span>
                                <div>
                                    <p className="text-gray-800 font-medium text-sm">Flat fee per inspection</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Earned for every batch you inspect, regardless of wool type or weight.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star size={14} className="text-yellow-400" />
                                    <p className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">What You Inspect</p>
                                </div>
                                {[
                                    ['Clean Wool Yield', "Affects farmer's price (±10%)"],
                                    ['Fiber Diameter', '+20% premium if < 19 microns'],
                                    ['Staple Strength', 'Quality grade indicator'],
                                    ['Color & Contamination', 'Pass / Reject decision'],
                                ].map(([label, desc]) => (
                                    <div key={label} className="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-800 font-medium">{label}</span>
                                        <span className="text-gray-500">{desc}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <ClipboardList size={14} className="text-teal-400" />
                                    <p className="text-teal-400 font-semibold text-xs uppercase tracking-wide">Your Earnings Breakdown</p>
                                </div>
                                <div className="flex justify-between text-xs p-2 bg-gray-100 rounded-lg">
                                    <span className="text-gray-500">Completed inspections</span>
                                    <span className="text-gray-800 font-bold">{completedBatches.length}</span>
                                </div>
                                <div className="flex justify-between text-xs p-2 bg-gray-100 rounded-lg">
                                    <span className="text-gray-500">Rate per inspection</span>
                                    <span className="text-gray-800 font-bold">₹500</span>
                                </div>
                                <div className="flex justify-between text-xs p-2 bg-purple-50 rounded-lg border border-purple-200">
                                    <span className="text-purple-600 font-semibold">Total Earned</span>
                                    <span className="text-purple-600 font-bold">₹{(completedBatches.length * 500).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InspectorDashboard;
