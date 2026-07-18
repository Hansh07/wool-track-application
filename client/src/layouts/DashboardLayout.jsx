import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, ClipboardCheck, ShoppingCart,
    Settings, LogOut, Menu, X, ShoppingBag,
    Activity, ChevronLeft, ChevronRight, BarChart2, Award,
    Gavel, Truck, Warehouse, Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Loader } from '../components/ui/Loader';

const SidebarItem = ({ to, icon: Icon, label, onClick, isCollapsed }) => (
    <NavLink
        to={to}
        onClick={onClick}
        title={isCollapsed ? label : ''}
        className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden whitespace-nowrap text-sm font-medium',
            isActive
                ? 'bg-white text-primary-500 shadow-sm'
                : 'text-white/70 hover:bg-primary-600 hover:text-white'
        )}
    >
        {({ isActive }) => (
            <>
                <Icon
                    size={20}
                    className={cn(
                        'min-w-[20px] transition-colors flex-shrink-0',
                        isActive ? 'text-primary-500' : 'text-white/70 group-hover:text-white'
                    )}
                />
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        {label}
                    </motion.span>
                )}
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-5 bg-accent rounded-r-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                )}
            </>
        )}
    </NavLink>
);

const DashboardLayout = ({ children, role }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getNavItems = () => {
        const common = [{ to: '/profile', icon: Settings, label: 'Settings' }];
        switch (user?.role || role) {
            case 'FARMER':
                return [
                    { to: '/', icon: LayoutDashboard, label: 'Overview' },
                    { to: '/create-batch', icon: Package, label: 'Create Batch' },
                    { to: '/batches', icon: ClipboardCheck, label: 'My Batches' },
                    { to: '/quality-results', icon: BarChart2, label: 'Quality Results' },
                    { to: '/auction', icon: Gavel, label: 'Auctions' },
                    { to: '/logistics', icon: Truck, label: 'Logistics' },
                    { to: '/inventory', icon: Warehouse, label: 'Inventory' },
                    { to: '/esg', icon: Leaf, label: 'ESG' },
                    ...common,
                ];
            case 'QUALITY_INSPECTOR':
                return [
                    { to: '/', icon: ClipboardCheck, label: 'Lab Hub' },
                    { to: '/batches', icon: Package, label: 'All Batches' },
                    { to: '/quality/analytics', icon: BarChart2, label: 'Analytics' },
                    { to: '/certificates', icon: Award, label: 'Certificates' },
                    { to: '/esg', icon: Leaf, label: 'ESG' },
                    ...common,
                ];
            case 'BUYER':
                return [
                    { to: '/', icon: ShoppingBag, label: 'Marketplace' },
                    { to: '/orders', icon: ShoppingCart, label: 'My Orders' },
                    { to: '/auction', icon: Gavel, label: 'Auctions' },
                    { to: '/logistics', icon: Truck, label: 'Logistics' },
                    { to: '/certificates', icon: Award, label: 'Certificates' },
                    { to: '/esg', icon: Leaf, label: 'ESG' },
                    ...common,
                ];
            case 'MILL_OPERATOR':
                return [
                    { to: '/', icon: LayoutDashboard, label: 'Floor Ops' },
                    { to: '/batches', icon: Package, label: 'All Batches' },
                    { to: '/monitoring', icon: Activity, label: 'Monitoring' },
                    { to: '/inventory', icon: Warehouse, label: 'Inventory' },
                    { to: '/logistics', icon: Truck, label: 'Logistics' },
                    { to: '/auction', icon: Gavel, label: 'Auctions' },
                    ...common,
                ];
            case 'ADMIN':
                return [
                    { to: '/admin', icon: Activity, label: 'Admin Panel' },
                    { to: '/batches', icon: Package, label: 'All Batches' },
                    { to: '/monitoring', icon: Activity, label: 'Monitoring' },
                    { to: '/auction', icon: Gavel, label: 'Auctions' },
                    { to: '/logistics', icon: Truck, label: 'Logistics' },
                    { to: '/inventory', icon: Warehouse, label: 'Inventory' },
                    { to: '/certificates', icon: Award, label: 'Certificates' },
                    { to: '/esg', icon: Leaf, label: 'ESG' },
                    ...common,
                ];
            default:
                return [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }, ...common];
        }
    };

    const navItems = getNavItems();

    if (!user) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader />
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex overflow-hidden relative">

            {/* Mobile overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar ── */}
            <motion.aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full',
                    'bg-primary-500 border-r border-primary-600 overflow-hidden',
                    'shadow-[2px_0_16px_rgba(16,60,31,0.15)]',
                    isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'px-4 py-5 flex items-center border-b border-gray-100 flex-shrink-0',
                    isCollapsed ? 'justify-center' : 'justify-between'
                )}>
                    {!isCollapsed ? (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="flex items-center gap-2.5"
                        >
                            <img src={logo} alt="Wool Track" className="h-10 w-auto object-contain drop-shadow-sm brightness-200" />
                            <span className="font-display font-bold text-lg text-white tracking-tight">Wool Track</span>
                        </motion.div>
                    ) : (
                        <img src={logo} alt="Logo" className="h-9 w-auto object-contain" />
                    )}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white/50 hover:text-white/90 p-1 rounded-lg hover:bg-primary-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    {!isCollapsed && (
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-3">Navigation</p>
                    )}
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            onClick={() => setSidebarOpen(false)}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-primary-600 space-y-2 relative flex-shrink-0">
                    {/* Collapse toggle */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex absolute -right-3.5 top-[-14px] w-7 h-7 bg-primary-500 border border-primary-600 rounded-full items-center justify-center text-background/70 hover:text-background hover:border-background z-50 transition-colors shadow-sm"
                    >
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>

                    {/* User chip */}
                    <div className={cn(
                        'flex items-center gap-2.5 p-2.5 rounded-xl bg-primary-600 border border-primary-400 transition-all',
                        isCollapsed && 'justify-center bg-transparent border-0 p-1'
                    )}>
                        <div className="h-8 w-8 min-w-[32px] rounded-full bg-background flex items-center justify-center text-primary-500 flex-shrink-0 font-bold text-sm border border-primary-400">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-white/70 truncate capitalize">{user?.role?.toLowerCase().replace(/_/g, ' ')}</p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'Logout' : ''}
                        className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors',
                            isCollapsed && 'justify-center px-2'
                        )}
                    >
                        <LogOut size={16} />
                        {!isCollapsed && 'Logout'}
                    </button>
                </div>
            </motion.aside>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top header */}
                <header className="h-16 min-h-[64px] border-b border-primary-600 bg-primary-500/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 flex-shrink-0 shadow-sm relative">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-background/70 hover:text-background rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 absolute left-1/2 -translate-x-1/2">
                        <img src={logo} alt="Wool Track" className="h-8 w-auto object-contain" />
                        <span className="font-display font-bold text-base text-background">Wool Track</span>
                    </div>

                    {/* Desktop greeting */}
                    <div className="hidden lg:flex flex-1 items-center">
                        <span className="text-sm text-white/70">
                            Welcome back,{' '}
                            <span className="text-white font-semibold">{user?.name}</span>
                        </span>
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-primary-400 flex items-center justify-center text-sm font-bold text-primary-500">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
