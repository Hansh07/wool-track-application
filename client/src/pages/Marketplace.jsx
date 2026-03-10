import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Search, Filter, Package, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

const Marketplace = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterGrade, setFilterGrade] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await client.get('/api/shop/products'); // Changed endpoint
                setProducts(Array.isArray(data) ? data : (data.products || []));
            } catch (error) {
                console.error("Error fetching products:", error);
                // The original diff had a problematic double catch.
                // Assuming the intent is to just update the endpoint and keep the original error handling structure.
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleBuyNow = async (batchId) => { // Renamed function
        try {
            setBuying(batchId); // Added
            await client.post('/api/shop/order', { batchIds: [batchId] }); // Changed endpoint
            alert('Order placed successfully!'); // Changed alert
            navigate('/orders');
        } catch (err) { // Changed error variable
            alert(err.response?.data?.message || 'Purchase failed'); // Changed alert
        } finally {
            setBuying(null); // Added
        }
    };

    const handleDeleteBatch = async (batchId) => { // Renamed function
        if (!window.confirm('Delete this batch?')) return; // Changed confirm message

        try {
            await client.delete(`/api/batches/${batchId}`); // Changed endpoint
            setProducts(products.filter(p => p._id !== batchId));
        } catch (error) {
            console.error("Remove failed:", error);
            alert("Failed to remove batch.");
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.woolType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.batchId && product.batchId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGrade = filterGrade ? product.qualityReport?.colorGrade === filterGrade : true;
        return matchesSearch && matchesGrade;
    });

    if (loading) return (
        <DashboardLayout role="Buyer">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Buyer">
            <div className="space-y-8">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Wool Marketplace</h1>
                        <p className="text-gray-500">Welcome, <span className="text-primary-600 font-semibold">{user?.name}</span>. Premium verified wool batches available for purchase.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-[2] md:w-64">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            className={`flex items-center gap-2 ${showFilters ? 'bg-primary-100 text-primary-600 border-primary-400' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} /> <span className="hidden sm:inline">Filters</span>
                        </Button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <Card className="animate-in slide-in-from-top-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Filter by Grade</p>
                        <div className="flex flex-wrap gap-2">
                            {['A', 'B', 'C', 'D', 'E'].map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => setFilterGrade(filterGrade === grade ? '' : grade)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${filterGrade === grade
                                        ? 'bg-primary-500 text-white border-primary-500 shadow-neon'
                                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
                                        }`}
                                >
                                    Grade {grade}
                                </button>
                            ))}
                            {filterGrade && (
                                <button
                                    onClick={() => setFilterGrade('')}
                                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </Card>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <Card key={product._id} className="group p-0 overflow-hidden border-gray-100 hover:border-primary-300 transition-all duration-300">
                            {/* Image Header */}
                            <div className="h-56 relative overflow-hidden bg-primary-50">
                                {product.images && product.images.length > 0 ? (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-80 z-[1]" />
                                        <img
                                            src={product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}${product.images[0]}`}
                                            alt={product.woolType}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={48} className="opacity-20" />
                                    </div>
                                )}

                                <div className="absolute top-3 right-3 z-10">
                                    <Badge variant="success" className="shadow-lg backdrop-blur-md">
                                        Grade {product.qualityReport?.colorGrade || 'A'}
                                    </Badge>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{product.woolType}</h3>
                                    <p className="text-xs text-white/70 font-mono">#{product.batchId || product._id.slice(-6)}</p>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-5 space-y-4">
                                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase">Estimated Price</p>
                                    <p className="text-2xl font-bold font-mono text-primary-600">
                                        ₹{(product.weight * 15).toLocaleString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Weight</p>
                                        <p className="font-semibold text-gray-800">{product.weight}kg</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs">Micron</p>
                                        <p className="font-semibold text-primary-600">{product.qualityReport?.fiberDiameter || "N/A"}µm</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-xs">Processing Stage</p>
                                        <p className="font-semibold text-gray-800 text-sm">{product.currentStage || 'Received'}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleBuy(product._id)}
                                    className="w-full mt-2 shadow-neon bg-gradient-to-r from-primary-600 to-indigo-600 border-none"
                                >
                                    <ShoppingBag size={16} className="mr-2" /> Buy Now
                                </Button>
                                {(user?.role === 'ADMIN' || user?.role === 'FARMER') && (
                                    <Button
                                        onClick={() => handleDelete(product._id)}
                                        className="w-full mt-2 bg-red-500 hover:bg-red-600 border-none text-white"
                                    >
                                        <Trash2 size={16} className="mr-2" /> Remove
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria.</p>
                            {(searchTerm || filterGrade) && (
                                <button
                                    onClick={() => { setSearchTerm(''); setFilterGrade(''); }}
                                    className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Marketplace;
