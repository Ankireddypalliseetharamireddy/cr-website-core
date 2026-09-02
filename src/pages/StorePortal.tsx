import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/website.css';
import Login from './Login';
import Billing from './Billing';
import Auditing from './Auditing';
import EmployeeHome from './EmployeeHome';
import SalesHistory from './SalesHistory';
import FranchiseDashboard from './FranchiseDashboard';
import {
    LogOut, User, Store, ShoppingCart, ClipboardCheck, Home,
    Receipt, Globe, Menu, X, ChevronRight, Shield
} from 'lucide-react';

export default function StorePortal() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [franchiseId, setFranchiseId] = useState<string>('');
    const [activePage, setActivePage] = useState<'home' | 'billing' | 'auditing' | 'history' | 'dashboard'>(() => {
        return (localStorage.getItem('activePage') as any) || 'home';
    });
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storedFranchise = localStorage.getItem('franchiseId');
        const storedPage = localStorage.getItem('activePage') as any;

        if (storedToken) setToken(storedToken);
        if (storedUser) setUsername(storedUser);
        if (storedRole) setRole(storedRole);
        if (storedFranchise) setFranchiseId(storedFranchise);
        if (storedPage) setActivePage(storedPage);
    }, []);

    const handleNavigate = (page: 'home' | 'billing' | 'auditing' | 'history' | 'dashboard') => {
        setActivePage(page);
        localStorage.setItem('activePage', page);
        setMenuOpen(false);
    };

    const handleLoginSuccess = (userToken: string, userDisplayName: string, userRole: string, userFranchise: string) => {
        setToken(userToken);
        setUsername(userDisplayName);
        setRole(userRole);
        setFranchiseId(userFranchise);
        
        if (userRole === 'CASHIER') {
            handleNavigate('billing');
        } else if (userRole === 'FRANCHISE_ADMIN') {
            handleNavigate('dashboard');
        } else {
            handleNavigate('home');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('franchiseId');
        localStorage.removeItem('activePage');
        setToken(null);
        setUsername('');
        setRole('');
        setFranchiseId('');
        setActivePage('home');
        setMenuOpen(false);
    };

    // If not authenticated, show login page
    if (!token) {
        return (
            <div className="store-portal-root">
                <div style={{ padding: '0.85rem 1.5rem', background: '#0a0b10', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img src="/cavree-emblem-gold.png" alt="Cavree" style={{ height: '24px', width: 'auto' }} />
                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.08em' }}>CAVREE</span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                        <Globe size={15} /> Website &rarr;
                    </button>
                </div>
                <Login onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    const normalizedRole = (role || '').toUpperCase();
    const canAccessBilling = ['CASHIER', 'STORE_MANAGER', 'SALES_EXECUTIVE', 'FRANCHISE_ADMIN', 'SUPER_ADMIN'].includes(normalizedRole) || !role;
    const canAccessAuditing = ['AUDITOR', 'INVENTORY_MANAGER', 'STORE_MANAGER', 'FRANCHISE_ADMIN', 'SUPER_ADMIN'].includes(normalizedRole);
    const canAccessHistory = ['CASHIER', 'STORE_MANAGER', 'AUDITOR', 'FRANCHISE_ADMIN', 'SUPER_ADMIN'].includes(normalizedRole);
    const canAccessDashboard = ['FRANCHISE_ADMIN', 'STORE_MANAGER', 'SUPER_ADMIN'].includes(normalizedRole);

    const formatRoleLabel = (r: string) => {
        if (!r) return 'Store Staff';
        return r.replace(/_/g, ' ');
    };

    return (
        <div className="store-portal-root">
            <div className="app-container">
                {/* Clean Top Navigation Bar with Original Cavree Logo & Hamburger Menu */}
                <header className="navbar">
                    <div className="navbar-header-row">
                        <div className="brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }} onClick={() => handleNavigate('home')}>
                            <img src="/cavree-emblem-gold.png" alt="Cavree Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
                            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, letterSpacing: '0.08em', fontSize: '1.2rem', color: '#D4AF37' }}>CAVREE</span>
                            <span className="badge badge-gold desktop-only" style={{ fontSize: '0.625rem', padding: '0.15rem 0.45rem' }}>
                                {franchiseId || 'Store'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Desktop Quick Role Status */}
                            <div className="user-badge desktop-only" style={{ background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pos-border-gold)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <User size={14} style={{ color: 'var(--pos-gold-primary)' }} />
                                    <span style={{ fontWeight: 600, color: 'var(--pos-text-primary)', fontSize: '0.8125rem' }}>{username}</span>
                                    <span style={{ color: 'var(--pos-gold-light)', fontSize: '0.75rem' }}>({formatRoleLabel(role)})</span>
                                </div>
                            </div>

                            {/* 3-Lines Hamburger Menu Button */}
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setMenuOpen(!menuOpen)}
                                style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 700 }}
                                aria-label="Toggle Navigation Menu"
                            >
                                {menuOpen ? <X size={18} /> : <Menu size={18} />}
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em' }}>MENU</span>
                            </button>
                        </div>
                    </div>

                    {/* Desktop Horizontal Nav Bar (Hidden on Mobile) */}
                    <nav className="navbar-tabs-row desktop-only" style={{ marginTop: '0.5rem' }}>
                        <button
                            className={`btn btn-sm ${activePage === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleNavigate('home')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <Home size={14} />
                            <span>Hub</span>
                        </button>

                        {canAccessBilling && (
                            <button
                                className={`btn btn-sm ${activePage === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('billing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <ShoppingCart size={14} />
                                <span>POS Billing</span>
                            </button>
                        )}

                        {canAccessAuditing && (
                            <button
                                className={`btn btn-sm ${activePage === 'auditing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('auditing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <ClipboardCheck size={14} />
                                <span>Store Audit</span>
                            </button>
                        )}

                        {canAccessHistory && (
                            <button
                                className={`btn btn-sm ${activePage === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('history')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <Receipt size={14} />
                                <span>Sales History</span>
                            </button>
                        )}

                        {canAccessDashboard && (
                            <button
                                className={`btn btn-sm ${activePage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('dashboard')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <Store size={14} />
                                <span>{normalizedRole === 'FRANCHISE_ADMIN' ? 'Franchise Operations' : 'Store Analytics'}</span>
                            </button>
                        )}
                    </nav>
                </header>

                {/* ========================================================================== */}
                {/* SLIDE-OUT 3-LINES HAMBURGER MENU DRAWER (COMPACT & MOBILE-FIT)            */}
                {/* ========================================================================== */}
                {menuOpen && (
                    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }} onClick={() => setMenuOpen(false)}>
                        <div
                            className="modal-content"
                            style={{
                                width: 'min(85vw, 320px)',
                                height: '100dvh',
                                maxHeight: '100dvh',
                                borderRadius: '0',
                                borderLeft: '1px solid var(--pos-border-gold-bright)',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '1rem 1.15rem',
                                overflowY: 'auto',
                                animation: 'slideInRight 0.25s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Drawer Header with Logo and Close */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid var(--pos-border-gold)', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <img src="/cavree-emblem-gold.png" alt="Cavree" style={{ height: '22px', width: 'auto' }} />
                                        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--pos-gold-light)', letterSpacing: '0.05em' }}>
                                            CAVREE STORE
                                        </span>
                                    </div>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)} style={{ padding: '0.25rem 0.45rem' }}>
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Compact Staff Profile Card */}
                                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--pos-border-gold)', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <div style={{ padding: '0.35rem', borderRadius: '50%', background: 'var(--pos-gold-primary)', color: '#000', display: 'flex' }}>
                                            <User size={13} />
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--pos-text-primary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {username}
                                            </div>
                                        </div>
                                        <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', whiteSpace: 'nowrap' }}>
                                            {formatRoleLabel(role)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--pos-text-secondary)', paddingLeft: '0.2rem' }}>
                                        Store: <strong style={{ color: 'var(--pos-gold-light)' }}>{franchiseId || 'Central Branch'}</strong>
                                    </div>
                                </div>

                                {/* Navigation Menu Items (Compact) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <button
                                        className={`btn ${activePage === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleNavigate('home')}
                                        style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Home size={15} />
                                            <span>Store Hub</span>
                                        </div>
                                        <ChevronRight size={13} />
                                    </button>

                                    {canAccessBilling && (
                                        <button
                                            className={`btn ${activePage === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => handleNavigate('billing')}
                                            style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ShoppingCart size={15} />
                                                <span>POS Billing Counter</span>
                                            </div>
                                            <ChevronRight size={13} />
                                        </button>
                                    )}

                                    {canAccessAuditing && (
                                        <button
                                            className={`btn ${activePage === 'auditing' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => handleNavigate('auditing')}
                                            style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ClipboardCheck size={15} />
                                                <span>Store Inventory Audit</span>
                                            </div>
                                            <ChevronRight size={13} />
                                        </button>
                                    )}

                                    {canAccessHistory && (
                                        <button
                                            className={`btn ${activePage === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => handleNavigate('history')}
                                            style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Receipt size={15} />
                                                <span>Sales &amp; Invoices</span>
                                            </div>
                                            <ChevronRight size={13} />
                                        </button>
                                    )}

                                    {canAccessDashboard && (
                                        <button
                                            className={`btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => handleNavigate('dashboard')}
                                            style={{ justifyContent: 'space-between', padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Store size={15} />
                                                <span>Franchise Operations</span>
                                            </div>
                                            <ChevronRight size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Footer Actions (Compact) */}
                            <div style={{ borderTop: '1px solid var(--pos-border-gold)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate('/')}
                                    style={{ justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.8125rem' }}
                                >
                                    <Globe size={14} /> View Public Website
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleLogout}
                                    style={{ justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.8125rem' }}
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Layout based on user role and active page */}
                <main style={{ flexGrow: 1 }}>
                    {activePage === 'home' && (
                        normalizedRole === 'FRANCHISE_ADMIN' ? (
                            <FranchiseDashboard
                                onNavigateToBilling={() => handleNavigate('billing')}
                                onNavigateToAudit={() => handleNavigate('auditing')}
                            />
                        ) : (
                            <EmployeeHome onNavigate={(p) => handleNavigate(p)} userRole={role} />
                        )
                    )}
                    {activePage === 'billing' && <Billing onBack={() => handleNavigate('home')} />}
                    {activePage === 'auditing' && <Auditing onBack={() => handleNavigate('home')} />}
                    {activePage === 'history' && <SalesHistory onBack={() => handleNavigate('home')} />}
                    {activePage === 'dashboard' && (
                        <FranchiseDashboard
                            onNavigateToBilling={() => handleNavigate('billing')}
                            onNavigateToAudit={() => handleNavigate('auditing')}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
