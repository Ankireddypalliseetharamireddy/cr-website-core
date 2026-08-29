import React, { useState, useEffect } from 'react';
import { Store, User, Lock, ArrowRight, Mail } from 'lucide-react';
import { authService, catalogService } from '../services/api';
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
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Registration states
    const [isRegistering, setIsRegistering] = useState(false);
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regFranchiseId, setRegFranchiseId] = useState('');
    const [franchises, setFranchises] = useState<any[]>([]);

    useEffect(() => {
        // Load franchises list for registration dropdown
        const loadFranchises = async () => {
            try {
                const res = await catalogService.getFranchises();
                setFranchises(res.data);
                if (res.data.length > 0) {
                    setRegFranchiseId(res.data[0].id.toString());
                }
            } catch (err) {
                console.error("Failed to load franchises list", err);
            }
        };
        loadFranchises();
    }, []);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
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

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await authService.register({
                username: regUsername,
                email: regEmail,
                password: regPassword,
                franchise_id: parseInt(regFranchiseId)
            });

            const generatedEmployeeId = res.data.employee_id;

            setSuccessMessage(`Registration successful! Generated Employee ID: ${generatedEmployeeId}. Please ask your Franchise Admin to approve your account before signing in.`);
            
            // Switch back to login view and prefill credentials
            setIsRegistering(false);
            setLoginType('employee');
            setUserId(generatedEmployeeId);
            
            // Clear inputs
            setRegUsername('');
            setRegEmail('');
            setRegPassword('');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Registration failed. Verify inputs.");
        } finally {
            setLoading(false);
        }
    };

    if (isRegistering) {
        return (
            <div className="login-container">
                <div className="glass-panel login-card" style={{ maxWidth: '460px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>
                            <Store size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cashier Registration</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Create your store cashier account</p>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegisterSubmit}>
                        <div className="form-group">
                            <label className="form-label">Select Franchise Store Branch</label>
                            <select 
                                className="form-input form-select" 
                                value={regFranchiseId} 
                                onChange={(e) => setRegFranchiseId(e.target.value)} 
                                required
                            >
                                {franchises.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Cashier Username / Name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    placeholder="e.g. john (System will convert to TI_EM_1001)"
                                    required
                                />
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="e.g. john@store.com"
                                    required
                                />
                                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                    required
                                />
                                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                            {loading ? 'Submitting Registration...' : 'Register Employee Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <span 
                            onClick={() => { setIsRegistering(false); setError(''); }} 
                            style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                        >
                            Back to Sign In
                        </span>
                    </div>
                </div>
            </div>
        );
    }

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

                {successMessage && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', padding: '0.75rem', borderRadius: '8px', color: '#34d399', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit}>
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
                                placeholder={loginType === 'admin' ? 'e.g. TI_1001' : 'e.g. Tirupati'}
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
                                    placeholder="e.g. TI_EM_1001"
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

                {loginType === 'employee' && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        New cashier?{' '}
                        <span 
                            onClick={() => { setIsRegistering(true); setError(''); setSuccessMessage(''); }} 
                            style={{ color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                        >
                            Register Employee Account
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
