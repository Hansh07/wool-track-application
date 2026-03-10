import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, Clock, CheckCircle, Search, Plus, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const STATUS_VARIANT = {
    'Delivered': 'success',
    'In Transit': 'info',
    'Out for Delivery': 'warning',
    'Pending': 'default',
    'Cancelled': 'danger',
};

const StatusIcon = ({ status }) => {
    if (status === 'Delivered') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'In Transit') return <Truck size={16} className="text-blue-500" />;
    if (status === 'Out for Delivery') return <MapPin size={16} className="text-orange-400" />;
    return <Clock size={16} className="text-gray-400" />;
};

const BLANK_FORM = { origin: '', destination: '', carrier: '', weight: '', woolType: '', notes: '' };

export default function LogisticsPage() {
    const { hasPermission } = useAuth();
    const canUpdate = hasPermission('update_logistics');

    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackInput, setTrackInput] = useState('');
    const [tracked, setTracked] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(BLANK_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axiosClient.get('/api/logistics')
            .then(res => {
                if (res.data.success) setShipments(res.data.shipments || []);
                else setShipments(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => setShipments([]))
            .finally(() => setLoading(false));
    }, []);

    const handleTrack = async () => {
        if (!trackInput.trim()) return;
        setTracking(true);
        try {
            const res = await axiosClient.get('/api/logistics/track/' + trackInput.trim());
            if (res.data.success) setTracked(res.data.shipment);
            else setTracked(null);
        } catch {
            alert('Shipment not found');
            setTracked(null);
        } finally {
            setTracking(false);
        }
    };

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosClient.post('/api/logistics', form);
            setShipments(prev => [res.data.shipment || res.data, ...prev]);
            setShowModal(false);
            setForm(BLANK_FORM);
        } catch {
            alert('Failed to create shipment');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-500">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Logistics Tracking</h1>
                            <p className="text-gray-500">Real-time shipment tracking and delivery management</p>
                        </div>
                    </div>
                    {canUpdate && (
                        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Create Shipment
                        </Button>
                    )}
                </div>

                {/* Track Shipment */}
                <Card>
                    <h3 className="font-semibold text-gray-800 mb-4">Track a Shipment</h3>
                    <div className="flex gap-3">
                        <input
                            value={trackInput}
                            onChange={e => setTrackInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTrack()}
                            placeholder="Enter tracking number (e.g. WM-TRK-...)"
                            className="flex-1 bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                        />
                        <Button onClick={handleTrack} isLoading={tracking} className="flex items-center gap-2 px-6">
                            <Search size={16} /> Track
                        </Button>
                    </div>

                    {tracked && (
                        <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-mono text-sm font-bold text-gray-800">{tracked.trackingNumber}</p>
                                    <p className="text-xs text-gray-500 mt-1">{tracked.carrier} | {tracked.origin} → {tracked.destination}</p>
                                </div>
                                <Badge variant={STATUS_VARIANT[tracked.status] || 'default'}>{tracked.status}</Badge>
                            </div>
                            <div className="space-y-3">
                                {tracked.checkpoints?.slice().reverse().map((cp, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-0.5"><StatusIcon status={cp.status} /></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{cp.status} — {cp.location}</p>
                                            <p className="text-xs text-gray-500">{new Date(cp.timestamp).toLocaleString()}</p>
                                            {cp.notes && <p className="text-xs text-gray-400">{cp.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* All Shipments */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">All Shipments</h3>
                    {shipments.length === 0 ? (
                        <Card className="text-center py-16">
                            <Truck size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No shipments found</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {shipments.map(s => (
                                <Card key={s._id} className="flex items-center justify-between hover:border-gray-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <StatusIcon status={s.status} />
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm font-medium text-gray-800">{s.trackingNumber}</p>
                                            <p className="text-xs text-gray-500">{s.carrier} | {s.origin} → {s.destination}</p>
                                            {s.woolType && <p className="text-xs text-gray-400">{s.woolType}{s.weight ? ` · ${s.weight} kg` : ''}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={STATUS_VARIANT[s.status] || 'default'}>{s.status}</Badge>
                                        {s.estimatedDelivery && (
                                            <p className="text-xs text-gray-400 mt-1">ETA: {new Date(s.estimatedDelivery).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Shipment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Create Shipment</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateShipment} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Origin</label>
                                    <input
                                        required
                                        value={form.origin}
                                        onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                                        placeholder="e.g. Warehouse A"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Destination</label>
                                    <input
                                        required
                                        value={form.destination}
                                        onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                                        placeholder="e.g. Mill B"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Carrier</label>
                                    <input
                                        value={form.carrier}
                                        onChange={e => setForm(p => ({ ...p, carrier: e.target.value }))}
                                        placeholder="e.g. FedEx"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={form.weight}
                                        onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                                        placeholder="0"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Wool Type</label>
                                <input
                                    value={form.woolType}
                                    onChange={e => setForm(p => ({ ...p, woolType: e.target.value }))}
                                    placeholder="e.g. Merino"
                                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Optional notes..."
                                    rows={2}
                                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                                <Button type="submit" isLoading={saving} className="flex-1">Create Shipment</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
