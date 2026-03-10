import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Package, X, MapPin,
    Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
    Layers, GripVertical, TrendingUp,
    IndianRupee, Scale, Clock, Sparkles, RefreshCw, Award,
    Inbox, ChevronRight, Eye
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Loader } from '../components/ui/Loader';

/* ─── Stage Config ─────────────────────────────────────────────────── */
const STAGES = ['RAW', 'Cleaning', 'Carding', 'Spinning', 'Finished'];

const STAGE_CFG = {
    RAW: {
        icon: <Inbox size={15} />,
        dot: 'bg-blue-500',
        border: 'border-blue-400',
        badge: 'bg-blue-50 text-blue-600 border-blue-200',
        pill: 'bg-blue-50 text-blue-600',
        track: 'bg-blue-500',
        accent: '#3b82f6',
        soft: '#EFF6FF',
    },
    Cleaning: {
        icon: <Sparkles size={15} />,
        dot: 'bg-amber-400',
        border: 'border-amber-400',
        badge: 'bg-amber-50 text-amber-600 border-amber-200',
        pill: 'bg-amber-50 text-amber-600',
        track: 'bg-amber-400',
        accent: '#f59e0b',
        soft: '#FFFBEB',
    },
    Carding: {
        icon: <Layers size={15} />,
        dot: 'bg-orange-500',
        border: 'border-orange-400',
        badge: 'bg-orange-50 text-orange-600 border-orange-200',
        pill: 'bg-orange-50 text-orange-600',
        track: 'bg-orange-500',
        accent: '#f97316',
        soft: '#FFF7ED',
    },
    Spinning: {
        icon: <RefreshCw size={15} />,
        dot: 'bg-violet-500',
        border: 'border-violet-400',
        badge: 'bg-violet-50 text-violet-600 border-violet-200',
        pill: 'bg-violet-50 text-violet-600',
        track: 'bg-violet-500',
        accent: '#8b5cf6',
        soft: '#F5F3FF',
    },
    Finished: {
        icon: <Award size={15} />,
        dot: 'bg-emerald-500',
        border: 'border-emerald-400',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        pill: 'bg-emerald-50 text-emerald-600',
        track: 'bg-emerald-500',
        accent: '#10b981',
        soft: '#ECFDF5',
    },
};

/* ─── Weather Icon ─────────────────────────────────────────────────── */
const WeatherIcon = ({ code, size = 18 }) => {
    if (code === 0) return <Sun size={size} className="text-yellow-400" />;
    if (code <= 3) return <Cloud size={size} className="text-gray-300" />;
    if (code <= 48) return <Cloud size={size} className="text-gray-400" />;
    if (code <= 67) return <CloudRain size={size} className="text-blue-400" />;
    if (code <= 77) return <CloudSnow size={size} className="text-sky-300" />;
    if (code <= 82) return <CloudRain size={size} className="text-blue-400" />;
    return <CloudLightning size={size} className="text-yellow-300" />;
};

/* ─── Stat Card ────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, trend, iconBg, iconColor, gradientFrom, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
        {/* Background gradient blob */}
        <div
            className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-[0.07]"
            style={{ background: gradientFrom }}
        />
        <div className="relative z-10">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            {sub && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    {trend && <TrendingUp size={10} className="text-emerald-500" />}
                    {sub}
                </p>
            )}
        </div>
    </motion.div>
);

