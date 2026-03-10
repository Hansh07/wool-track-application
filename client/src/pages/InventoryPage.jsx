import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Package, Warehouse, Plus, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const STATUS_COLORS = {
    'In Stock': 'success',
    'Reserved': 'warning',
    'Processing': 'info',
    'Shipped': 'default',
    'Damaged': 'danger',
};

const STATUSES = ['In Stock', 'Reserved', 'Processing', 'Shipped', 'Damaged'];

export default function InventoryPage() {
    const { hasPermission } = useAuth();
    const canManage = hasPermission('manage_inventory');

    const [inventory, setInventory] = useState([]);
    const [summary, setSummary] = useState({ total: 0, byStatus: {}, byType: {} });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', warehouse: '' });
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ woolType: '', grade: '', quantity: '', unit: 'kg', warehouse: '', status: 'In Stock', notes: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchInventory(); }, [filter]);

    const fetchInventory = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.status) params.set('status', filter.status);
            if (filter.warehouse) params.set('warehouse', filter.warehouse);
            const res = await axiosClient.get('/api/inventory?' + params.toString());
            if (res.data.success) {
                setInventory(res.data.items || []);
                setSummary(res.data.summary || { total: 0, byStatus: {}, byType: {} });
            } else {
                setInventory(Array.isArray(res.data) ? res.data : []);
            }
        } catch {
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axiosClient.patch(`/api/inventory/${id}`, { status: newStatus });
            setInventory(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
        } catch {
            alert('Failed to update status');
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosClient.post('/api/inventory', form);
            setShowModal(false);
            setForm({ woolType: '', grade: '', quantity: '', unit: 'kg', warehouse: '', status: 'In Stock', notes: '' });
            fetchInventory();
        } catch {
            alert('Failed to add stock');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    const statCards = [
        { label: 'Total Stock (kg)', value: summary.total?.toLocaleString() ?? inventory.reduce((s, i) => s + (i.quantity || 0), 0).toLocaleString(), color: 'emerald' },
        { label: 'In Stock', value: summary.byStatus?.['In Stock']?.toLocaleString() ?? inventory.filter(i => i.status === 'In Stock').length, color: 'green' },
        { label: 'Reserved', value: summary.byStatus?.['Reserved']?.toLocaleString() ?? inventory.filter(i => i.status === 'Reserved').length, color: 'yellow' },
        { label: 'Shipped', value: summary.byStatus?.['Shipped']?.toLocaleString() ?? inventory.filter(i => i.status === 'Shipped').length, color: 'blue' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                            <Warehouse size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                            <p className="text-gray-500">Track wool stock across all warehouses</p>
                        </div>
                    </div>
                    {canManage && (
                        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Add Stock
                        </Button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(card => (
                        <Card key={card.label} className={`bg-${card.color}-50 border-${card.color}-200 text-center`}>
                            <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <select
                        value={filter.status}
                        onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
                        className="bg-white border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    >
                        <option value="">All Statuses</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        value={filter.warehouse}
                        onChange={e => setFilter(p => ({ ...p, warehouse: e.target.value }))}
                        placeholder="Filter by warehouse..."
                        className="bg-white border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400 w-48"
                    />
                </div>

                {/* Table */}
                <Card className="p-0 overflow-hidden">
                    {inventory.length === 0 ? (
                        <div className="text-center py-16">
                            <Package size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">No inventory items found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        {['Barcode', 'Wool Type', 'Grade', 'Quantity', 'Warehouse', 'Status', 'Received'].map(h => (
                                            <th key={h} className="p-4 text-gray-600 font-medium text-sm">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inventory.map(item => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-mono text-xs text-gray-400">{item.barcodeId || '—'}</td>
                                            <td className="p-4 font-medium text-gray-800">{item.woolType}</td>
                                            <td className="p-4">
                                                <Badge variant="success">{item.grade || 'N/A'}</Badge>
                                            </td>
                                            <td className="p-4 font-bold text-primary-600">{item.quantity} {item.unit}</td>
                                            <td className="p-4 text-gray-600 flex items-center gap-1">
                                                <Warehouse size={14} className="text-gray-400" /> {item.warehouse}
                                            </td>
                                            <td className="p-4">
                                                {canManage ? (
                                                    <select
                                                        value={item.status}
                                                        onChange={e => handleStatusChange(item._id, e.target.value)}
                                                        className="bg-white border border-gray-300 text-gray-600 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary-500"
                                                    >
                                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <Badge variant={STATUS_COLORS[item.status] || 'default'}>{item.status}</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {item.receivedDate ? new Date(item.receivedDate).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Add Stock Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add Stock</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Wool Type</label>
                                    <input
                                        required
                                        value={form.woolType}
                                        onChange={e => setForm(p => ({ ...p, woolType: e.target.value }))}
                                        placeholder="e.g. Merino"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Grade</label>
                                    <input
                                        value={form.grade}
                                        onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                                        placeholder="e.g. A"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        value={form.quantity}
                                        onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                        placeholder="0"
                                        className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Unit</label>
                                    <select
                                        value={form.unit}
                                        onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                        className="w-full bg-white border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="lbs">lbs</option>
                                        <option value="bales">bales</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Warehouse</label>
                                <input
                                    required
                                    value={form.warehouse}
                                    onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}
                                    placeholder="Warehouse name or location"
                                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
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
                                <Button type="submit" isLoading={saving} className="flex-1">Add Stock</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}
