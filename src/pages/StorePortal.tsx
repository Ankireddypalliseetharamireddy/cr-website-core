import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/website.css';
import Login from './Login';
import Billing from './Billing';
import Auditing from './Auditing';
import EmployeeHome from './EmployeeHome';
import FranchiseDashboard from './FranchiseDashboard';
import { LogOut, User, Store, ShoppingCart, ClipboardCheck, Home, Receipt, Globe, BarChart2 } from 'lucide-react';

export default function StorePortal() {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [franchiseId, setFranchiseId] = useState<string>('');
    const [activePage, setActivePage] = useState<'home' | 'billing' | 'auditing' | 'history' | 'dashboard'>(() => {
        return (localStorage.getItem('activePage') as any) || 'home';
    });

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
    };

    const handleLoginSuccess = (userToken: string, userDisplayName: string, userRole: string, userFranchise: string) => {
        setToken(userToken);
        setUsername(userDisplayName);
        setRole(userRole);
        setFranchiseId(userFranchise);
        
        // If Cashier logs in, default straight to Billing POS or Hub
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
    };

    // If not authenticated, show login page
    if (!token) {
        return (
            <div className="store-portal-root">
                <div style={{ padding: '1rem 1.5rem', background: '#0a0b10', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                        <Globe size={16} /> &larr; Back to Public Website
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Cavree POS &amp; Franchise Access</span>
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
                {/* Top Navigation Bar */}
                <header className="navbar">
                    <div className="navbar-header-row">
                        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('home')}>
                            <Store size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                            <span>CAVREE STORES</span>
                            <span className="badge badge-gold" style={{ fontSize: '0.625rem', padding: '0.15rem 0.45rem', marginLeft: '0.35rem' }}>
                                {formatRoleLabel(role)}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Link back to public website */}
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                                title="View Public Website"
                            >
                                <Globe size={13} />
                                <span className="hidden sm:inline">Website</span>
                            </button>

                            {/* User Metadata Status */}
                            <div className="user-badge" style={{ background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--pos-border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <User size={13} style={{ color: 'var(--pos-gold-primary)' }} />
                                    <span style={{ fontWeight: 600, color: 'var(--pos-text-primary)', fontSize: '0.8125rem' }}>{username}</span>
                                    {franchiseId && (
                                        <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                                            &bull; {franchiseId}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Log Out Action */}
                            <button className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.6rem' }} onClick={handleLogout}>
                                <LogOut size={13} />
                                <span style={{ fontSize: '0.75rem' }}>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Role-Based Navigation Tabs Row */}
                    <nav className="navbar-tabs-row">
                        <button
                            className={`btn btn-sm ${activePage === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleNavigate('home')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                        >
                            <Home size={14} />
                            <span>Hub</span>
                        </button>

                        {canAccessBilling && (
                            <button
                                className={`btn btn-sm ${activePage === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('billing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                            >
                                <ShoppingCart size={14} />
                                <span>Billing POS</span>
                            </button>
                        )}

                        {canAccessAuditing && (
                            <button
                                className={`btn btn-sm ${activePage === 'auditing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('auditing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                            >
                                <ClipboardCheck size={14} />
                                <span>Store Audit</span>
                            </button>
                        )}

                        {canAccessHistory && (
                            <button
                                className={`btn btn-sm ${activePage === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('history')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                            >
                                <Receipt size={14} />
                                <span>Sales History</span>
                            </button>
                        )}

                        {canAccessDashboard && (
                            <button
                                className={`btn btn-sm ${activePage === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('dashboard')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                            >
                                <Store size={14} />
                                <span>{normalizedRole === 'FRANCHISE_ADMIN' ? 'Franchise Operations' : 'Store Analytics'}</span>
                            </button>
                        )}
                    </nav>
                </header>

                {/* Main Content Layout based on user role and active page */}
                <main style={{ flexGrow: 1 }}>
                    {activePage === 'home' && <EmployeeHome onNavigate={(p) => handleNavigate(p)} userRole={role} />}
                    {activePage === 'billing' && <Billing />}
                    {activePage === 'auditing' && <Auditing onBack={() => handleNavigate('home')} />}
                    {activePage === 'history' && <EmployeeHome onNavigate={(p) => handleNavigate(p)} userRole={role} />}
                    {activePage === 'dashboard' && <FranchiseDashboard />}
                </main>
            </div>
        </div>
    );
}