/* ─── Pipeline Timeline ─────────────────────────────────────────────── */
const PipelineTimeline = ({ getBatchesByStage }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 px-8 py-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
        <div className="flex items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-6 whitespace-nowrap">Pipeline</p>
            <div className="flex items-center flex-1">
                {STAGES.map((stage, i) => {
                    const cfg = STAGE_CFG[stage];
                    const count = getBatchesByStage(stage).length;
                    const hasItems = count > 0;
                    const isLast = i === STAGES.length - 1;
                    return (
                        <React.Fragment key={stage}>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="relative">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`
                                            w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                                            ${hasItems
                                                ? `${cfg.dot} text-white shadow-md`
                                                : 'bg-gray-100 text-gray-400'}
                                        `}
                                        style={hasItems ? { boxShadow: `0 0 0 4px ${cfg.accent}18` } : {}}
                                    >
                                        {cfg.icon}
                                    </motion.div>
                                    {hasItems && (
                                        <span
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border-2 text-[9px] font-bold flex items-center justify-center"
                                            style={{ borderColor: cfg.accent, color: cfg.accent }}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium whitespace-nowrap ${hasItems ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {stage}
                                </span>
                            </div>
                            {!isLast && (
                                <div className="flex-1 relative h-px mx-2 mt-[-10px]">
                                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                                    {hasItems && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `linear-gradient(90deg, ${cfg.accent}, ${STAGE_CFG[STAGES[i + 1]].accent})`,
                                                opacity: 0.6
                                            }}
                                        />
                                    )}
                                    <ChevronRight
                                        size={12}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300"
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

/* ─── Batch Card ────────────────────────────────────────────────────── */
const BatchCard = ({ batch, stage, canDrag, onDragStart, isMoving }) => {
    const cfg = STAGE_CFG[stage];
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{
                opacity: isMoving ? 0.35 : 1,
                scale: isMoving ? 0.97 : 1,
                y: 0,
            }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            draggable={canDrag}
            onDragStart={() => canDrag && onDragStart(batch)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing transition-shadow duration-200"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderRadius: 16 }}
        >
            {/* Colored top accent bar */}
            <div className="h-1 w-full" style={{ background: cfg.accent }} />

            <div className="p-4">
                {/* Top row: ID + drag handle */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        {canDrag && (
                            <GripVertical
                                size={13}
                                className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                            />
                        )}
                        <span className="font-mono text-[10px] text-gray-400 tracking-wider font-medium">
                            #{batch.batchId || batch._id.slice(-8).toUpperCase()}
                        </span>
                    </div>
                    <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.accent + '15', color: cfg.accent }}
                    >
                        {batch.weight} kg
                    </span>
                </div>

                {/* Wool Type */}
                <p className="text-sm font-semibold text-gray-800 mb-0.5 truncate leading-tight">
                    {batch.woolType}
                </p>

                {/* Location */}
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3 truncate">
                    <MapPin size={10} className="flex-shrink-0" />
                    {batch.source || 'Unknown Farm'}
                </p>

                {/* Status + weight row */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.pill}`}>
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: cfg.accent }}
                        />
                        {stage}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {batch.qualityStatus || 'Pending'}
                    </span>
                </div>

                {/* View Details Button */}
                <Link to={`/batches/${batch._id}`} onClick={e => e.stopPropagation()}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-medium transition-all duration-150"
                        style={{
                            background: cfg.accent + '10',
                            color: cfg.accent,
                            border: `1px solid ${cfg.accent}25`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = cfg.accent + '18';
                            e.currentTarget.style.borderColor = cfg.accent + '50';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = cfg.accent + '10';
                            e.currentTarget.style.borderColor = cfg.accent + '25';
                        }}
                    >
                        <Eye size={11} /> View Details
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

/* ─── Kanban Column ─────────────────────────────────────────────────── */
const KanbanColumn = ({
    stage, cfg, stageBatches, isOver, draggedBatch,
    canDrag, movingBatch,
    onDragOver, onDragLeave, onDrop, onDragStart, colIndex
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + colIndex * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`
            w-72 flex-shrink-0 flex flex-col h-full rounded-2xl border-2 transition-all duration-200
            ${isOver ? 'border-dashed scale-[1.01]' : 'border-gray-100 bg-gray-50/60'}
        `}
        style={isOver
            ? { borderColor: cfg.accent + '80', background: cfg.soft }
            : { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
        }
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
        {/* Column Header */}
        <div className="flex-shrink-0 px-4 py-4 rounded-t-2xl bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: cfg.accent }}
                    >
                        {cfg.icon}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 leading-none">{stage}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {stageBatches.length} batch{stageBatches.length !== 1 ? 'es' : ''}
                        </p>
                    </div>
                </div>
                <span
                    className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: cfg.accent + '15', color: cfg.accent }}
                >
                    {stageBatches.length}
                </span>
            </div>
            {isOver && draggedBatch && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-center mt-2 font-medium"
                    style={{ color: cfg.accent }}
                >
                    Drop to move here
                </motion.p>
            )}
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            <AnimatePresence>
                {stageBatches.map(batch => (
                    <BatchCard
                        key={batch._id}
                        batch={batch}
                        stage={stage}
                        canDrag={canDrag}
                        onDragStart={onDragStart}
                        isMoving={movingBatch === batch._id}
                    />
                ))}
            </AnimatePresence>

            {stageBatches.length === 0 && !isOver && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                    <Package size={24} className="mb-2.5 opacity-50" />
                    <span className="text-xs font-medium opacity-50">No batches</span>
                </div>
            )}

            {isOver && draggedBatch && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 border-dashed h-24 flex items-center justify-center"
                    style={{ borderColor: cfg.accent + '50', background: cfg.soft }}
                >
                    <span className="text-xs font-medium" style={{ color: cfg.accent }}>
                        Release to move
                    </span>
                </motion.div>
            )}
        </div>
    </motion.div>
);

/* ─── Main Dashboard ────────────────────────────────────────────────── */
const OperatorDashboard = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const [showEarningsInfo, setShowEarningsInfo] = useState(false);
    const [draggedBatch, setDraggedBatch] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);
    const [movingBatch, setMovingBatch] = useState(null);

    const canDrag = user?.permissions?.includes('update_batch_stage');

    useEffect(() => {
        client.get('/batches')
            .then(({ data }) => setBatches(Array.isArray(data) ? data : (data.batches || [])))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=26.91&longitude=75.79&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FKolkata')
            .then(r => r.json())
            .then(d => setWeather(d.current))
            .catch(() => { });
    }, []);

    const handleDrop = useCallback(async (targetStage) => {
        if (!draggedBatch || draggedBatch.currentStage === targetStage) {
            setDraggedBatch(null);
            setDragOverStage(null);
            return;
        }
        const prev = [...batches];
        setBatches(b => b.map(x => x._id === draggedBatch._id ? { ...x, currentStage: targetStage } : x));
        setMovingBatch(draggedBatch._id);
        setDraggedBatch(null);
        setDragOverStage(null);
        try {
            await client.patch(`/api/batches/${draggedBatch._id}/status`, { stage: targetStage });
        } catch {
            setBatches(prev);
        } finally {
            setTimeout(() => setMovingBatch(null), 600);
        }
    }, [draggedBatch, batches]);

    const getBatchesByStage = (stage) => batches.filter(b => b.currentStage === stage);

    const totalKg = batches.reduce((s, b) => s + (b.weight || 0), 0);
    const revenue = totalKg * 20;
    const inProgress = batches.filter(b => b.currentStage !== 'Finished').length;
    const finished = batches.filter(b => b.currentStage === 'Finished').length;

    if (loading) return (
        <DashboardLayout role="Mill Operator">
            <div className="flex h-[80vh] items-center justify-center">
                <Loader size="xl" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Mill Operator">
            <div
                className="flex flex-col gap-6 h-[calc(100vh-5.5rem)] overflow-hidden"
                style={{ fontFamily: 'Inter, sans-serif' }}
            >
                {/* ══ Header ═════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center justify-between flex-shrink-0"
                >
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Production Floor
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Welcome back, <span className="text-primary-600 font-medium">{user?.name}</span>
                            <span className="mx-2 text-gray-300">·</span>
                            Live operations pipeline
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowEarningsInfo(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 font-medium hover:border-primary-300 hover:text-primary-600 transition-colors"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                        >
                            <IndianRupee size={14} /> Earnings
                        </motion.button>
                        <Link to="/monitoring">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 font-medium hover:border-gray-300 transition-colors"
                                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                            >
                                <Activity size={14} /> Monitoring
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* ══ Stat Cards ══════════════════════════════════════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 flex-shrink-0">
                    <StatCard
                        index={0}
                        icon={<IndianRupee size={18} />}
                        label="Processing Revenue"
                        value={`₹${revenue.toLocaleString()}`}
                        sub={`@ ₹20 per kg · ${totalKg.toLocaleString()} kg`}
                        trend
                        iconBg="bg-primary-50"
                        iconColor="text-primary-600"
                        gradientFrom="#5F9EA0"
                    />
                    <StatCard
                        index={1}
                        icon={<Scale size={18} />}
                        label="Total KG Processed"
                        value={`${totalKg.toLocaleString()} kg`}
                        sub={`${batches.length} batch${batches.length !== 1 ? 'es' : ''} total`}
                        iconBg="bg-blue-50"
                        iconColor="text-blue-600"
                        gradientFrom="#3b82f6"
                    />
                    <StatCard
                        index={2}
                        icon={<Clock size={18} />}
                        label="In Progress"
                        value={inProgress}
                        sub={`${finished} completed`}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-600"
                        gradientFrom="#f97316"
                    />
                    <StatCard
                        index={3}
                        icon={weather
                            ? <WeatherIcon code={weather.weather_code} size={18} />
                            : <Cloud size={18} />
                        }
                        label="Jaipur, India"
                        value={weather ? `${Math.round(weather.temperature_2m)}°C` : '—'}
                        sub={weather
                            ? `${weather.relative_humidity_2m}% humidity · ${Math.round(weather.wind_speed_10m)} km/h`
                            : 'Loading weather...'
                        }
                        iconBg="bg-sky-50"
                        iconColor="text-sky-600"
                        gradientFrom="#0ea5e9"
                    />
                </div>

                {/* ══ Pipeline Timeline ═══════════════════════════════════ */}
                <div className="flex-shrink-0">
                    <PipelineTimeline getBatchesByStage={getBatchesByStage} />
                </div>

                {/* ══ Kanban Board ════════════════════════════════════════ */}
                <div className="flex-1 overflow-x-auto min-h-0 -mx-1 px-1">
                    <div className="flex gap-4 h-full min-w-max pb-2">
                        {STAGES.map((stage, colIndex) => {
                            const cfg = STAGE_CFG[stage];
                            const stageBatches = getBatchesByStage(stage);
                            const isOver = dragOverStage === stage;
                            return (
                                <KanbanColumn
                                    key={stage}
                                    stage={stage}
                                    cfg={cfg}
                                    stageBatches={stageBatches}
                                    isOver={isOver}
                                    draggedBatch={draggedBatch}
                                    canDrag={canDrag}
                                    movingBatch={movingBatch}
                                    colIndex={colIndex}
                                    onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }}
                                    onDragLeave={() => setDragOverStage(null)}
                                    onDrop={() => handleDrop(stage)}
                                    onDragStart={setDraggedBatch}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ══ Earnings Modal ══════════════════════════════════════════ */}
            <AnimatePresence>
                {showEarningsInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
                        onClick={() => setShowEarningsInfo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
                            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                        <IndianRupee size={15} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Earnings Breakdown</p>
                                        <p className="text-xs text-gray-400">How your revenue is calculated</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEarningsInfo(false)}
                                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Rate card */}
                                <div
                                    className="flex items-center justify-between p-4 rounded-xl"
                                    style={{ background: 'linear-gradient(135deg, #5F9EA015, #EFF5DF60)' }}
                                >
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Rate per KG</p>
                                        <p className="text-3xl font-bold text-primary-600">₹20</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-0.5">Total Processed</p>
                                        <p className="text-xl font-bold text-gray-800">{totalKg.toLocaleString()} kg</p>
                                    </div>
                                </div>

                                {/* Pipeline steps */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Production Stages
                                    </p>
                                    <div className="space-y-2">
                                        {STAGES.map((s, i) => {
                                            const c = STAGE_CFG[s];
                                            return (
                                                <div key={s} className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                                        style={{ background: c.accent, fontSize: 10 }}
                                                    >
                                                        <span className="text-[9px] font-bold">{i + 1}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-medium flex-1">{s}</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {getBatchesByStage(s).length} batches
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Total row */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Your Total Revenue</p>
                                        <p className="text-xl font-bold text-gray-900">₹{revenue.toLocaleString()}</p>
                                    </div>
                                    <div
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style={{ background: '#5F9EA015', color: '#5F9EA0' }}
                                    >
                                        {batches.length} batches
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default OperatorDashboard;
