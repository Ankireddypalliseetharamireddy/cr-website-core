import React, { useState, useEffect } from 'react';
import { Store, User, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { authService, catalogService } from '../services/api';
import '../styles/website.css';

interface Franchise {
    id: number;
    name: string;
    location: string;
}

interface LoginProps {
    onLoginSuccess: (token: string, username: string, role: string, franchiseId: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
    const [selectedFranchiseName, setSelectedFranchiseName] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFranchises, setLoadingFranchises] = useState(true);

    // Load dynamic list of franchises for the dropdown
    useEffect(() => {
        const fetchFranchises = async () => {
            setLoadingFranchises(true);
            try {
                const res = await catalogService.getFranchises();
                setFranchises(res.data);
                if (res.data && res.data.length > 0) {
                    setSelectedFranchiseId(String(res.data[0].id));
                    setSelectedFranchiseName(res.data[0].name);
                }
            } catch (err) {
                console.error("Failed to load franchises list for login", err);
            } finally {
                setLoadingFranchises(false);
            }
        };
        fetchFranchises();
    }, []);

    const handleFranchiseChange = (idStr: string) => {
        setSelectedFranchiseId(idStr);
        const match = franchises.find(f => String(f.id) === idStr);
        if (match) {
            setSelectedFranchiseName(match.name);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const usernamePayload = userId.trim();
            
            const res = await authService.login({
                username: usernamePayload,
                password: password.trim()
            });

            const { token, username, role } = res.data;

            // Security context verification based on selected tab role
            if (loginType === 'admin' && role !== 'FRANCHISE_ADMIN' && role !== 'SUPER_ADMIN') {
                throw new Error("Access denied. This login is reserved for Franchise Admins.");
            }

            const STORE_ROLES = [
                'STORE_MANAGER', 'CASHIER', 'INVENTORY_MANAGER',
                'SALES_EXECUTIVE', 'AUDITOR', 'DELIVERY_STAFF', 'FRANCHISE_EMPLOYEE'
            ];

            if (loginType === 'employee' && !STORE_ROLES.includes(role)) {
                throw new Error("Access denied. Registered username does not belong to a Store Employee.");
            }

            const storeIdentifier = selectedFranchiseName || selectedFranchiseId || 'Store';

            // Save session credentials
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            localStorage.setItem('role', role);
            localStorage.setItem('franchiseId', storeIdentifier);

            onLoginSuccess(token, username, role, storeIdentifier);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || "Authentication failed. Verify credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                        <Store size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cavree Portal</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to access store operations &amp; POS</p>
                </div>

                {/* Login Role Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <button
                        type="button"
                        onClick={() => { setLoginType('employee'); setError(''); }}
                        style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '6px',
                            background: loginType === 'employee' ? 'var(--accent-blue)' : 'transparent',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.8125rem'
                        }}
                    >
                        Store Employee
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginType('admin'); setError(''); }}
                        style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '6px',
                            background: loginType === 'admin' ? 'var(--accent-blue)' : 'transparent',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.8125rem'
                        }}
                    >
                        Franchise Admin
                    </button>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                    {/* Dynamic Franchise Store Dropdown */}
                    <div className="form-group">
                        <label className="form-label">
                            {loginType === 'admin' ? 'Target Franchise Store' : 'Select Franchise Store *'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            {loadingFranchises ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <RefreshCw size={14} className="spin" /> Loading franchise stores...
                                </div>
                            ) : (
                                <select
                                    className="form-input form-select"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={selectedFranchiseId}
                                    onChange={(e) => handleFranchiseChange(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Select Franchise Store --</option>
                                    {franchises.length > 0 ? (
                                        franchises.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name} ({f.location})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="1">Central Store Node</option>
                                    )}
                                </select>
                            )}
                            <Store size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* Employee Username / ID / Admin ID Field */}
                    <div className="form-group">
                        <label className="form-label">
                            {loginType === 'admin' ? 'Admin Username or Email *' : 'Employee ID, Username or Email *'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder={loginType === 'admin' ? 'e.g. BL_1001 or admin@store.com' : 'e.g. BL-CSH-1001 or ramesh@store.com'}
                                required
                            />
                            <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                required
                            />
                            <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <span>Sign In to Portal</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
