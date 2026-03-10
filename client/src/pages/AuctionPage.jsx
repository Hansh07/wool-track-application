import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Clock, Users, Plus, TrendingUp, Flame, Trophy } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const STATUS_CONFIG = {
    Live: { variant: 'success', icon: <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-1.5" />, color: 'from-green-500/10 to-green-500/5 border-green-500/20' },
    Upcoming: { variant: 'warning', icon: <Clock size={12} className="mr-1" />, color: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20' },
    Ended: { variant: 'neutral', icon: null, color: 'from-gray-100 to-gray-50 border-gray-200' },
    Sold: { variant: 'primary', icon: <Trophy size={12} className="mr-1" />, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20' },
};

const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        const update = () => {
            const diff = new Date(endTime) - new Date();
            if (diff <= 0) { setTimeLeft('Ended'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [endTime]);
    return <span className="font-mono text-orange-400 text-sm font-bold">{timeLeft}</span>;
};

export default function AuctionPage() {
    const { user } = useAuth();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmounts, setBidAmounts] = useState({});
    const [activeTab, setActiveTab] = useState('Live');

    useEffect(() => {
        fetchAuctions();
        const id = setInterval(fetchAuctions, 15000);
        return () => clearInterval(id);
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await axiosClient.get('/api/auction');
            if (res.data.success) setAuctions(res.data.auctions || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const placeBid = async (auctionId) => {
        const amount = bidAmounts[auctionId];
        if (!amount) return;
        try {
            const res = await axiosClient.post(`/api/auction/${auctionId}/bid`, { amount: Number(amount) });
            if (res.data.success) { fetchAuctions(); setBidAmounts(p => ({ ...p, [auctionId]: '' })); }
        } catch (err) { alert(err.response?.data?.message || 'Bid failed'); }
    };

    const tabs = ['Live', 'Upcoming', 'Ended', 'All'];
    const filtered = auctions.filter(a => activeTab === 'All' || a.status === activeTab);
    const liveCount = auctions.filter(a => a.status === 'Live').length;

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3 bg-orange-100 rounded-2xl text-orange-500">
                            <Gavel size={28} />
                            {liveCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                                    {liveCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Live Auctions</h1>
                            <p className="text-gray-500 mt-0.5">Real-time bidding on premium wool batches</p>
                        </div>
                    </div>
                    {(user?.role === 'FARMER' || user?.role === 'ADMIN') && (
                        <Button className="flex items-center gap-2">
                            <Plus size={16} /> Create Auction
                        </Button>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Live Now', value: auctions.filter(a => a.status === 'Live').length, icon: Flame, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
                        { label: 'Upcoming', value: auctions.filter(a => a.status === 'Upcoming').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
                        { label: 'Total Bids', value: auctions.reduce((s, a) => s + (a.bids?.length || 0), 0), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
                        { label: 'Sold', value: auctions.filter(a => a.status === 'Sold').length, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <Card key={label} className={`border ${bg} text-center py-4`}>
                            <Icon size={20} className={`${color} mx-auto mb-2`} />
                            <p className="text-2xl font-bold text-gray-800">{value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-primary-600 text-white shadow-green'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                            {tab !== 'All' && (
                                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    {auctions.filter(a => a.status === tab).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Auction Grid */}
                {filtered.length === 0 ? (
                    <Card className="text-center py-20">
                        <Gavel size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No {activeTab.toLowerCase()} auctions</p>
                        <p className="text-gray-400 text-sm mt-1">Check back soon for new listings</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filtered.map((auction, i) => {
                                const cfg = STATUS_CONFIG[auction.status] || STATUS_CONFIG.Ended;
                                const currentBid = auction.currentBid || auction.startPrice;
                                const minNext = currentBid + (auction.minBidIncrement || 1);
                                const canBid = auction.status === 'Live'
                                    && user?.permissions?.includes('place_bid')
                                    && auction.seller?._id !== user._id;

                                return (
                                    <motion.div
                                        key={auction._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className={`bg-gradient-to-br ${cfg.color} border hover:border-primary-300 transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full`}>
                                            {/* Card header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <Badge variant={cfg.variant}>
                                                            {cfg.icon}{auction.status}
                                                        </Badge>
                                                        {auction.woolType && (
                                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{auction.woolType}</span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-800 text-base leading-tight truncate">{auction.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">by {auction.seller?.name || 'Seller'}</p>
                                                </div>
                                                {auction.status === 'Live' && (
                                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse ml-3 mt-1 flex-shrink-0" />
                                                )}
                                            </div>

                                            {/* Bid info */}
                                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 space-y-2.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">Start Price</span>
                                                    <span className="text-sm font-medium text-gray-600">₹{auction.startPrice?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">Current Bid</span>
                                                    <span className="text-xl font-bold text-primary-600">₹{currentBid?.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={11} /> {auction.bids?.length || 0} bids</span>
                                                    {auction.status === 'Live' ? (
                                                        <CountdownTimer endTime={auction.endTime} />
                                                    ) : (
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(auction.endTime).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {canBid && (
                                                <div className="flex gap-2 mt-auto">
                                                    <input
                                                        type="number"
                                                        value={bidAmounts[auction._id] || ''}
                                                        onChange={e => setBidAmounts(p => ({ ...p, [auction._id]: e.target.value }))}
                                                        placeholder={`Min ₹${minNext.toLocaleString()}`}
                                                        className="flex-1 bg-white border border-gray-300 text-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => placeBid(auction._id)}
                                                        className="flex items-center gap-1.5 px-4 shadow-green"
                                                    >
                                                        <Gavel size={14} /> Bid
                                                    </Button>
                                                </div>
                                            )}

                                            {auction.status === 'Sold' && auction.winner && (
                                                <div className="mt-auto text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                    <Trophy size={16} className="text-blue-500 mx-auto mb-1" />
                                                    <p className="text-xs text-blue-600">Sold for <strong>₹{auction.finalPrice?.toLocaleString()}</strong></p>
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
