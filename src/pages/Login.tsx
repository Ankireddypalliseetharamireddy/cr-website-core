import { useState, useEffect } from 'react';
import { Store, User, Lock, ArrowRight, RefreshCw, KeyRound, ShieldCheck, Mail, CheckCircle, X } from 'lucide-react';
import { authService, catalogService } from '../services/api';
import '../styles/website.css';

interface Franchise {
    id: number;
    name: string;
    location: string;
}

interface StoreEmployee {
    id: number;
    employee_id: string;
    username: string;
    full_name: string;
    role: string;
    role_name: string;
}

interface LoginProps {
    onLoginSuccess: (token: string, username: string, role: string, franchiseId: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
    const [selectedFranchiseName, setSelectedFranchiseName] = useState('');
    
    // Store Employees List for Dropdown
    const [employees, setEmployees] = useState<StoreEmployee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Admin Username
    const [adminUsername, setAdminUsername] = useState('');

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingFranchises, setLoadingFranchises] = useState(true);

    // Forgot Password Modal States
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
    const [forgotIdentifier, setForgotIdentifier] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [forgotNewPass, setForgotNewPass] = useState('');
    const [forgotConfirmPass, setForgotConfirmPass] = useState('');
    const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    // 1. Load dynamic list of franchises for the dropdown on mount
    useEffect(() => {
        const fetchFranchises = async () => {
            setLoadingFranchises(true);
            try {
                const res = await catalogService.getFranchises();
                setFranchises(res.data);
                if (res.data && res.data.length > 0) {
                    const firstStore = res.data[0];
                    setSelectedFranchiseId(String(firstStore.id));
                    setSelectedFranchiseName(firstStore.name);
                }
            } catch (err) {
                console.error("Failed to load franchises list", err);
            } finally {
                setLoadingFranchises(false);
            }
        };
        fetchFranchises();
    }, []);

