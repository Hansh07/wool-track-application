import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { Package, Download, Truck, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentStep, setPaymentStep] = useState('method'); // method, gateway, processing, success
    const [selectedProvider, setSelectedProvider] = useState('');

    const fetchOrders = async () => {
        try {
            const { data } = await client.get('/api/shop/orders/my');
            setOrders(Array.isArray(data) ? data : (data.orders || []));
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRemove = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await client.delete(`/api/shop/order/${orderId}`);
                fetchOrders();
            } catch (error) {
                console.error("Error removing order:", error);
                alert("Failed to remove order");
            }
        }
    };

    const initiatePayment = (order) => {
        setSelectedOrder(order);
        setPaymentMethod('UPI');
        setPaymentStep('method');
        setSelectedProvider('');
        setShowPaymentModal(true);
    };

    const proceedToGateway = () => {
        if (paymentMethod === 'Cash on Delivery') {
            processPayment();
        } else {
            setPaymentStep('gateway');
        }
    };

    const processPayment = async () => {
        setPaymentStep('processing');
        // Simulate network delay for realism
        setTimeout(async () => {
            try {
                if (!selectedOrder) return;
                await client.post(`/api/shop/order/${selectedOrder._id}/pay`, {
                    paymentMethod,
                    provider: selectedProvider
                });
                setPaymentStep('success');
                fetchOrders();
                // Close modal after showing success for a moment
                setTimeout(() => {
                    setShowPaymentModal(false);
                    setSelectedOrder(null);
                }, 2500);
            } catch (error) {
                console.error("Error processing payment:", error);
                alert("Payment failed");
                setPaymentStep('method'); // Reset to try again
            }
        }, 1500);
    };

    const handleInvoice = (order) => {
        const invoiceWindow = window.open('', '_blank');
        const invoiceContent = `
            <html>
                <head>
                    <title>Invoice - ${order._id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: end; }
                        .logo { font-size: 24px; font-weight: bold; }
                        .invoice-title { font-size: 36px; color: #666; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; color: #666; }
                        td { padding: 12px; border-bottom: 1px solid #eee; }
                        .total-row { font-size: 18px; font-weight: bold; }
                        .total-price { color: #2ecc71; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">WoolMonitor Inc.</div>
                        <div class="invoice-title">INVOICE</div>
                    </div>

                    <div class="grid">
                        <div class="box">
                            <strong>Bill To:</strong><br>
                            Customer ID: ${order.user || 'N/A'}<br>
                            Date: ${new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div class="box">
                            <strong>Order Details:</strong><br>
                            ID: #${order._id.slice(-6).toUpperCase()}<br>
                            Status: ${order.paymentStatus || 'Pending'}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Weight</th>
                                <th>Grade</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.woolType} <br><small style="color:#999">Batch #${item.batchId}</small></td>
                                    <td>${item.weight} kg</td>
                                    <td>${item.qualityReport?.colorGrade || 'A'}</td>
                                    <td style="text-align: right;">$${((item.weight || 0) * 15).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="text-align: right;">
                        <p class="total-row">Total Amount: <span class="total-price">$${order.totalAmount.toLocaleString()}</span></p>
                    </div>

                    <script>window.print();</script>
                </body>
            </html>
        `;
        invoiceWindow.document.write(invoiceContent);
        invoiceWindow.document.close();
    };


    if (loading) return (
        <DashboardLayout role="Buyer">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Buyer">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
                        <p className="text-gray-500">Track your purchases and download invoices.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order._id} className="p-0 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 p-4 md:px-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</p>
                                        <p className="text-gray-800 font-medium text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total</p>
                                        <p className="text-gray-800 font-bold text-sm font-mono">${order.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                                        <Badge variant={order.status === 'Completed' ? 'success' : 'neutral'}>{order.status}</Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {order.status === 'Pending' && order.paymentStatus !== 'Paid' ? (
                                        <Button size="sm" onClick={() => initiatePayment(order)} className="bg-indigo-600 hover:bg-indigo-500">
                                            <CreditCard size={14} className="mr-2" /> Pay Now
                                        </Button>
                                    ) : (
                                        <Badge variant="success" className="h-8"><CheckCircle size={14} className="mr-1" /> Paid</Badge>
                                    )}

                                    <Button size="sm" variant="outline" onClick={() => handleInvoice(order)}>
                                        <Download size={14} className="mr-2" /> Invoice
                                    </Button>

                                    {order.status === 'Pending' && order.paymentStatus !== 'Paid' && (
                                        <button
                                            onClick={() => handleRemove(order._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            title="Cancel Order"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 md:px-6">
                                {order.items.map(item => (
                                    <div key={item._id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.images[0]}`} className="w-full h-full object-cover" alt="item" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-gray-800 font-medium">{item.woolType}</h4>
                                                <p className="text-xs text-gray-500 font-mono">#{item.batchId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-800 font-mono">${((item.weight || 0) * 15).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{item.weight} kg</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}

                    {orders.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <Package size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No orders placed yet</h3>
                            <Button variant="primary" onClick={() => window.location.href = '/'}>Browse Marketplace</Button>
                        </div>
                    )}
                </div>

                {/* Secure Payment Modal */}
                <Modal
                    isOpen={showPaymentModal}
                    onClose={() => { if (paymentStep !== 'processing') setShowPaymentModal(false); }}
                    title={paymentStep === 'success' ? 'Payment Successful' : 'Secure Payment'}
                >
                    <div className="min-h-[300px] flex flex-col">

                        {/* Summary Header - Hidden on success */}
                        {paymentStep !== 'success' && (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center mb-6">
                                <p className="text-gray-500 text-sm mb-1">Total Payable Amount</p>
                                <p className="text-3xl font-bold text-gray-800 font-mono">${selectedOrder?.totalAmount.toLocaleString()}</p>
                            </div>
                        )}

                        {/* Step 1: Method Selection */}
                        {paymentStep === 'method' && (
                            <div className="space-y-4 flex-1">
                                <p className="text-sm text-gray-500 font-medium uppercase">Select Payment Method</p>
                                {['UPI', 'Net Banking', 'Cash on Delivery'].map(method => (
                                    <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method ? 'bg-indigo-50 border-indigo-500 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="text-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span className="font-medium flex-1">{method}</span>
                                        {method === 'UPI' && <Badge variant="neutral" className="text-xs">GPay / Paytm</Badge>}
                                        {method === 'Net Banking' && <Badge variant="neutral" className="text-xs">All Banks</Badge>}
                                    </label>
                                ))}

                                <div className="pt-6 flex gap-4 mt-auto">
                                    <Button variant="ghost" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-neon" onClick={proceedToGateway}>
                                        Proceed to Pay
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Gateway Simulation */}
                        {paymentStep === 'gateway' && (
                            <div className="space-y-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 cursor-pointer hover:text-gray-800" onClick={() => setPaymentStep('method')}>
                                    <span>← Back to methods</span>
                                </div>

                                {paymentMethod === 'UPI' && (
                                    <div className="space-y-4">
                                        <h3 className="text-gray-800 font-bold text-lg">Select UPI App</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Google Pay', 'Paytm', 'PhonePe', 'BHIM UPI'].map(app => (
                                                <button
                                                    key={app}
                                                    onClick={() => { setSelectedProvider(app); processPayment(); }}
                                                    className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-all"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs border border-gray-200">
                                                        {app.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">{app}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'Net Banking' && (
                                    <div className="space-y-4">
                                        <h3 className="text-gray-800 font-bold text-lg">Select Bank</h3>
                                        <div className="space-y-2">
                                            <select
                                                className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:border-indigo-500 outline-none"
                                                onChange={(e) => setSelectedProvider(e.target.value)}
                                            >
                                                <option value="">-- Choose your Bank --</option>
                                                <option value="SBI">State Bank of India</option>
                                                <option value="HDFC">HDFC Bank</option>
                                                <option value="ICICI">ICICI Bank</option>
                                                <option value="Axis">Axis Bank</option>
                                                <option value="Kotak">Kotak Mahindra Bank</option>
                                            </select>
                                            <Button
                                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500"
                                                disabled={!selectedProvider}
                                                onClick={processPayment}
                                            >
                                                Secure Pay
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Processing */}
                        {paymentStep === 'processing' && (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader size="xl" />
                                <p className="text-gray-600 animate-pulse">Processing Payment...</p>
                                <p className="text-xs text-gray-400">Please do not close this window</p>
                            </div>
                        )}

                        {/* Step 4: Success Message */}
                        {paymentStep === 'success' && (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle size={48} className="text-emerald-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
                                    <p className="text-gray-500">Your order has been confirmed.</p>
                                    <div className="text-sm text-gray-400 mt-2">Transaction ID: TXN-{Date.now().toString().slice(-8)}</div>
                                </div>
                            </div>
                        )}

                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default MyOrders;
