import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Shield, CheckCircle, XCircle, Calendar, X, ExternalLink } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const TYPE_CONFIG = {
    Quality: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    Origin: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    Organic: { color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    RWS: { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    IWTO: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    ESG: { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
};

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        axiosClient.get('/api/certificates/my')
            .then(res => { if (res.data.success) setCertificates(res.data.certificates || []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-500">
                        <Award size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Digital Certificates</h1>
                        <p className="text-gray-500 mt-0.5">Blockchain-backed wool quality certificates</p>
                    </div>
                </div>

                {/* Summary stats */}
                {certificates.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total', value: certificates.length, color: 'text-gray-800' },
                            { label: 'Active', value: certificates.filter(c => !c.isRevoked).length, color: 'text-emerald-600' },
                            { label: 'Revoked', value: certificates.filter(c => c.isRevoked).length, color: 'text-red-500' },
                            { label: 'Types', value: [...new Set(certificates.map(c => c.type))].length, color: 'text-blue-500' },
                        ].map(({ label, value, color }) => (
                            <Card key={label} className="text-center py-4">
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Certificates grid */}
                {certificates.length === 0 ? (
                    <Card className="text-center py-20">
                        <Award size={56} className="text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Certificates Yet</h3>
                        <p className="text-gray-400 text-sm">Certificates appear here once issued by a Quality Inspector</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {certificates.map((cert, i) => {
                            const cfg = TYPE_CONFIG[cert.type] || { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' };
                            return (
                                <motion.div
                                    key={cert._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelected(cert)}
                                    className="cursor-pointer"
                                >
                                    <Card className={`border ${cfg.bg} hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4`}>
                                        {/* Type + status row */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                                                    <Award size={11} /> {cert.type}
                                                </span>
                                                <p className="font-mono text-xs text-gray-400 mt-2">{cert.certificateNumber}</p>
                                            </div>
                                            {cert.isRevoked
                                                ? <XCircle size={20} className="text-red-400 flex-shrink-0" />
                                                : <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                            }
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2">
                                            {[
                                                ['Wool Type', cert.woolType],
                                                ['Grade', cert.grade],
                                                ['Weight', `${cert.weight ?? '—'} kg`],
                                                ['Issued By', cert.issuedBy?.name ?? '—'],
                                            ].map(([k, v]) => (
                                                <div key={k} className="flex justify-between text-sm">
                                                    <span className="text-gray-400">{k}</span>
                                                    <span className="font-medium text-gray-800">{v}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar size={11} />
                                                {cert.validUntil
                                                    ? new Date(cert.validUntil).toLocaleDateString()
                                                    : 'No expiry'}
                                            </div>
                                            {cert.blockchainHash && (
                                                <div className="flex items-center gap-1 text-xs text-primary-600">
                                                    <Shield size={11} /> Verified
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <Card className="border-gray-200">
                                {/* Modal header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-xl text-yellow-500">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800">{selected.type} Certificate</h2>
                                            <p className="font-mono text-xs text-gray-400">{selected.certificateNumber}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-800 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Status badge */}
                                <div className="flex justify-center mb-6">
                                    <Badge variant={selected.isRevoked ? 'danger' : 'success'}>
                                        {selected.isRevoked
                                            ? <><XCircle size={12} className="mr-1" /> Revoked</>
                                            : <><CheckCircle size={12} className="mr-1" /> Valid</>
                                        }
                                    </Badge>
                                </div>

                                {/* QR code */}
                                {selected.qrCode && (
                                    <div className="flex justify-center mb-6">
                                        <div className="p-3 bg-white rounded-2xl border border-gray-200">
                                            <img src={selected.qrCode} alt="QR Code" className="w-28 h-28" />
                                        </div>
                                    </div>
                                )}

                                {/* Details list */}
                                <div className="space-y-2 mb-6">
                                    {[
                                        ['Wool Type', selected.woolType],
                                        ['Grade', selected.grade],
                                        ['Weight', `${selected.weight ?? '—'} kg`],
                                        ['Fiber Diameter', selected.fiberDiameter ? `${selected.fiberDiameter} microns` : 'N/A'],
                                        ['Clean Yield', selected.cleanWoolYield ? `${selected.cleanWoolYield}%` : 'N/A'],
                                        ['Origin', selected.origin ?? 'N/A'],
                                        ['Issued By', selected.issuedBy?.name ?? '—'],
                                        ['Valid Until', selected.validUntil ? new Date(selected.validUntil).toLocaleDateString() : 'Indefinite'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                                            <span className="text-gray-500">{k}</span>
                                            <span className="font-medium text-gray-800">{v}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Blockchain */}
                                {selected.blockchainHash && (
                                    <div className="mb-6 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs text-primary-600">
                                            <Shield size={14} />
                                            <span className="font-mono break-all">{selected.blockchainHash.substring(0, 32)}…</span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {selected.verificationUrl && (
                                        <Button
                                            variant="secondary"
                                            className="flex-1 flex items-center gap-2"
                                            onClick={() => window.open(selected.verificationUrl, '_blank')}
                                        >
                                            <ExternalLink size={15} /> Verify
                                        </Button>
                                    )}
                                    <Button onClick={() => setSelected(null)} className="flex-1">Close</Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