    // 2. Whenever selected franchise changes, load its active employees
    useEffect(() => {
        if (!selectedFranchiseId) {
            setEmployees([]);
            setSelectedEmployeeId('');
            return;
        }

        const fetchEmployees = async () => {
            setLoadingEmployees(true);
            try {
                const res = await catalogService.getFranchiseEmployees(Number(selectedFranchiseId));
                setEmployees(res.data);
                if (res.data && res.data.length > 0) {
                    // Preselect first employee
                    setSelectedEmployeeId(res.data[0].employee_id || res.data[0].username);
                } else {
                    setSelectedEmployeeId('');
                }
            } catch (err) {
                console.error("Failed to load store employees", err);
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, [selectedFranchiseId]);

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

        const loginUser = loginType === 'admin' ? adminUsername.trim() : selectedEmployeeId.trim();

        if (!loginUser) {
            setError(loginType === 'admin' ? 'Please enter Admin username.' : 'Please select an employee from the dropdown.');
            return;
        }

        if (!password) {
            setError('Please enter your password.');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.login({
                username: loginUser,
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
                throw new Error("Access denied. Selected account does not belong to a store staff role.");
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
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
                        Store Staff
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
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.75rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                    {/* 1. Franchise Store Dropdown */}
                    <div className="form-group">
                        <label className="form-label">
                            Select Franchise Store *
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
                                    {franchises.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.location})
                                        </option>
                                    ))}
                                </select>
                            )}
                            <Store size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* 2. Employee Dropdown (for Store Staff) OR Admin ID input */}
                    {loginType === 'employee' ? (
                        <div className="form-group">
                            <label className="form-label">
                                Select Employee ID / Staff Name *
                            </label>
                            <div style={{ position: 'relative' }}>
                                {loadingEmployees ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        <RefreshCw size={14} className="spin" /> Loading staff accounts...
                                    </div>
                                ) : employees.length > 0 ? (
                                    <select
                                        className="form-input form-select"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={selectedEmployeeId}
                                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>-- Select Your Employee ID --</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.employee_id || emp.username}>
                                                {emp.employee_id} — {emp.full_name} ({emp.role_name})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                        No active staff registered for this store. Please register employees in the Super Admin portal.
                                    </div>
                                )}
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">
                                Franchise Admin Username or Email *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={adminUsername}
                                    onChange={(e) => setAdminUsername(e.target.value)}
                                    placeholder="e.g. BL_1001 or admin@store.com"
                                    required
                                />
                                <ShieldCheck size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>
                    )}

                    {/* 3. Password Input */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
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

                    {/* Forgot Password Trigger Link */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForgotModal(true);
                                setForgotStep(1);
                                setForgotError('');
                                setForgotSuccess('');
                                setForgotIdentifier(selectedEmployeeId || adminUsername || '');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-blue)',
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: 0
                            }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem' }}
                        disabled={loading || (loginType === 'employee' && employees.length === 0)}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                <KeyRound size={16} />
                                <span>Sign In to Portal</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* ============================================================ */}
            {/* FORGOT PASSWORD MODAL VIA SMTP EMAIL                         */}
            {/* ============================================================ */}
            {showForgotModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={18} style={{ color: 'var(--accent-blue)' }} />
                                Reset Account Password
                            </h3>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setShowForgotModal(false)}
                                style={{ padding: '0.3rem 0.5rem' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {forgotError && (
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#f87171', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                                {forgotError}
                            </div>
                        )}

                        {forgotSuccess && (
                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#34d399', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                                {forgotSuccess}
                            </div>
                        )}

                        {/* STEP 1: Enter Username / Email */}
                        {forgotStep === 1 && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!forgotIdentifier.trim()) {
                                    setForgotError('Please enter your username, email, or employee ID.');
                                    return;
                                }
                                setForgotLoading(true);
                                setForgotError('');
                                try {
                                    const res = await authService.forgotPassword(forgotIdentifier.trim());
                                    setForgotMaskedEmail(res.data.masked_email || res.data.email || 'your registered email');
                                    setForgotSuccess(`Verification code sent to ${res.data.masked_email || 'your email'} via SMTP!`);
                                    setForgotStep(2);
                                } catch (err: any) {
                                    setForgotError(err.response?.data?.error || 'Failed to send reset code. Please verify account details.');
                                } finally {
                                    setForgotLoading(false);
                                }
                            }}>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                    Enter your Employee ID, Username, or registered Email. We will send a 6-digit verification code to your email.
                                </p>

                                <div className="form-group">
                                    <label className="form-label">Employee ID / Email / Username</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            placeholder="e.g. BL_1001 or cashier@store.com"
                                            value={forgotIdentifier}
                                            onChange={(e) => setForgotIdentifier(e.target.value)}
                                            required
                                        />
                                        <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: 'var(--text-secondary)' }} />
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowForgotModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: Enter 6-Digit OTP & New Password */}
                        {forgotStep === 2 && (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
                                    setForgotError('Please enter the 6-digit verification code sent to your email.');
                                    return;
                                }
                                if (forgotNewPass.length < 6) {
                                    setForgotError('New password must be at least 6 characters.');
                                    return;
                                }
                                if (forgotNewPass !== forgotConfirmPass) {
                                    setForgotError('Passwords do not match. Please re-enter.');
                                    return;
                                }
                                setForgotLoading(true);
                                setForgotError('');
                                try {
                                    await authService.resetPassword({
                                        identifier: forgotIdentifier.trim(),
                                        otp_code: forgotOtp.trim(),
                                        new_password: forgotNewPass
                                    });
                                    setForgotStep(3);
                                    setForgotSuccess('Password updated successfully!');
                                } catch (err: any) {
                                    setForgotError(err.response?.data?.error || 'Invalid or expired verification code.');
                                } finally {
                                    setForgotLoading(false);
                                }
                            }}>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                    Enter the 6-digit code sent to <strong style={{ color: 'var(--accent-blue)' }}>{forgotMaskedEmail}</strong> along with your new password.
                                </p>

                                <div className="form-group">
                                    <label className="form-label">6-Digit Verification Code *</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        className="form-input"
                                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: 'bold', color: 'var(--accent-blue)' }}
                                        placeholder="------"
                                        value={forgotOtp}
                                        onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">New Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Minimum 6 characters"
                                        value={forgotNewPass}
                                        onChange={(e) => setForgotNewPass(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm New Password *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Re-enter new password"
                                        value={forgotConfirmPass}
                                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setForgotStep(1)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? 'Updating Password...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Success Screen */}
                        {forgotStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', marginBottom: '1rem' }}>
                                    <CheckCircle size={40} />
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    Password Reset Complete!
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                    Your account password has been safely updated. You can now log in to the portal with your new credentials.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setPassword('');
                                    }}
                                >
                                    Proceed to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
