import React, { useEffect, useState, useRef } from 'react';
import client from '../api/axiosClient';
import { Package, CheckCircle, Clock, Plus, ArrowRight, DollarSign, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BatchTimeline from '../components/BatchTimeline';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Badge } from '../components/ui/Badge';

/* Animated number that counts up from 0 to target on mount */
const AnimatedNumber = ({ value, prefix = '', decimals = 0, duration = 1400 }) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);

    useEffect(() => {
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const progress = Math.min((ts - startRef.current) / duration, 1);
            // ease-out-expo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplay(value * ease);
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value, duration]);

    const formatted = decimals > 0
        ? display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.floor(display).toLocaleString();

    return <span className="num-pop">{prefix}{formatted}</span>;
};

const FarmerDashboard = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEarningsInfo, setShowEarningsInfo] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const { data } = await client.get('/api/batches');
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            } catch {
                setError('Failed to load batches. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    const totalBatches = batches.length;
    const processingBatches = batches.filter(b => b.currentStage !== 'Finished').length;
    const finishedBatches = batches.filter(b => b.currentStage === 'Finished').length;
    const mostRecentBatch = [...batches].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived))[0];

    // Revenue — only batches that have been quality-inspected get financials
    const pricedBatches = batches.filter(b => b.financials);
    const grossRevenue = pricedBatches.reduce((s, b) => s + (b.financials.grossRevenue || 0), 0);
    const totalFees = pricedBatches.reduce((s, b) => s + (
        (b.financials.serviceFees?.inspection || 0) +
        (b.financials.serviceFees?.processing || 0) +
        (b.financials.serviceFees?.platform || 0)
    ), 0);
    const netEarnings = pricedBatches.reduce((s, b) => s + (b.financials.netFarmerEarnings || 0), 0);
    const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (loading) {
        return (
            <DashboardLayout role="Farmer">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="Farmer">
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-400 text-lg font-medium mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Farmer">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, <span className="text-primary-600">{user?.name}</span></h1>
                        <p className="text-gray-600">Here's what's happening with your wool today.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowEarningsInfo(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-100 transition-colors"
                        >
                            <Info size={16} /> How Earnings Work
                        </button>
                        <Link to="/quality-results">
                            <Button variant="secondary">Quality Results</Button>
                        </Link>
                        <Link to="/create-batch">
                            <Button className="shadow-neon">
                                <Plus size={18} className="mr-2" /> New Batch
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Card */}
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Card hoverEffect className="relative overflow-hidden group border-primary-100 backdrop-blur-md">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign size={100} />
                            </div>
                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Net Earnings</p>
                                    <h2 className="text-3xl font-bold text-gray-800 mt-0.5">
                                        ₹<AnimatedNumber value={netEarnings} decimals={2} />
                                    </h2>
                                    <p className="text-xs text-primary-600 mt-1">
                                        {pricedBatches.length} of {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} priced
                                    </p>
                                </div>
                                {pricedBatches.length > 0 && (
                                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Gross Revenue</span>
                                            <span className="text-gray-800 font-medium">₹{fmt(grossRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Platform &amp; Fees</span>
                                            <span className="text-red-400 font-medium">−₹{fmt(totalFees)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5">
                                            <span className="text-primary-600 font-semibold">You Receive</span>
                                            <span className="text-primary-600 font-bold">₹{fmt(netEarnings)}</span>
                                        </div>
                                    </div>
                                )}
                                {pricedBatches.length === 0 && (
                                    <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                                        Revenue is calculated after quality inspection
                                    </p>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Total Batches */}
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Card hoverEffect className="relative overflow-hidden group border-gray-100">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Package size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                                    <Package size={24} />
                                </div>
                                <p className="text-gray-700 font-bold">Total Batches</p>
                                <h2 className="text-3xl font-bold text-gray-800 mt-1">
                                    <AnimatedNumber value={totalBatches} />
                                </h2>
                            </div>
                        </Card>
                    </motion.div>

                    {/* In Processing */}
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Card hoverEffect className="relative overflow-hidden group border-gray-100">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                                    <Clock size={24} />
                                </div>
                                <p className="text-gray-700 font-bold">In Processing</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-1">
                                    <AnimatedNumber value={processingBatches} />
                                </h2>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Completed */}
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                        <Card hoverEffect className="relative overflow-hidden group border-gray-100">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="text-gray-700 font-bold">Completed</p>
                                <h2 className="text-4xl font-bold text-gray-800 mt-1">
                                    <AnimatedNumber value={finishedBatches} />
                                </h2>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Timeline Card - Spans 2 cols */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Live Tracking</h2>
                        {mostRecentBatch ? (
                            <Card className="h-64 flex flex-col justify-center border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-800">Batch #{mostRecentBatch.batchId || mostRecentBatch._id.slice(-6)}</h3>
                                            <Badge variant="primary">{mostRecentBatch.woolType}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Updated {new Date(mostRecentBatch.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Link to={`/batches/${mostRecentBatch._id}`}>
                                        <Button variant="ghost" size="sm">View Details <ArrowRight size={16} className="ml-1" /></Button>
                                    </Link>
                                </div>
                                <div className="px-4 pb-4">
                                    <BatchTimeline currentStage={mostRecentBatch.currentStage} />
                                </div>
                            </Card>
                        ) : (
                            <Card className="h-64 flex items-center justify-center text-gray-400 border-gray-100">
                                No active batches to track.
                            </Card>
                        )}
                    </div>

                    {/* Quick List - Spans 1 col */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Batches</h2>
                        <div className="space-y-3">
                            {batches.slice(0, 4).map(batch => (
                                <Card key={batch._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{batch.woolType}</p>
                                            <p className="text-xs text-gray-500">{batch.weight}kg • {new Date(batch.dateReceived).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={batch.currentStage === 'Finished' ? 'success' : 'neutral'}>
                                            {batch.currentStage}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                            {batches.length === 0 && <div className="text-gray-500 text-sm">No recent history.</div>}
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
                        className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-xl text-primary-600"><Info size={18} /></div>
                                <h2 className="text-base font-bold text-gray-800">How Your Earnings Are Calculated</h2>
                            </div>
                            <button onClick={() => setShowEarningsInfo(false)} className="text-gray-500 hover:text-gray-800 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                            <div className="space-y-1.5 overflow-y-auto max-h-56 custom-scrollbar pr-1">
                                <p className="text-primary-600 font-semibold text-xs uppercase tracking-wide mb-2 sticky top-0 bg-white pb-1">Base Price (per kg)</p>
                                {[
                                    ['Vicuña', '55,000', 'text-yellow-300'],
                                    ['Qiviut', '35,000', 'text-yellow-300'],
                                    ['Cashmere', '8,000', 'text-orange-300'],
                                    ['Alpaca', '3,250', 'text-orange-300'],
                                    ['Angora', '2,750', 'text-orange-300'],
                                    ['Mohair', '1,700', 'text-blue-300'],
                                    ['Yak', '1,400', 'text-blue-300'],
                                    ['Fine Merino', '1,500', 'text-blue-300'],
                                    ['Merino', '1,000', 'text-gray-700'],
                                    ['Lambswool', '1,000', 'text-gray-700'],
                                    ['Shetland', '650', 'text-gray-700'],
                                    ['Corriedale', '600', 'text-gray-700'],
                                    ['Crossbred', '425', 'text-gray-500'],
                                    ['Lincoln', '350', 'text-gray-500'],
                                    ['Coarse Wool', '275', 'text-gray-500'],
                                    ['Carpet Wool', '165', 'text-gray-500'],
                                ].map(([type, price, color]) => (
                                    <div key={type} className="flex justify-between text-xs py-0.5 border-b border-gray-100 last:border-0">
                                        <span className="text-gray-600">{type}</span>
                                        <span className={`font-medium ${color}`}>₹{price}/kg</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-blue-400 font-semibold text-xs uppercase tracking-wide mb-3">Quality Bonuses</p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-xs p-2 bg-green-500/10 rounded-lg border border-green-500/10">
                                        <span className="text-green-400 font-bold">+10%</span>
                                        <span className="text-gray-700">if clean wool yield &gt; 70%</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs p-2 bg-red-500/10 rounded-lg border border-red-500/10">
                                        <span className="text-red-400 font-bold">−10%</span>
                                        <span className="text-gray-700">if clean wool yield &lt; 50%</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs p-2 bg-green-500/10 rounded-lg border border-green-500/10">
                                        <span className="text-green-400 font-bold">+20%</span>
                                        <span className="text-gray-700">premium if fiber diameter &lt; 19 microns</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-red-400 font-semibold text-xs uppercase tracking-wide mb-3">Deductions per Batch</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Inspection fee</span>
                                        <span className="text-red-400 font-medium">₹500 flat</span>
                                    </div>
                                    <div className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Processing fee</span>
                                        <span className="text-red-400 font-medium">₹20 / kg</span>
                                    </div>
                                    <div className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Platform fee</span>
                                        <span className="text-red-400 font-medium">5% of gross</span>
                                    </div>
                                    <div className="flex justify-between text-xs p-2 bg-primary-50 rounded-lg border border-primary-200">
                                        <span className="text-primary-600 font-semibold">Net Earnings</span>
                                        <span className="text-primary-600 font-semibold">Gross − All Fees</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default FarmerDashboard;
