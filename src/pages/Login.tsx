import React, { useState } from 'react';
import { Store, User, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';
import '../styles/website.css';

interface LoginProps {
    onLoginSuccess: (token: string, username: string, role: string, franchiseId: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
    const [franchiseId, setFranchiseId] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Mapping values for the standard auth endpoint
            const usernamePayload = loginType === 'admin' ? franchiseId : userId;
            
            const res = await authService.login({
                username: usernamePayload,
                password: password
            });

            const { token, username, role } = res.data;

            // Security context verification based on selected tab role
            if (loginType === 'admin' && role !== 'FRANCHISE_ADMIN' && role !== 'SUPER_ADMIN') {
                throw new Error("Access denied. This login is reserved for Franchise Admins.");
            }

            if (loginType === 'employee' && role !== 'FRANCHISE_EMPLOYEE' && role !== 'FRANCHISE_STAFF') {
                throw new Error("Access denied. Registered username does not belong to a Store Employee.");
            }

            // Save session credentials
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            localStorage.setItem('role', role);
            localStorage.setItem('franchiseId', franchiseId);

            onLoginSuccess(token, username, role, franchiseId);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || "Authentication failed. Verify inputs.");
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
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to access store operations</p>
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

                <form onSubmit={handleSubmit}>
                    {/* Franchise ID Field (Required for both) */}
                    <div className="form-group">
                        <label className="form-label">
                            {loginType === 'admin' ? 'Franchise Admin Username / ID' : 'Franchise Store Name / ID'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={franchiseId}
                                onChange={(e) => setFranchiseId(e.target.value)}
                                placeholder={loginType === 'admin' ? 'e.g. blr_admin' : 'e.g. Bangalore Store'}
                                required
                            />
                            <Store size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* Employee ID Field (Only for Employees) */}
                    {loginType === 'employee' && (
                        <div className="form-group">
                            <label className="form-label">Employee Username / ID</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="e.g. cashier_john"
                                    required
                                />
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    )}

                    {/* Password Field */}
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Password</label>
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
