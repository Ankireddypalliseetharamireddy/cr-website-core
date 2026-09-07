import React, { useEffect, useState } from 'react';
import {
    Store, DollarSign, Package, Users, ArrowRightLeft, Power,
    Plus, Shield, Send, Search, CheckCircle, AlertTriangle,
    TrendingUp, ArrowUpRight, Wallet, Percent, Clock, Sparkles, Filter,
    ShoppingCart, ArrowRight, Share2, Printer, Check, RefreshCw, X, Calendar, FileText,
    Eye, ClipboardCheck, Copy, Key
} from 'lucide-react';
import { dashboardService, catalogService, transferService, employeeService, orderService } from '../services/api';
import '../styles/website.css';

interface FranchiseDashboardProps {
    onNavigateToBilling?: () => void;
    onNavigateToAudit?: () => void;
}

const formatIndianCurrency = (val: number | string | undefined | null) => {
    const num = parseFloat(String(val || 0));
    if (isNaN(num) || num <= 0) return '₹0';
    if (num >= 10000000) {
        return `₹${(num / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
    } else if (num >= 100000) {
        return `₹${(num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
};

const safeNum = (val: any, fallback: number = 0): number => {
    if (val === null || val === undefined || val === '') return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
};

export default function FranchiseDashboard({ onNavigateToBilling, onNavigateToAudit }: FranchiseDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'products' | 'wallet'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search States
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [walletLedgerType, setWalletLedgerType] = useState<'all' | 'wallet1' | 'wallet2'>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

    // Agreement Renewal Modal State
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [renewalSubmitted, setRenewalSubmitted] = useState(false);
    const [renewalNotes, setRenewalNotes] = useState('');

    // Payout Request Modal
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutUpi, setPayoutUpi] = useState('');
    const [payoutSuccess, setPayoutSuccess] = useState(false);

    // Add Staff Modal State & Role Classification
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffPassword, setNewStaffPassword] = useState('');
    const [newStaffRole, setNewStaffRole] = useState<'CASHIER' | 'AUDITOR' | 'STORE_MANAGER'>('CASHIER');
    const [creatingStaff, setCreatingStaff] = useState(false);
    const [createdStaffCreds, setCreatedStaffCreds] = useState<any | null>(null);

    const adminName = localStorage.getItem('username') || 'Franchise Admin';
    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const savedFranchiseId = localStorage.getItem('franchiseDbId');
            const statsParams = savedFranchiseId ? { franchise_id: savedFranchiseId } : undefined;

            let fetchedStats: any = null;
            try {
                const statsRes = await dashboardService.getFranchiseStats(statsParams);
                fetchedStats = statsRes.data;
                setStats(fetchedStats);
                if (fetchedStats?.id) {
                    localStorage.setItem('franchiseDbId', String(fetchedStats.id));
                }
                if (fetchedStats?.name) {
                    localStorage.setItem('franchiseId', fetchedStats.name);
                }
            } catch (err) {
                console.error("Failed to load franchise stats", err);
            }

            const activeFranchiseId = fetchedStats?.id || savedFranchiseId;
            const orderParams = activeFranchiseId ? { franchise: activeFranchiseId } : undefined;

            const [prodRes, transRes, empRes, ordRes] = await Promise.all([
                catalogService.getProducts().catch(() => ({ data: [] })),
                transferService.getTransfers().catch(() => ({ data: [] })),
                employeeService.getEmployees().catch(() => ({ data: [] })),
                orderService.getOrders(orderParams).catch(() => ({ data: [] }))
            ]);

            setProducts(prodRes.data || []);
            setTransfers(transRes.data || []);
            setEmployees(empRes.data || []);
            setOrders(ordRes.data || []);
        } catch (err) {
            console.error("Failed to load franchise dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handlePayoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPayoutSuccess(true);
        setTimeout(() => {
            setPayoutSuccess(false);
            setShowPayoutModal(false);
            setPayoutAmount('');
            setPayoutUpi('');
            alert("Payout request of ₹" + payoutAmount + " submitted for bank transfer settlement!");
        }, 1500);
    };

    const handleRenewalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRenewalSubmitted(true);
        setTimeout(() => {
            alert("Agreement renewal and tenure extension application submitted to Cavree Executive HQ. Our legal and operations desk will review and contact you.");
            setShowRenewalModal(false);
            setRenewalSubmitted(false);
            setRenewalNotes('');
        }, 1500);
    };

    const handleShareWhatsApp = (order: any) => {
        const itemsSummary = order.items?.map((it: any) => `• ${it.product_name} x ${it.quantity} = ₹${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}`).join('%0A') || '';
        const text = `🛍️ *CAVREE INVOICE RECEIPT*%0AStore: ${stats?.name || storeName}%0AInvoice No: *${order.invoice_number}*%0ADate: ${new Date(order.created_at).toLocaleDateString()}%0A%0A*Items:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(order.total_price).toFixed(2)}*%0A%0AThank you for shopping at Cavree!`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const getRoleClassificationBadge = (roleCode: string) => {
        const code = (roleCode || '').toUpperCase();
        if (code === 'CASHIER') {
            return (
                <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem' }}>
                    <ShoppingCart size={13} />
                    <span>Billing Only (Cashier)</span>
                </span>
            );
        }
        if (code === 'AUDITOR') {
            return (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem' }}>
                    <ClipboardCheck size={13} />
                    <span>Auditing Only (Auditor)</span>
                </span>
            );
        }
        if (code === 'STORE_MANAGER') {
            return (
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem' }}>
                    <Shield size={13} />
                    <span>Both: Billing &amp; Auditing (Manager)</span>
                </span>
            );
        }
        return (
            <span className="badge badge-gold">
                {code.replace(/_/g, ' ')}
            </span>
        );
    };

    const handleAddStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingStaff(true);
        try {
            const payload = {
                name: newStaffName.trim(),
                email: newStaffEmail.trim(),
                role: newStaffRole,
                password: newStaffPassword.trim() || undefined,
            };
            const res = await employeeService.createEmployee(payload);
            const data = res.data;
            setCreatedStaffCreds({
                employee_id: data.employee_id,
                name: newStaffName,
                username: data.raw_username || data.username || newStaffEmail.split('@')[0],
                password: data.generated_password || newStaffPassword || 'Assigned Password',
                role: newStaffRole,
                roleLabel: newStaffRole === 'CASHIER' 
                    ? 'Billing Only (Cashier)' 
                    : (newStaffRole === 'AUDITOR' ? 'Auditing Only (Store Auditor)' : 'Both Billing & Auditing (Store Manager)')
            });
            setShowAddStaffModal(false);
            setNewStaffName('');
            setNewStaffEmail('');
            setNewStaffPassword('');
            setNewStaffRole('CASHIER');
            loadDashboardData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to register store employee. Please check inputs.");
        } finally {
            setCreatingStaff(false);
        }
    };

    const handleShareStaffCredentials = (creds: any) => {
        const text = `🎉 *CAVREE STORE EMPLOYEE LOGIN CREDENTIALS*%0AStore: ${stats?.name || storeName}%0AEmployee ID: *${creds.employee_id}*%0AName: ${creds.name}%0AAssigned Role: *${creds.roleLabel}*%0A%0A*Login Username:* ${creds.username}%0A*Password:* ${creds.password}%0A%0APortal URL: https://cavree.com/login%0A%0APlease keep your credentials confidential.`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleCopyStaffCredentials = (creds: any) => {
        const text = `Cavree Store Staff Credentials:\nStore: ${stats?.name || storeName}\nEmployee ID: ${creds.employee_id}\nName: ${creds.name}\nRole: ${creds.roleLabel}\nUsername: ${creds.username}\nPassword: ${creds.password}\nPortal: https://cavree.com/login`;
        navigator.clipboard.writeText(text);
        alert("Staff credentials copied to clipboard!");
    };

    // Filter Employees
    const filteredEmployees = employees.filter(emp => 
        (emp.employee_id && emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.first_name && emp.user.first_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.last_name && emp.user.last_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.username && emp.user.username.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.email && emp.user.email.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.role && emp.role.toLowerCase().includes(employeeSearch.toLowerCase()))
    );

    const commissionPercent = parseFloat(stats?.commission_percentage || '15');

    // Filter Invoices (Search by Invoice # or Payment Method, customer phone is hidden for privacy)
    const filteredInvoices = orders.filter(o => {
        const matchesSearch = 
            (o.invoice_number && o.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase())) ||
            (o.payment_method && o.payment_method.toLowerCase().includes(invoiceSearch.toLowerCase()));
        if (!matchesSearch) return false;

        const commVal = parseFloat(o.commission_amount !== undefined && o.commission_amount !== null ? o.commission_amount : (parseFloat(o.total_price || 0) * (commissionPercent / 100)));
        const recoupVal = parseFloat(o.principal_recovery_amount !== undefined && o.principal_recovery_amount !== null ? o.principal_recovery_amount : (parseFloat(o.net_base_amount || (o.total_price / 1.18)) * 0.10));

        if (walletLedgerType === 'wallet1') return commVal > 0;
        if (walletLedgerType === 'wallet2') return recoupVal > 0;
        return true;
    });

    const totalGrossRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
    const totalNetBaseRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.net_base_amount) || (parseFloat(o.total_price || 0) / 1.18)), 0);
    const totalCommissionCredited = orders.reduce((sum, o) => {
        if (o.commission_amount !== undefined && o.commission_amount !== null) {
            return sum + parseFloat(o.commission_amount);
        }
        const netBase = parseFloat(o.net_base_amount || (parseFloat(o.total_price || 0) / 1.18));
        return sum + (netBase * (commissionPercent / 100));
    }, 0);
    const totalPrincipalRecoupedCalc = orders.reduce((sum, o) => {
        if (o.principal_recovery_amount !== undefined && o.principal_recovery_amount !== null) {
            return sum + parseFloat(o.principal_recovery_amount);
        }
        const netBase = parseFloat(o.net_base_amount || (parseFloat(o.total_price || 0) / 1.18));
        return sum + (netBase * 0.10);
    }, 0);

    if (loading) {
        return (
            <div className="main-content">
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--pos-text-secondary)' }}>
                    <p>Loading franchise command center &amp; store analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            
            {/* ========================================================================== */}
            {/* EXECUTIVE STORE HERO BANNER                                               */}
            {/* ========================================================================== */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(22, 27, 40, 0.98) 0%, rgba(10, 12, 18, 0.98) 100%)',
                border: '1px solid var(--pos-border-gold)',
                borderRadius: '22px',
                padding: '2rem 2.25rem',
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 16px 50px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.1)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-gold" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                            <Store size={13} style={{ marginRight: '0.35rem' }} />
                            {stats?.name || storeName}
                        </span>
                        <span className="badge badge-blue">
                            📍 {stats?.location || 'Central Retail Branch'}
                        </span>
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="pulse-dot"></span> Live POS Counter Active
                        </span>
                        <span className="badge badge-purple">
                            ⚡ {commissionPercent}% Base Share
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.25rem 0', color: 'var(--pos-text-primary)' }}>
                        Welcome, <span style={{ background: 'var(--pos-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{adminName}</span>
                    </h1>
                    <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 0 0', maxWidth: '650px', lineHeight: '1.5' }}>
                        Franchise Executive Dashboard &bull; View on-duty store staff directory, monitor high-level inventory valuation, track central consignments, and audit two-wallet earnings.
                    </p>
                </div>

                {/* Quick Action Trigger Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowRenewalModal(true)}
                        style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderColor: 'var(--pos-gold-primary)', color: 'var(--pos-gold-light)' }}
                    >
                        <Sparkles size={16} style={{ color: 'var(--pos-gold-primary)' }} />
                        <span>Agreement Terms &amp; Renewal</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================== */}
            {/* AGREEMENT & DYNAMIC MINIMUM GUARANTEE TENURE BANNER                        */}
            {/* ========================================================================== */}
            <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.09) 0%, rgba(20, 20, 25, 0.65) 100%)',
                border: '1px solid var(--pos-border-gold)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ flex: '1 1 360px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: 'var(--pos-gold-primary)', color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                                {stats?.is_extended ? `${stats?.agreement_years || 6} + ${stats?.extension_years || 2} Year Term Active (Extension Clause)` : `${stats?.agreement_years || 6}-Year Agreement Active`}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--pos-text-secondary)' }}>
                                Term: {stats?.years_elapsed || 0} / {stats?.agreement_years || 6} Years Elapsed &bull; {stats?.term_remaining_years || 6} Yrs Remaining
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0 0 0.45rem 0', color: 'var(--pos-gold-light)' }}>
                            Agreement Minimum Guarantee Target: ₹{safeNum(stats?.minimum_guarantee_target).toLocaleString('en-IN')} {stats?.minimum_guarantee_target ? `(${formatIndianCurrency(stats?.minimum_guarantee_target)})` : ''}
                        </h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            ★ <strong>Cavree Buyout Guarantee:</strong> If your invested principal is not recouped to ₹0 within {stats?.agreement_years || 6} years, Cavree contractually pays the remaining balance. If completed earlier, commission payouts continue through the full agreement tenure.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#6ee7b7' }}>
                                ₹{safeNum(stats?.cumulative_net_sales || stats?.total_sold_all_time).toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>net sales accrued</span>
                        </div>
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '8px', overflow: 'hidden', minWidth: '220px' }}>
                            <div style={{
                                width: `${Math.min(100, safeNum(stats?.guarantee_target_progress))}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #d4af37)',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                            <span>{safeNum(stats?.guarantee_target_progress)}% of Target Met</span>
                            <span>Target: {formatIndianCurrency(stats?.minimum_guarantee_target || 0)}</span>
                        </div>
                        <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => setShowRenewalModal(true)}
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderColor: 'var(--pos-gold-primary)', color: 'var(--pos-gold-light)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                            <Sparkles size={13} style={{ color: 'var(--pos-gold-primary)' }} />
                            <span>Agreement Terms &amp; Renewal</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================================================== */}
            {/* 4 LUXURY KPI COMMAND CARDS                                                 */}
            {/* ========================================================================== */}
            <div className="kpi-grid">
                
                {/* 1. Wallet 1: Live Commission Wallet */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)', cursor: 'pointer' }} onClick={() => setActiveTab('wallet')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Wallet 1: Commissions
                        </span>
                        <Wallet size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-light)' }}>
                        ₹{safeNum(stats?.commission_wallet_balance || stats?.wallet_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Product sales earnings</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>Payout &rarr;</span>
                    </div>
                </div>

                {/* 2. Wallet 2: Invested Principal Recoup Wallet */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid #60a5fa', cursor: 'pointer' }} onClick={() => setActiveTab('wallet')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Wallet 2: Invested Bal
                        </span>
                        <TrendingUp size={18} style={{ color: '#60a5fa' }} />
                    </div>
                    <div className="kpi-val" style={{ color: '#93c5fd' }}>
                        ₹{safeNum(stats?.invested_wallet_balance !== undefined && stats?.invested_wallet_balance !== null ? stats?.invested_wallet_balance : stats?.investment_amount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>10% Net Billings</span>
                        <span style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 'bold' }}>₹{safeNum(stats?.recovered_investment).toLocaleString('en-IN')} recouped</span>
                    </div>
                </div>

                {/* 3. Active Shelf Stock Valuation */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)', cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Shelf Stock Value
                        </span>
                        <Package size={18} style={{ color: 'var(--pos-gold-metallic)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-text-primary)' }}>
                        ₹{safeNum(stats?.current_shelf_inventory_value).toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Consigned Worth</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>₹{safeNum(stats?.total_consignment_received_value).toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* 4. Store Employees On-Duty */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)', cursor: 'pointer' }} onClick={() => setActiveTab('employees')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Staff Team
                        </span>
                        <Users size={18} style={{ color: 'var(--pos-gold-champagne)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-champagne)' }}>
                        {employees.length} <span style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>members</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>On duty</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--pos-gold-champagne)' }}>View &rarr;</span>
                    </div>
                </div>
            </div>

            {/* ========================================================================== */}
            {/* NAVIGATION TABS FOR FRANCHISE COMMAND                                      */}
            {/* ========================================================================== */}
            <div className="franchise-nav-tabs">
                <button
                    className={`btn btn-sm franchise-nav-tab-btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <TrendingUp size={14} style={{ flexShrink: 0 }} />
                    <span>📊 Command Overview</span>
                </button>

                <button
                    className={`btn btn-sm franchise-nav-tab-btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('employees')}
                >
                    <Users size={14} style={{ flexShrink: 0 }} />
                    <span>👥 Store Staff ({employees.length})</span>
                </button>

                <button
                    className={`btn btn-sm franchise-nav-tab-btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('products')}
                >
                    <Package size={14} style={{ flexShrink: 0 }} />
                    <span>📦 Financial Inventory Valuation</span>
                </button>

                <button
                    className={`btn btn-sm franchise-nav-tab-btn ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    <Wallet size={14} style={{ flexShrink: 0 }} />
                    <span>💰 Dual-Wallet &amp; Ledger</span>
                </button>
            </div>

            {/* ========================================================================== */}
            {/* TAB 1: OVERVIEW & COMMAND HUB                                             */}
            {/* ========================================================================== */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 4 Interactive Quick-Action Command Modules */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        
                        {/* Module 1: Minimum Guarantee Agreement */}
                        <div
                            className="glass-panel"
                            style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-primary)', transition: 'transform 0.2s' }}
                            onClick={() => setShowRenewalModal(true)}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--pos-gold-gradient-subtle)', color: 'var(--pos-gold-primary)', border: '1px solid var(--pos-border-gold)' }}>
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                        Minimum Guarantee Target
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{stats?.agreement_years || 6}-Year Term &bull; Buyout</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Target: ₹{safeNum(stats?.minimum_guarantee_target).toLocaleString('en-IN')} &bull; {safeNum(stats?.guarantee_target_progress)}% realized via net sales.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-light)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>View Agreement Details</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        {/* Module 2: Manage Staff */}
                        <div
                            className="glass-panel"
                            style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-champagne)', transition: 'transform 0.2s' }}
                            onClick={() => setActiveTab('employees')}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(222, 194, 157, 0.12)', color: 'var(--pos-gold-champagne)', border: '1px solid var(--pos-border-gold)' }}>
                                    <Users size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-champagne)' }}>
                                        Store Staff Directory
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{employees.length} Staff Members</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                View on-duty staff members (Cashiers, Managers, Auditors) and operational directory.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-champagne)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>View Staff Directory</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        {/* Module 3: Inventory Valuation */}
                        <div
                            className="glass-panel"
                            style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-accent-green)', transition: 'transform 0.2s' }}
                            onClick={() => setActiveTab('products')}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--pos-accent-green)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                    <Package size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#6ee7b7' }}>
                                        Financial Inventory
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Consigned vs Sold vs Shelf</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Executive capital valuation of merchandise delivered, liquidated, and active on floor.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-accent-green)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Inspect Valuations</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        {/* Module 4: Wallet & Payouts */}
                        <div
                            className="glass-panel"
                            style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-metallic)', transition: 'transform 0.2s' }}
                            onClick={() => setActiveTab('wallet')}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(230, 202, 101, 0.12)', color: 'var(--pos-gold-metallic)', border: '1px solid var(--pos-border-gold)' }}>
                                    <Wallet size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                        Two-Wallet Centre
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Commissions &amp; Invested Recoup</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Track commission payouts and 10% principal recoup towards ₹0 with buyout guarantee.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-light)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Open Two-Wallet Ledger</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Split 2-Column Live Feed: Recent Orders & Consignments */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Left Feed: Recent Counter Sales Invoices */}
                        <div className="glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    <ShoppingCart size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Live Counter Invoices ({orders.length})
                                </h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('wallet')}>
                                    View All Ledger &rarr;
                                </button>
                            </div>

                            {orders.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Date &amp; Time</th>
                                                <th>Total Bill</th>
                                                <th style={{ textAlign: 'right' }}>Wallet 1 Comm.</th>
                                                <th style={{ textAlign: 'right' }}>Wallet 2 Recoup</th>
                                                <th style={{ textAlign: 'center' }}>Breakdown</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map((ord) => {
                                                const gross = parseFloat(ord.total_price) || 0;
                                                const netBase = parseFloat(ord.net_base_amount !== undefined && ord.net_base_amount !== null ? ord.net_base_amount : (gross / 1.18));
                                                const comm = parseFloat(ord.commission_amount !== undefined && ord.commission_amount !== null ? ord.commission_amount : (netBase * (commissionPercent / 100)));
                                                const recoup = parseFloat(ord.principal_recovery_amount !== undefined && ord.principal_recovery_amount !== null ? ord.principal_recovery_amount : (netBase * 0.10));

                                                return (
                                                    <tr 
                                                        key={ord.id}
                                                        onClick={() => setSelectedInvoice(ord)}
                                                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                        title="Click to view itemized commission & dual-wallet breakdown"
                                                    >
                                                        <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                            {ord.invoice_number}
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>
                                                            {new Date(ord.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ fontWeight: 'bold' }}>
                                                            ₹{gross.toFixed(2)}
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7' }}>
                                                            + ₹{comm.toFixed(2)}
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#93c5fd' }}>
                                                            + ₹{recoup.toFixed(2)}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span className="badge badge-gold" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem' }}>
                                                                <Eye size={12} /> View
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--pos-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                                    No sales transactions recorded yet today.
                                </p>
                            )}
                        </div>

                        {/* Right Feed: Active Consignments & In-Transit Transfers */}
                        <div className="glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    <ArrowRightLeft size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Incoming Consignment Shipments
                                </h3>
                                <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
                                    Central Dispatch Feed
                                </span>
                            </div>

                            {transfers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Tracking #</th>
                                                <th>Product</th>
                                                <th>Delivered Qty</th>
                                                <th style={{ textAlign: 'center' }}>Consignment Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transfers.slice(0, 5).map((t) => (
                                                <tr key={t.id}>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                        {t.transfer_number}
                                                    </td>
                                                    <td>{t.product_name}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{t.quantity} units</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`badge ${t.status === 'RECEIVED' ? 'badge-success' : (t.status === 'IN_TRANSIT' ? 'badge-primary' : 'badge-warning')}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                                            {t.status === 'RECEIVED' ? '✓ Received into Branch Stock' : (t.status === 'IN_TRANSIT' ? '🚚 In Transit from Warehouse' : t.status.replace(/_/g, ' '))}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--pos-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                                    No pending consignment transfers.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* TAB 2: STORE EMPLOYEES DIRECTORY                                           */}
            {/* ========================================================================== */}
            {activeTab === 'employees' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Store Employees Directory ({filteredEmployees.length})
                            </h2>
                            <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                Personnel on duty at {stats?.name || storeName}. Classified by operational authority: Billing Only, Auditing Only, or Both.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', minWidth: '240px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search staff by name, ID, or email..."
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                    style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                                />
                                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddStaffModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                            >
                                <Plus size={16} />
                                <span>Add Store Staff</span>
                            </button>
                        </div>
                    </div>

                    {/* Role Classification Legend Strip */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        border: '1px solid var(--pos-border-subtle)',
                        marginBottom: '1.5rem',
                        fontSize: '0.8rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', marginTop: '2px' }}>
                                <ShoppingCart size={15} />
                            </div>
                            <div>
                                <strong style={{ color: '#93c5fd', display: 'block', marginBottom: '0.15rem' }}>1. Billing Only (Cashier)</strong>
                                <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.75rem' }}>Only POS checkout, ringing sales &amp; issuing receipts. Cannot audit.</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', marginTop: '2px' }}>
                                <ClipboardCheck size={15} />
                            </div>
                            <div>
                                <strong style={{ color: '#6ee7b7', display: 'block', marginBottom: '0.15rem' }}>2. Auditing Only (Store Auditor)</strong>
                                <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.75rem' }}>Only barcode stock auditing &amp; inventory counts. Cannot bill.</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--pos-gold-light)', marginTop: '2px' }}>
                                <Shield size={15} />
                            </div>
                            <div>
                                <strong style={{ color: 'var(--pos-gold-light)', display: 'block', marginBottom: '0.15rem' }}>3. Both: Billing &amp; Auditing (Manager)</strong>
                                <span style={{ color: 'var(--pos-text-secondary)', fontSize: '0.75rem' }}>Dual operational authority: Full access to POS billing AND store auditing.</span>
                            </div>
                        </div>
                    </div>

                    {/* Employee Table */}
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Staff Member</th>
                                    <th>Role Classification</th>
                                    <th>Approval Status</th>
                                    <th style={{ textAlign: 'center' }}>Duty Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} style={{ opacity: emp.is_active_employee ? 1 : 0.55 }}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                {emp.employee_id || emp.user?.username}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{emp.user?.first_name} {emp.user?.last_name || emp.user?.username}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{emp.user?.email}</div>
                                            </td>
                                            <td>
                                                {getRoleClassificationBadge(emp.role)}
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.approval_status === 'APPROVED' ? 'badge-success' : (emp.approval_status === 'REJECTED' ? 'badge-danger' : 'badge-warning')}`}>
                                                    {emp.approval_status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`badge ${emp.is_active_employee ? 'badge-success' : 'badge-danger'}`}>
                                                    {emp.is_active_employee ? 'Active / On Duty' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--pos-text-secondary)' }}>
                                            No employees found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* TAB 3: FINANCIAL INVENTORY VALUATION (NO ITEM-WISE PRODUCTS)               */}
            {/* ========================================================================== */}
            {activeTab === 'products' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Package size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Financial Inventory &amp; Consignment Valuation
                                </h2>
                                <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                    Executive capital valuation of merchandise consigned, sold, and stocked at {stats?.name || storeName}.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="badge badge-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                                    🛡️ Investor Capital Protection
                                </span>
                            </div>
                        </div>

                        {/* 3 Executive Financial Valuation Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            
                            {/* 1. Total Consignment Received Value */}
                            <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)', background: 'rgba(212, 175, 55, 0.05)' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                    Total Consigned Stock Delivered
                                </span>
                                <h3 style={{ fontSize: '1.85rem', fontWeight: 'bold', margin: '0.4rem 0 0.2rem 0', color: 'var(--pos-gold-light)' }}>
                                    ₹{parseFloat(stats?.total_consignment_received_value || 0).toLocaleString('en-IN')}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: 0 }}>
                                    Cumulative gross consignment inventory received from Central Warehouse
                                </p>
                            </div>

                            {/* 2. Total Sales Realized */}
                            <div className="glass-panel" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                    Total Sales Realized (Sold)
                                </span>
                                <h3 style={{ fontSize: '1.85rem', fontWeight: 'bold', margin: '0.4rem 0 0.2rem 0', color: '#6ee7b7' }}>
                                    ₹{parseFloat(stats?.total_sales_realized_value || stats?.total_sold_all_time || 0).toLocaleString('en-IN')}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: 0 }}>
                                    Gross sales revenue liquidated through store POS billing
                                </p>
                            </div>

                            {/* 3. Active Shelf Stock Valuation */}
                            <div className="glass-panel" style={{ borderLeft: '4px solid #60a5fa', background: 'rgba(96, 165, 250, 0.05)' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                    Active Shelf Stock Value
                                </span>
                                <h3 style={{ fontSize: '1.85rem', fontWeight: 'bold', margin: '0.4rem 0 0.2rem 0', color: '#93c5fd' }}>
                                    ₹{parseFloat(stats?.current_shelf_inventory_value || 0).toLocaleString('en-IN')}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: 0 }}>
                                    Current unsold merchandise value physically available on store floor
                                </p>
                            </div>
                        </div>

                        {/* Inventory Realization Progress Meter */}
                        <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pos-text-primary)' }}>
                                    Consignment Liquidation &amp; Conversion Rate
                                </span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                    {stats?.liquidation_rate || 0}% Realized
                                </span>
                            </div>
                            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(100, stats?.liquidation_rate || 0)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #60a5fa, #10b981)',
                                    borderRadius: '999px',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                <span>Active Shelf Stock: ₹{parseFloat(stats?.current_shelf_inventory_value || 0).toLocaleString('en-IN')}</span>
                                <span>Sold Merchandise: ₹{parseFloat(stats?.total_sales_realized_value || stats?.total_sold_all_time || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Investor Governance & Operational Protocol Card */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: '1px solid var(--pos-border-gold)',
                            background: 'rgba(212, 175, 55, 0.04)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem'
                        }}>
                            <Shield size={24} style={{ color: 'var(--pos-gold-primary)', flexShrink: 0, marginTop: '0.2rem' }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--pos-gold-light)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                                    Executive Franchise Inventory Policy
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', lineHeight: '1.5' }}>
                                    As an equity franchise investor, individual SKU-level stock movements and item restocking requests are handled directly by on-ground store managers and central logistics. Your investor portal maintains real-time capital valuation, inventory consignment receipts, and sales revenue realization.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* TAB 4: TWO-WALLET COMMAND & TRANSACTION COMMISSION LEDGER                 */}
            {/* ========================================================================== */}
            {activeTab === 'wallet' && (
                <div>
                    {/* Financial Summary Cards for the Two Wallets */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        
                        {/* 1. Wallet 1: Commission Earnings Wallet */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Wallet 1: Commission Earnings
                                    </span>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-light)' }}>
                                        ₹{parseFloat(stats?.commission_wallet_balance || stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </h2>
                                </div>
                                <Wallet size={28} style={{ color: 'var(--pos-gold-primary)' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0.75rem 0', lineHeight: '1.4' }}>
                                Credited per product sold = Base Price (excl. GST) &times; Product Commission %.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--pos-border-subtle)', paddingTop: '0.65rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Available for payout</span>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowPayoutModal(true)}>
                                    Request Payout
                                </button>
                            </div>
                        </div>

                        {/* 2. Wallet 2: Invested Principal Recovery Countdown */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid #60a5fa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Wallet 2: Invested Balance (Towards ₹0)
                                    </span>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: '#93c5fd' }}>
                                        ₹{safeNum(stats?.invested_wallet_balance !== undefined && stats?.invested_wallet_balance !== null ? stats?.invested_wallet_balance : stats?.investment_amount).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                                <TrendingUp size={28} style={{ color: '#60a5fa' }} />
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--pos-text-secondary)' }}>Recouped via 10% Billings:</span>
                                    <span style={{ color: '#6ee7b7', fontWeight: 'bold' }}>₹{safeNum(stats?.recovered_investment).toLocaleString('en-IN')} ({safeNum(stats?.recovery_percent)}%)</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, safeNum(stats?.recovery_percent))}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #60a5fa, #10b981)',
                                        borderRadius: '999px'
                                    }} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                                Initial: ₹{safeNum(stats?.investment_amount).toLocaleString('en-IN')} &bull; Cavree contractually guarantees buyout of remaining balance if &gt; ₹0 at 6 years.
                            </p>
                        </div>

                        {/* 3. Dynamic Minimum Guarantee Target Status */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Agreement Sales Target
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-champagne)' }}>
                                        {formatIndianCurrency(stats?.minimum_guarantee_target || 0)}
                                    </h2>
                                </div>
                                <Sparkles size={28} style={{ color: 'var(--pos-gold-champagne)' }} />
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--pos-text-secondary)' }}>Net Sales Accrued:</span>
                                    <span style={{ color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>₹{safeNum(stats?.cumulative_net_sales || stats?.total_sold_all_time).toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, safeNum(stats?.guarantee_target_progress))}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #10b981, #d4af37)',
                                        borderRadius: '999px'
                                    }} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>
                                Term: {stats?.agreement_years || 6} Yrs {stats?.is_extended ? '(+2 Yrs Ext Clause Active)' : ''} &bull; Decided per investor agreement.
                            </p>
                        </div>
                    </div>

                    {/* Sales & Dual-Wallet Commission Breakdown Ledger */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Dual-Wallet Transaction Ledger &amp; Commission History
                                </h3>
                                <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                    Real-time audit log of gross billings, net base amounts (excl. GST), Wallet 1 product commissions, and Wallet 2 principal recovery deductions.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Ledger View Filter Toggles */}
                                <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--pos-border-subtle)' }}>
                                    <button
                                        className={`btn btn-sm ${walletLedgerType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setWalletLedgerType('all')}
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        All Wallets ({orders.length})
                                    </button>
                                    <button
                                        className={`btn btn-sm ${walletLedgerType === 'wallet1' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setWalletLedgerType('wallet1')}
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        💰 Wallet 1 (Commissions)
                                    </button>
                                    <button
                                        className={`btn btn-sm ${walletLedgerType === 'wallet2' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setWalletLedgerType('wallet2')}
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        📈 Wallet 2 (Principal Recoup)
                                    </button>
                                </div>

                                <div style={{ position: 'relative', minWidth: '240px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Search by Invoice # or Payment..."
                                        value={invoiceSearch}
                                        onChange={(e) => setInvoiceSearch(e.target.value)}
                                        style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                                    />
                                    <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Dual-Wallet Ledger Metric Strip */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '0.75rem',
                            padding: '0.85rem 1rem',
                            background: 'rgba(0, 0, 0, 0.35)',
                            borderRadius: '12px',
                            border: '1px solid var(--pos-border-subtle)',
                            marginBottom: '1.25rem'
                        }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Total Invoices</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>{orders.length}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Gross Store Sales</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>₹{totalGrossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Net Base (Excl. GST)</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>₹{totalNetBaseRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 600 }}>Wallet 1 Comm. Earned</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#6ee7b7' }}>+ ₹{totalCommissionCredited.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 600 }}>Wallet 2 Capital Recouped</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#93c5fd' }}>+ ₹{totalPrincipalRecoupedCalc.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>

                        {filteredInvoices.length > 0 ? (
                            <div className="table-responsive">
                                <table className="glass-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Date &amp; Time</th>
                                            <th>Gross Total</th>
                                            <th>Net Base (Excl. GST)</th>
                                            <th style={{ textAlign: 'right', color: 'var(--pos-gold-light)' }}>Wallet 1: Commission</th>
                                            <th style={{ textAlign: 'right', color: '#93c5fd' }}>Wallet 2: Recouped (10%)</th>
                                            <th>Payment Method</th>
                                            <th style={{ textAlign: 'center' }}>Breakdown</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((ord) => {
                                            const gross = parseFloat(ord.total_price) || 0;
                                            const netBase = parseFloat(ord.net_base_amount !== undefined && ord.net_base_amount !== null ? ord.net_base_amount : (gross / 1.18));
                                            const comm = parseFloat(ord.commission_amount !== undefined && ord.commission_amount !== null ? ord.commission_amount : (netBase * (commissionPercent / 100)));
                                            const recoup = parseFloat(ord.principal_recovery_amount !== undefined && ord.principal_recovery_amount !== null ? ord.principal_recovery_amount : (netBase * 0.10));

                                            return (
                                                <tr 
                                                    key={ord.id}
                                                    onClick={() => setSelectedInvoice(ord)}
                                                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                    title="Click row to inspect product-wise commission & dual-wallet breakdown"
                                                >
                                                    <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                        {ord.invoice_number}
                                                    </td>
                                                    <td style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                                        {new Date(ord.created_at).toLocaleString()}
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>
                                                        ₹{gross.toFixed(2)}
                                                    </td>
                                                    <td style={{ color: 'var(--pos-text-secondary)', fontSize: '0.85rem' }}>
                                                        ₹{netBase.toFixed(2)}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7', fontSize: '0.9375rem' }}>
                                                        + ₹{comm.toFixed(2)}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#93c5fd', fontSize: '0.9375rem' }}>
                                                        + ₹{recoup.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-blue">{ord.payment_method}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span 
                                                            className="badge badge-gold" 
                                                            style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem' }}
                                                        >
                                                            <Eye size={12} /> View
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                                No transactions found matching your current filter.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: AGREEMENT TERMS & RENEWAL                                          */}
            {/* ========================================================================== */}
            {showRenewalModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '520px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Agreement Terms &amp; Renewal Application
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowRenewalModal(false)}>
                                &times;
                            </button>
                        </div>

                        {renewalSubmitted ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} style={{ color: 'var(--pos-accent-green)', marginBottom: '0.75rem' }} />
                                <h4 style={{ color: 'var(--pos-gold-light)', margin: '0 0 0.5rem 0' }}>Renewal Application Submitted!</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--pos-text-secondary)' }}>
                                    Your request has been delivered to Cavree Executive HQ. Our legal and franchise operations desk will review your store metrics and coordinate next steps.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleRenewalSubmit}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--pos-border-gold)', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--pos-text-secondary)' }}>Store Branch:</span>
                                            <div style={{ fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>{stats?.name || storeName}</div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--pos-text-secondary)' }}>Agreement Tenure:</span>
                                            <div style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                                {stats?.agreement_years || 6} Years {stats?.is_extended ? '(+2 Yrs Extension Clause)' : ''}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--pos-text-secondary)' }}>Minimum Guarantee Target:</span>
                                            <div style={{ fontWeight: 'bold', color: '#6ee7b7' }}>
                                                {formatIndianCurrency(stats?.minimum_guarantee_target || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--pos-text-secondary)' }}>Tenure Remaining:</span>
                                            <div style={{ fontWeight: 'bold', color: 'var(--pos-gold-champagne)' }}>
                                                {stats?.term_remaining_years || 6} Years
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                    ★ <strong>Terms Summary:</strong>
                                    <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem' }}>
                                        <li>Invested principal is recouped via 10% net billings towards ₹0.</li>
                                        <li>If principal is not reduced to ₹0 within {stats?.agreement_years || 6} years, Cavree contractually pays the remaining balance in full.</li>
                                        <li>If cumulative sales do not reach {formatIndianCurrency(stats?.minimum_guarantee_target || 0)} within {stats?.agreement_years || 6} years, agreement extends by 2 years automatically.</li>
                                    </ul>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Investor Notes / Extension Request *</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        placeholder="Enter your notes, request for contract renewal, or capital expansion interest..."
                                        value={renewalNotes}
                                        onChange={(e) => setRenewalNotes(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowRenewalModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <Send size={15} />
                                        <span>Submit Renewal Request</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: REQUEST WALLET PAYOUT                                              */}
            {/* ========================================================================== */}
            {showPayoutModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wallet size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Request Wallet Payout
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowPayoutModal(false)}>
                                &times;
                            </button>
                        </div>

                        {payoutSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} style={{ color: 'var(--pos-accent-green)', marginBottom: '0.75rem' }} />
                                <h4 style={{ color: 'var(--pos-gold-light)', margin: '0 0 0.5rem 0' }}>Payout Request Queued!</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--pos-text-secondary)' }}>
                                    Your withdrawal request for ₹{payoutAmount} will be transferred to your registered bank account via NEFT/IMPS.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handlePayoutSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Available Commission Wallet Balance (Wallet 1)</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', padding: '0.5rem 0' }}>
                                        ₹{parseFloat(stats?.commission_wallet_balance || stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Withdrawal Amount (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter amount to withdraw..."
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        max={stats?.commission_wallet_balance || stats?.wallet_balance || 999999}
                                        min="100"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Bank UPI ID / Account Number *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. franchise@hdfcbank or Bank A/C #"
                                        value={payoutUpi}
                                        onChange={(e) => setPayoutUpi(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPayoutModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Confirm Withdrawal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: ADD STORE STAFF WITH ROLE CLASSIFICATION                           */}
            {/* ========================================================================== */}
            {showAddStaffModal && (
                <div className="modal-overlay" onClick={() => setShowAddStaffModal(false)}>
                    <div 
                        className="modal-content" 
                        style={{ maxWidth: '620px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Register Store Staff
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                    Assign operational roles for {stats?.name || storeName}
                                </span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddStaffModal(false)}>
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddStaffSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Staff Member Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Ramesh Reddy"
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Email Address (For Account Login) *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="e.g. ramesh@store.cavree.com"
                                    value={newStaffEmail}
                                    onChange={(e) => setNewStaffEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">Initial Password (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Leave blank to auto-generate a secure password..."
                                    value={newStaffPassword}
                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                    If left blank, a secure random password will be created automatically.
                                </span>
                            </div>

                            {/* 3 Role Classification Selection Cards */}
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.65rem' }}>
                                    Select Operational Role Classification *
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    
                                    {/* Role 1: Billing Only */}
                                    <div
                                        onClick={() => setNewStaffRole('CASHIER')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.85rem',
                                            padding: '0.85rem 1rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: newStaffRole === 'CASHIER' ? '2px solid #3b82f6' : '1px solid var(--pos-border-subtle)',
                                            background: newStaffRole === 'CASHIER' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', marginTop: '2px' }}>
                                            <ShoppingCart size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ color: '#93c5fd', fontSize: '0.9rem' }}>1. Billing Only (Cashier)</strong>
                                                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>POS Billing Only</span>
                                            </div>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--pos-text-secondary)', lineHeight: '1.4' }}>
                                                Authorized to ring up customer sales, scan barcodes, accept UPI/cash, and print/share receipts. <strong>Blocked from Store Auditing.</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role 2: Auditing Only */}
                                    <div
                                        onClick={() => setNewStaffRole('AUDITOR')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.85rem',
                                            padding: '0.85rem 1rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: newStaffRole === 'AUDITOR' ? '2px solid #10b981' : '1px solid var(--pos-border-subtle)',
                                            background: newStaffRole === 'AUDITOR' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', marginTop: '2px' }}>
                                            <ClipboardCheck size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ color: '#6ee7b7', fontSize: '0.9rem' }}>2. Auditing Only (Store Auditor)</strong>
                                                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Stock Auditing Only</span>
                                            </div>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--pos-text-secondary)', lineHeight: '1.4' }}>
                                                Authorized to scan shelf stock, conduct physical inventory counts, and submit discrepancy variance logs. <strong>Blocked from POS Billing.</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role 3: Both Billing & Auditing */}
                                    <div
                                        onClick={() => setNewStaffRole('STORE_MANAGER')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.85rem',
                                            padding: '0.85rem 1rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            border: newStaffRole === 'STORE_MANAGER' ? '2px solid var(--pos-gold-primary)' : '1px solid var(--pos-border-subtle)',
                                            background: newStaffRole === 'STORE_MANAGER' ? 'rgba(212, 175, 55, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--pos-gold-light)', marginTop: '2px' }}>
                                            <Shield size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ color: 'var(--pos-gold-light)', fontSize: '0.9rem' }}>3. Both: Billing &amp; Auditing (Store Manager)</strong>
                                                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Dual Operational Access</span>
                                            </div>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--pos-text-secondary)', lineHeight: '1.4' }}>
                                                Dual operational supervisor with full access to both POS billing checkout counter AND physical store inventory audits.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStaffModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creatingStaff}>
                                    {creatingStaff ? 'Provisioning Staff...' : 'Provision Staff Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: STAFF CREDENTIALS SHARING                                          */}
            {/* ========================================================================== */}
            {createdStaffCreds && (
                <div className="modal-overlay" onClick={() => setCreatedStaffCreds(null)}>
                    <div 
                        className="modal-content" 
                        style={{ maxWidth: '480px', width: '95%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <CheckCircle size={44} style={{ color: 'var(--pos-accent-green)', marginBottom: '0.5rem' }} />
                            <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--pos-gold-light)', fontSize: '1.25rem' }}>
                                Staff Account Active!
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>
                                Employee profile has been created and assigned to this store.
                            </p>
                        </div>

                        <div style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '10px',
                            border: '1px solid var(--pos-border-gold)',
                            padding: '1rem',
                            marginBottom: '1.25rem',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Employee ID:</span>
                                <strong style={{ color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>{createdStaffCreds.employee_id}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Staff Name:</span>
                                <strong>{createdStaffCreds.name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Assigned Role:</span>
                                <span className="badge badge-gold">{createdStaffCreds.roleLabel}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Login Username:</span>
                                <strong style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{createdStaffCreds.username}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                                <span style={{ color: 'var(--pos-text-secondary)' }}>Password:</span>
                                <strong style={{ color: '#6ee7b7', fontFamily: 'monospace' }}>{createdStaffCreds.password}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleShareStaffCredentials(createdStaffCreds)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', color: '#25D366', borderColor: '#25D366' }}
                            >
                                <Share2 size={14} />
                                <span>Share Login via WhatsApp</span>
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleCopyStaffCredentials(createdStaffCreds)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                            >
                                <Copy size={14} />
                                <span>Copy Credentials to Clipboard</span>
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setCreatedStaffCreds(null)}
                                style={{ marginTop: '0.25rem' }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* MODAL: ITEMIZED PRODUCT COMMISSION & DUAL-WALLET BREAKDOWN               */}
            {/* ========================================================================== */}
            {selectedInvoice && (
                <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
                    <div 
                        className="modal-content" 
                        style={{ maxWidth: '880px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--pos-border-gold)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                                    <Sparkles size={22} style={{ color: 'var(--pos-gold-primary)' }} />
                                    <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.25rem' }}>
                                        Invoice Financial &amp; Commission Audit
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--pos-gold-light)', background: 'rgba(212, 175, 55, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--pos-border-gold)' }}>
                                        {selectedInvoice.invoice_number}
                                    </span>
                                    <span style={{ color: 'var(--pos-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Clock size={13} />
                                        {new Date(selectedInvoice.created_at).toLocaleString()}
                                    </span>
                                    <span className="badge badge-blue">{selectedInvoice.payment_method}</span>
                                    {selectedInvoice.franchise_name && (
                                        <span className="badge badge-gold">{selectedInvoice.franchise_name}</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => setSelectedInvoice(null)}
                                style={{ padding: '0.35rem 0.65rem', fontSize: '1.2rem', lineHeight: '1' }}
                                title="Close"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Top Financial Stat Chips */}
                        {(() => {
                            const grossTotal = parseFloat(selectedInvoice.total_price) || 0;
                            const netBaseTotal = parseFloat(selectedInvoice.net_base_amount !== undefined && selectedInvoice.net_base_amount !== null ? selectedInvoice.net_base_amount : (grossTotal / 1.18));
                            const commTotal = parseFloat(selectedInvoice.commission_amount !== undefined && selectedInvoice.commission_amount !== null ? selectedInvoice.commission_amount : (netBaseTotal * (commissionPercent / 100)));
                            const recoupTotal = parseFloat(selectedInvoice.principal_recovery_amount !== undefined && selectedInvoice.principal_recovery_amount !== null ? selectedInvoice.principal_recovery_amount : (netBaseTotal * 0.10));

                            const rawItems = Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 
                                ? selectedInvoice.items 
                                : [{
                                    id: 'fallback',
                                    product_name: 'Counter Sale Merchandise',
                                    product_sku: 'GEN-SALE',
                                    quantity: 1,
                                    unit_price: grossTotal,
                                    gst_percentage: 18,
                                    commission_percentage: commissionPercent,
                                    net_base_amount: netBaseTotal,
                                    wallet1_commission: commTotal,
                                    wallet2_recoup: recoupTotal
                                }];

                            return (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Bill Gross Total</span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>
                                                ₹{grossTotal.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 600 }}>Net Base (Excl. GST)</span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>
                                                ₹{netBaseTotal.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 600 }}>Wallet 1: Commission</span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6ee7b7' }}>
                                                + ₹{commTotal.toFixed(2)}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>Direct Store Commission Profit</span>
                                        </div>
                                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 600 }}>Wallet 2: Recouped (10%)</span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#93c5fd' }}>
                                                + ₹{recoupTotal.toFixed(2)}
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>Principal Capital Recovery</span>
                                        </div>
                                    </div>

                                    {/* Itemized Table */}
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--pos-gold-champagne)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Package size={16} /> Itemized Product Commission Breakdown ({rawItems.length} {rawItems.length === 1 ? 'item' : 'items'})
                                            </h4>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                                Each product calculated on Net Base amount
                                            </span>
                                        </div>

                                        <div className="table-responsive" style={{ border: '1px solid var(--pos-border-gold)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <table className="glass-table" style={{ margin: 0 }}>
                                                <thead style={{ background: 'rgba(212, 175, 55, 0.06)' }}>
                                                    <tr>
                                                        <th>Product / SKU</th>
                                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                                        <th style={{ textAlign: 'right' }}>MRP (Inc. GST)</th>
                                                        <th style={{ textAlign: 'right' }}>Net Base</th>
                                                        <th style={{ textAlign: 'center', color: '#6ee7b7' }}>Comm. %</th>
                                                        <th style={{ textAlign: 'right', color: '#6ee7b7' }}>Wallet 1</th>
                                                        <th style={{ textAlign: 'center', color: '#93c5fd' }}>Recoup %</th>
                                                        <th style={{ textAlign: 'right', color: '#93c5fd' }}>Wallet 2</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rawItems.map((it: any, idx: number) => {
                                                        const qty = safeNum(it.quantity, 1);
                                                        const unitPrice = parseFloat(it.unit_price || 0);
                                                        const itemGross = unitPrice * qty;
                                                        const itemGst = parseFloat(it.gst_percentage !== undefined && it.gst_percentage !== null ? it.gst_percentage : 18);
                                                        const itemNetBase = parseFloat(it.net_base_amount !== undefined && it.net_base_amount !== null ? it.net_base_amount : (itemGross / (1 + itemGst / 100)));
                                                        const itemCommRate = parseFloat(it.commission_percentage !== undefined && it.commission_percentage !== null ? it.commission_percentage : commissionPercent);
                                                        const itemWallet1 = parseFloat(it.wallet1_commission !== undefined && it.wallet1_commission !== null ? it.wallet1_commission : (itemNetBase * (itemCommRate / 100)));
                                                        const itemWallet2 = parseFloat(it.wallet2_recoup !== undefined && it.wallet2_recoup !== null ? it.wallet2_recoup : (itemNetBase * 0.10));

                                                        return (
                                                            <tr key={it.id || idx}>
                                                                <td>
                                                                    <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)' }}>
                                                                        {it.product_name || it.product_title || `Product #${idx + 1}`}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', fontFamily: 'monospace' }}>
                                                                        SKU: {it.product_sku || it.sku || 'N/A'} • GST: {itemGst}%
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                                    {qty}
                                                                </td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    <div>₹{itemGross.toFixed(2)}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--pos-text-secondary)' }}>
                                                                        (@ ₹{unitPrice.toFixed(2)})
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--pos-text-secondary)' }}>
                                                                    ₹{itemNetBase.toFixed(2)}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                                                                        {itemCommRate}%
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7' }}>
                                                                    + ₹{itemWallet1.toFixed(2)}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <span className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                                                                        10%
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#93c5fd' }}>
                                                                    + ₹{itemWallet2.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 'bold' }}>
                                                    <tr>
                                                        <td colSpan={3} style={{ textAlign: 'right', color: 'var(--pos-text-secondary)', fontSize: '0.85rem' }}>
                                                            Total Net &amp; Dual-Wallet Credits:
                                                        </td>
                                                        <td style={{ textAlign: 'right', color: 'var(--pos-text-primary)' }}>
                                                            ₹{netBaseTotal.toFixed(2)}
                                                        </td>
                                                        <td></td>
                                                        <td style={{ textAlign: 'right', color: '#6ee7b7', fontSize: '0.95rem' }}>
                                                            + ₹{commTotal.toFixed(2)}
                                                        </td>
                                                        <td></td>
                                                        <td style={{ textAlign: 'right', color: '#93c5fd', fontSize: '0.95rem' }}>
                                                            + ₹{recoupTotal.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Dual-Wallet Architecture Guidance Card */}
                                    <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--pos-border-gold)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', lineHeight: '1.5' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--pos-gold-champagne)', fontWeight: 'bold', marginBottom: '0.35rem' }}>
                                            <Shield size={15} />
                                            <span>Cavree Dual-Wallet Architecture:</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.4rem' }}>
                                            <div style={{ borderLeft: '2px solid #10b981', paddingLeft: '0.6rem' }}>
                                                <strong style={{ color: '#6ee7b7' }}>Wallet 1 (Commission Earning):</strong>
                                                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--pos-text-secondary)', fontSize: '0.78rem' }}>
                                                    Product sales commission calculated on Net Base price. This balance belongs directly to your franchise and can be requested for payout anytime.
                                                </p>
                                            </div>
                                            <div style={{ borderLeft: '2px solid #3b82f6', paddingLeft: '0.6rem' }}>
                                                <strong style={{ color: '#93c5fd' }}>Wallet 2 (10% Principal Recoup):</strong>
                                                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--pos-text-secondary)', fontSize: '0.78rem' }}>
                                                    A dedicated 10% from every sale automatically pays back your invested franchise principal capital towards ₹0 with Cavree buyout safety.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer Actions */}
                                    <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleShareWhatsApp(selectedInvoice)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#25D366', borderColor: '#25D366' }}
                                        >
                                            <Share2 size={14} />
                                            <span>Share Receipt on WhatsApp</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-primary" 
                                            onClick={() => setSelectedInvoice(null)}
                                        >
                                            Close Audit
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
