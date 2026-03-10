import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { ClipboardCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const QualityResults = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await client.get('/api/quality/my');
                setReports(data);
            } catch (error) {
                console.error("Error fetching quality reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <ClipboardCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Quality Reports</h1>
                        <p className="text-gray-500">View official inspection results provided by the lab.</p>
                    </div>
                </div>

                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="p-5 text-gray-600 font-medium text-sm">Batch ID</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Wool Type</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Date</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Result</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.map(report => (
                                    <tr key={report.batchId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-mono text-gray-800 text-sm">#{report.batchId}</td>
                                        <td className="p-5 font-medium text-gray-800">{report.woolType}</td>
                                        <td className="p-5 text-gray-500 text-sm">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="p-5">
                                            <Badge variant={report.grade === 'Approved' ? 'success' : 'danger'}>
                                                {report.grade}
                                            </Badge>
                                        </td>
                                        <td className="p-5 text-gray-500 text-sm max-w-xs truncate">
                                            {report.notes || 'Full lab report available.'}
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-400">
                                            No quality reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default QualityResults;
