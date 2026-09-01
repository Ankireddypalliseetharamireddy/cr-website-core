import { useState, useEffect } from 'react';
import './styles/website.css';
import Login from './pages/Login';
import Billing from './pages/Billing';
import Auditing from './pages/Auditing';
import EmployeeHome from './pages/EmployeeHome';
import FranchiseDashboard from './pages/FranchiseDashboard';
import { LogOut, User, Store, ShoppingCart, ClipboardCheck, Home, Receipt } from 'lucide-react';

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [franchiseId, setFranchiseId] = useState<string>('');
    const [activePage, setActivePage] = useState<'home' | 'billing' | 'auditing' | 'history'>(() => {
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

    const handleNavigate = (page: 'home' | 'billing' | 'auditing' | 'history') => {
        setActivePage(page);
        localStorage.setItem('activePage', page);
    };

    const handleLoginSuccess = (userToken: string, userDisplayName: string, userRole: string, userFranchise: string) => {
        setToken(userToken);
        setUsername(userDisplayName);
        setRole(userRole);
        setFranchiseId(userFranchise);
        handleNavigate('home');
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

    // If not authenticated, force login screen
    if (!token) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const isAdmin = role === 'FRANCHISE_ADMIN' || role === 'SUPER_ADMIN';

    return (
        <div className="app-container">
            {/* Top Navigation Bar */}
            <header className="navbar" style={{ padding: '0.75rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="brand" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('home')}>
                        <Store size={22} style={{ color: 'var(--accent-blue)' }} />
                        <span>CAVREE STORES</span>
                        <span className="badge badge-purple" style={{ fontSize: '0.625rem', padding: '0.15rem 0.35rem', marginLeft: '0.5rem' }}>
                            {isAdmin ? 'ADMIN OVERSIGHT' : 'STORE POS TERMINAL'}
                        </span>
                    </div>

                    {/* Staff Navigation Tabs */}
                    {!isAdmin && (
                        <nav style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                                className={`btn btn-sm ${activePage === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('home')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <Home size={14} />
                                <span>Hub</span>
                            </button>
                            <button
                                className={`btn btn-sm ${activePage === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('billing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <ShoppingCart size={14} />
                                <span>Billing POS</span>
                            </button>
                            <button
                                className={`btn btn-sm ${activePage === 'auditing' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('auditing')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <ClipboardCheck size={14} />
                                <span>Store Audit</span>
                            </button>
                            <button
                                className={`btn btn-sm ${activePage === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleNavigate('history')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                                <Receipt size={14} />
                                <span>Sales History</span>
                            </button>
                        </nav>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                    {/* User Metadata Status */}
                    <div className="user-badge" style={{ background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <User size={14} style={{ color: 'var(--accent-blue)' }} />
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{username}</span>
                        </div>
                        {franchiseId && (
                            <>
                                <span style={{ color: 'var(--border-color)' }}>&bull;</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                    <Store size={12} />
                                    <span>{franchiseId}</span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Log Out Action */}
                    <button className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={handleLogout}>
                        <LogOut size={13} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Main Content Layout based on user role and active page */}
            <main style={{ flexGrow: 1 }}>
                {isAdmin ? (
                    <FranchiseDashboard />
                ) : (
                    <>
                        {activePage === 'home' && <EmployeeHome onNavigate={(p) => handleNavigate(p)} userRole={role} />}
                        {activePage === 'billing' && <Billing />}
                        {activePage === 'auditing' && <Auditing onBack={() => handleNavigate('home')} />}
                        {activePage === 'history' && <EmployeeHome onNavigate={(p) => handleNavigate(p)} userRole={role} />}
                    </>
                )}
            </main>
        </div>
    );
}
