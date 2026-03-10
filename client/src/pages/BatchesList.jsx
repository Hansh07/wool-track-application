import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const BatchesList = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission, user } = useAuth();

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const { data } = await client.get('/api/batches');
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            } catch (error) {
                console.error('Error fetching batches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    const getStatusBadgeVariant = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'danger';
        return 'warning';
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Wool Batches</h1>
                    <p className="text-gray-500">View and manage all registered lots.</p>
                </div>
                {hasPermission('create_batch') && (
                    <Link to="/create-batch">
                        <Button className="shadow-neon">
                            <Plus size={18} className="mr-2" /> New Batch
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch) => (
                    <Card key={batch._id} hoverEffect className="group overflow-hidden p-0">
                        {/* Thumbnail Header */}
                        <div className="h-48 bg-primary-50 relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <Badge variant={getStatusBadgeVariant(batch.qualityStatus)} className="backdrop-blur-md bg-opacity-80 shadow-lg">
                                    {batch.qualityStatus}
                                </Badge>
                            </div>

                            {batch.images && batch.images.length > 0 ? (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-60 z-[1]" />
                                    <img
                                        src={batch.images[0].startsWith('http') ? batch.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}${batch.images[0]}`}
                                        alt={batch.woolType}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <Package size={48} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No Image</span>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <h3 className="text-xl font-bold text-white truncate drop-shadow">{batch.woolType}</h3>
                                <p className="text-white/80 text-xs font-mono">#{batch.batchId}</p>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="text-gray-500">Weight</span>
                                    <span className="font-semibold text-gray-800">{batch.weight} kg</span>
                                </div>
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="text-gray-500">Stage</span>
                                    <span className="font-semibold text-primary-600">{batch.currentStage}</span>
                                </div>
                                {/* Financial Context */}
                                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                                    <span className="text-gray-500">
                                        {user?.role === 'FARMER' ? 'Est. Revenue' :
                                            user?.role === 'QUALITY_INSPECTOR' ? 'Service Fee' :
                                                user?.role === 'MILL_OPERATOR' ? 'Proc. Fee' : 'Value'}
                                    </span>
                                    <span className="font-semibold text-primary-600">
                                        {user?.role === 'FARMER' ? `$${(batch.financials?.netFarmerEarnings || 0).toFixed(2)}` :
                                            user?.role === 'QUALITY_INSPECTOR' ? (batch.qualityStatus !== 'Pending' ? '$50.00' : '-') :
                                                user?.role === 'MILL_OPERATOR' ? `$${(batch.weight * 2).toFixed(2)}` :
                                                    '-'}
                                    </span>
                                </div>
                            </div>

                            <Link to={`/batches/${batch._id}`}>
                                <Button variant="secondary" className="w-full">View Details</Button>
                            </Link>
                        </div>
                    </Card>
                ))}

                {batches.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-1">No batches found</h3>
                        <p className="text-gray-500">Get started by creating a new batch request.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BatchesList;
