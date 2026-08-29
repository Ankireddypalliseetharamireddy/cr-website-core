import { useState, useEffect } from 'react';
import './styles/website.css';
import Login from './pages/Login';
import Billing from './pages/Billing';
import FranchiseDashboard from './pages/FranchiseDashboard';
import { LogOut, User, Store } from 'lucide-react';

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [franchiseId, setFranchiseId] = useState<string>('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storedFranchise = localStorage.getItem('franchiseId');

        if (storedToken) setToken(storedToken);
        if (storedUser) setUsername(storedUser);
        if (storedRole) setRole(storedRole);
        if (storedFranchise) setFranchiseId(storedFranchise);
    }, []);

    const handleLoginSuccess = (userToken: string, userDisplayName: string, userRole: string, userFranchise: string) => {
        setToken(userToken);
        setUsername(userDisplayName);
        setRole(userRole);
        setFranchiseId(userFranchise);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('franchiseId');
        setToken(null);
        setUsername('');
        setRole('');
        setFranchiseId('');
    };

    // If not authenticated, force login screen
    if (!token) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const isAdmin = role === 'FRANCHISE_ADMIN' || role === 'SUPER_ADMIN';

    return (
        <div className="app-container">
            {/* Top Navigation Bar */}
            <header className="navbar">
                <div className="brand">
                    <Store size={22} style={{ color: 'var(--accent-blue)' }} />
                    <span>CAVREE STORES</span>
                    <span className="badge badge-purple" style={{ fontSize: '0.625rem', padding: '0.15rem 0.35rem', marginLeft: '0.5rem' }}>
                        {isAdmin ? 'ADMIN PORTAL' : 'CASHIER TERMINAL'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* User Metadata Status */}
                    <div className="user-badge">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={14} style={{ color: 'var(--text-secondary)' }} />
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{username}</span>
                        </div>
                        {franchiseId && (
                            <>
                                <span style={{ color: 'var(--border-color)' }}>&bull;</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Store size={12} />
                                    <span>Store: {franchiseId}</span>
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

            {/* Main Content Layout based on user role */}
            <main style={{ flexGrow: 1 }}>
                {isAdmin ? (
                    <FranchiseDashboard />
                ) : (
                    <Billing />
                )}
            </main>
        </div>
    );
}
