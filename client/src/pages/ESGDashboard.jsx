import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Users, Shield, Award, TrendingUp, CheckCircle, Plus, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const RATING_CONFIG = {
    'A+': { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    'A': { color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    'B+': { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    'B': { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    'C': { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    'D': { color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

const BLANK_ENV = { waterUsageLiters: '', energyUsageKwh: '', carbonFootprintKg: '', renewableEnergyPercent: '', wasteRecycledPercent: '', animalWelfareScore: '', organicCertified: false };
const BLANK_SOC = { farmWorkers: '', womenEmployedPercent: '', safetyIncidents: 0, fairTradeCertified: false };
const BLANK_GOV = { complianceScore: '', certifications: '' };

export default function ESGDashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, avgScore: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ reportPeriod: '', environmental: BLANK_ENV, social: BLANK_SOC, governance: BLANK_GOV });

    useEffect(() => { fetchReports(); }, [user]);

    const fetchReports = async () => {
        try {
            const endpoint = user?.role === 'ADMIN' ? '/esg' : '/esg/my';
            // Ensure endpoint starts with /api/
            const apiEndpoint = endpoint.startsWith('/') ? `/api${endpoint}` : `/api/${endpoint}`;
            const res = await axiosClient.get(apiEndpoint);
            if (res.data.success) {
                setReports(res.data.reports || []);
                if (res.data.stats) setStats(res.data.stats);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                reportPeriod: form.reportPeriod,
                environmental: form.environmental,
                social: form.social,
                governance: {
                    ...form.governance,
                    certifications: form.governance.certifications
                        ? form.governance.certifications.split(',').map(c => c.trim())
                        : [],
                },
            };
            const res = await axiosClient.post('/api/esg', payload);
            if (res.data.success) { setShowForm(false); fetchReports(); }
        } catch (err) { alert(err.response?.data?.message || 'Submission failed'); }
        finally { setSubmitting(false); }
    };

    const avgScore = stats.avgScore || (reports.length
        ? Math.round(reports.reduce((s, r) => s + (r.overallScore || 0), 0) / reports.length)
        : 0);

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
                        <div className="p-3 bg-primary-100 rounded-2xl text-primary-600">
                            <Leaf size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">ESG Dashboard</h1>
                            <p className="text-gray-500 mt-0.5">Environmental, Social &amp; Governance tracking</p>
                        </div>
                    </div>
                    {user?.permissions?.includes('submit_esg_report') && (
                        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                            <Plus size={16} /> Submit Report
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Reports', value: reports.length, icon: Award, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200' },
                        { label: 'Avg ESG Score', value: `${avgScore}/100`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                        { label: 'Verified Reports', value: reports.filter(r => r.isVerified).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                    ].map(({ label, value, icon: Icon, color, bg }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card className={`border ${bg} flex items-center gap-4`}>
                                <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Score progress bar */}
                {avgScore > 0 && (
                    <Card>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-800">Average ESG Score</span>
                            <span className="text-sm font-bold text-primary-600">{avgScore}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${avgScore}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                            <span>Poor</span><span>Average</span><span>Excellent</span>
                        </div>
                    </Card>
                )}

                {/* Reports List */}
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <Card className="text-center py-20">
                            <Leaf size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No ESG reports yet</p>
                            {user?.permissions?.includes('submit_esg_report') && (
                                <Button onClick={() => setShowForm(true)} className="mt-6">Submit Your First Report</Button>
                            )}
                        </Card>
                    ) : (
                        reports.map((report, i) => {
                            const rCfg = RATING_CONFIG[report.rating] || { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' };
                            return (
                                <motion.div key={report._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Card className="hover:border-gray-200 transition-colors">
                                        <div className="flex items-start gap-6">
                                            {/* Score circle */}
                                            <div className="flex-shrink-0 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold text-primary-600">{report.overallScore}</span>
                                                    <span className="text-xs text-gray-400">score</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className="font-semibold text-gray-800">{report.reportPeriod}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold border ${rCfg.bg} ${rCfg.color}`}>
                                                        {report.rating}
                                                    </span>
                                                    {report.isVerified && (
                                                        <Badge variant="success">
                                                            <CheckCircle size={10} className="mr-1" /> Verified
                                                        </Badge>
                                                    )}
                                                    {report.farmer && <span className="text-xs text-gray-500">by {report.farmer.name}</span>}
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                                                            <Leaf size={11} className="text-emerald-500" /> Environmental
                                                        </div>
                                                        <div className="font-semibold text-emerald-600 text-sm">
                                                            {report.environmental?.animalWelfareScore || 'N/A'} welfare
                                                        </div>
                                                    </div>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                                                            <Users size={11} className="text-blue-500" /> Social
                                                        </div>
                                                        <div className="font-semibold text-blue-600 text-sm">
                                                            {report.social?.womenEmployedPercent || 0}% women
                                                        </div>
                                                    </div>
                                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                                                            <Shield size={11} className="text-purple-500" /> Governance
                                                        </div>
                                                        <div className="font-semibold text-purple-600 text-sm">
                                                            {report.governance?.complianceScore || 0}/100
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Submit Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <Card className="border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Submit ESG Report</h2>
                                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1.5 block">Report Period</label>
                                        <input
                                            required
                                            value={form.reportPeriod}
                                            onChange={e => setForm(p => ({ ...p, reportPeriod: e.target.value }))}
                                            placeholder="e.g. Q1-2025"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <p className="section-label flex items-center gap-1.5"><Leaf size={12} /> Environmental</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[['Renewable Energy %', 'renewableEnergyPercent'], ['Waste Recycled %', 'wasteRecycledPercent'], ['Animal Welfare (0-100)', 'animalWelfareScore'], ['Carbon Footprint (kg)', 'carbonFootprintKg']].map(([label, key]) => (
                                                <div key={key}>
                                                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                                    <input type="number" value={form.environmental[key] || ''} onChange={e => setForm(p => ({ ...p, environmental: { ...p.environmental, [key]: e.target.value } }))} className="input-field text-sm py-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="section-label flex items-center gap-1.5"><Users size={12} /> Social</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[['Women Employed %', 'womenEmployedPercent'], ['Safety Incidents', 'safetyIncidents'], ['Farm Workers', 'farmWorkers']].map(([label, key]) => (
                                                <div key={key}>
                                                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                                    <input type="number" value={form.social[key] || ''} onChange={e => setForm(p => ({ ...p, social: { ...p.social, [key]: e.target.value } }))} className="input-field text-sm py-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="section-label flex items-center gap-1.5"><Shield size={12} /> Governance</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Compliance Score (0-100)</label>
                                                <input type="number" value={form.governance.complianceScore || ''} onChange={e => setForm(p => ({ ...p, governance: { ...p.governance, complianceScore: e.target.value } }))} className="input-field text-sm py-2" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Certifications (comma-separated)</label>
                                                <input value={form.governance.certifications || ''} onChange={e => setForm(p => ({ ...p, governance: { ...p.governance, certifications: e.target.value } }))} className="input-field text-sm py-2" placeholder="ISO14001, GOTS, RWS" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                                        <Button type="submit" isLoading={submitting} className="flex-1">Submit Report</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
