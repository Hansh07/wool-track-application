import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, AlertCircle, ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 + 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', twoFactorCode: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState('');

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { email: form.email, password: form.password };
            if (form.twoFactorCode) payload.twoFactorToken = form.twoFactorCode;
            const res = await axiosClient.post('/api/auth/login', payload);
            if (res.data.requiresTwoFactor) { setRequiresTwoFactor(true); setLoading(false); return; }
            login(res.data);
            navigate('/');
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.errors?.[0]?.message || data?.message || 'Login failed';
            setError(msg);
        } finally { setLoading(false); }
    };

    const inputClass = (name) =>
        `flex h-12 w-full rounded-xl border bg-white pl-11 pr-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 ${focused === name
            ? 'border-primary-500 shadow-[0_0_0_3px_rgba(165,153,201,0.15)] bg-white'
            : 'border-gray-300 hover:border-gray-400'
        }`;

    return (
        <AuthLayout
            title={requiresTwoFactor ? 'Two-Factor Auth' : t('auth.login')}
            subtitle={requiresTwoFactor ? 'Enter the 6-digit code from your authenticator app' : 'Sign in to your Wool Track account'}
        >
            <div className="glass-ultra rounded-2xl p-7 space-y-5">
                {/* Error banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2.5"
                    >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!requiresTwoFactor ? (
                        <>
                            {/* Email */}
                            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="show" className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{t('auth.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        required
                                        placeholder="you@company.com"
                                        className={inputClass('email')}
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="show" className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{t('auth.password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        required
                                        placeholder="Min 8 characters"
                                        className={`${inputClass('password')} pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center gap-2.5 p-3.5 bg-primary-50 rounded-xl border border-primary-200">
                                <Shield size={17} className="text-primary-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-primary-700 font-semibold">2FA Required</p>
                                    <p className="text-xs text-gray-500">Open your authenticator app</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{t('auth.twoFactor')}</label>
                                <input
                                    name="twoFactorCode"
                                    type="text"
                                    value={form.twoFactorCode}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('2fa')}
                                    onBlur={() => setFocused('')}
                                    required
                                    placeholder="000000"
                                    className={`${inputClass('2fa')} pl-4 tracking-[0.4em] text-center text-lg font-bold`}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Submit */}
                    <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="show">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-neon w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: loading ? 'rgba(31,97,49,0.5)' : 'linear-gradient(135deg, #1F6131, #13401F)',
                                color: '#fff',
                                boxShadow: '0 4px 20px rgba(31,97,49,0.25)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    {requiresTwoFactor ? 'Verify Code' : t('auth.login')}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </motion.div>
                </form>

                {/* Footer link */}
                <motion.div
                    custom={3} variants={fieldVariants} initial="hidden" animate="show"
                    className="text-center text-sm text-gray-500 pt-1 border-t border-gray-100"
                >
                    {t('auth.noAccount')}{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                        {t('auth.register')}
                    </Link>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
