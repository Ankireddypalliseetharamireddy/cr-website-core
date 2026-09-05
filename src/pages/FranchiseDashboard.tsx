import React, { useEffect, useState } from 'react';
import {
    Store, DollarSign, Package, Users, ArrowRightLeft, Power,
    Plus, Shield, Send, Search, CheckCircle, AlertTriangle,
    TrendingUp, ArrowUpRight, Wallet, Percent, Clock, Sparkles, Filter,
    ShoppingCart, ArrowRight, Share2, Printer, Check, RefreshCw, X, Calendar, FileText
} from 'lucide-react';
import { dashboardService, catalogService, transferService, employeeService, orderService } from '../services/api';
import '../styles/website.css';

interface FranchiseDashboardProps {
    onNavigateToBilling?: () => void;
    onNavigateToAudit?: () => void;
    onNavigateToReceiving?: () => void;
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

export default function FranchiseDashboard({ onNavigateToBilling, onNavigateToAudit, onNavigateToReceiving }: FranchiseDashboardProps) {
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

    // Agreement Renewal Modal State
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [renewalSubmitted, setRenewalSubmitted] = useState(false);
    const [renewalNotes, setRenewalNotes] = useState('');

    // Add Employee Form States
    const [showAddForm, setShowAddForm] = useState(false);
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empRole, setEmpRole] = useState('CASHIER');
    const [empPassword, setEmpPassword] = useState('');
    const [empSubmitting, setEmpSubmitting] = useState(false);

    // Payout Request Modal
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutUpi, setPayoutUpi] = useState('');
    const [payoutSuccess, setPayoutSuccess] = useState(false);

    const adminName = localStorage.getItem('username') || 'Franchise Admin';
    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, prodRes, transRes, empRes, ordRes] = await Promise.all([
                dashboardService.getFranchiseStats(),
                catalogService.getProducts(),
                transferService.getTransfers(),
                employeeService.getEmployees(),
                orderService.getOrders().catch(() => ({ data: [] }))
            ]);

            setStats(statsRes.data);
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

    const handleReceiveTransfer = async (transferId: number) => {
        try {
            await transferService.updateTransferStatus(transferId, 'RECEIVED');
            alert("Consignment marked as RECEIVED! Store shelf stock has been updated.");
            loadDashboardData();
        } catch (err: any) {
            console.error("Receive transfer error", err);
            alert(err.response?.data?.error || "Failed to receive consignment.");
        }
    };

    const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empName || !empEmail || !empPassword) return;
        setEmpSubmitting(true);

        try {
            const res = await employeeService.createEmployee({
                name: empName,
                email: empEmail,
                role: empRole,
                password: empPassword
            });

            alert(`Employee registered successfully! Generated Employee ID is: ${res.data.employee_id}. Awaiting Super Admin approval.`);
            setEmpName('');
            setEmpEmail('');
            setEmpPassword('');
            setEmpRole('CASHIER');
            setShowAddForm(false);
            loadDashboardData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || "Registration failed. Verify inputs.");
        } finally {
            setEmpSubmitting(false);
        }
    };

    const handleToggleEmployeeActive = async (empId: number) => {
        try {
            await employeeService.toggleEmployeeActive(empId);
            loadDashboardData();
        } catch (err) {
            console.error("Toggle employee active failed", err);
        }
    };

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

    // Filter Employees
    const filteredEmployees = employees.filter(emp => 
        (emp.employee_id && emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.first_name && emp.user.first_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.last_name && emp.user.last_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.username && emp.user.username.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.email && emp.user.email.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.role && emp.role.toLowerCase().includes(employeeSearch.toLowerCase()))
    );

    // Filter Invoices (Search by Invoice # or Payment Method, customer phone is hidden for privacy)
    const filteredInvoices = orders.filter(o => 
        (o.invoice_number && o.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase())) ||
        (o.payment_method && o.payment_method.toLowerCase().includes(invoiceSearch.toLowerCase()))
    );

    const commissionPercent = parseFloat(stats?.commission_percentage || '15');

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
                        Franchise Executive Dashboard &bull; Manage live store employees, monitor high-level inventory valuation, track central consignments, and audit two-wallet earnings.
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
                            Agreement Minimum Guarantee Target: ₹{parseFloat(stats?.minimum_guarantee_target || 0).toLocaleString('en-IN')} {stats?.minimum_guarantee_target ? `(${formatIndianCurrency(stats?.minimum_guarantee_target)})` : ''}
                        </h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            ★ <strong>Cavree Buyout Guarantee:</strong> If your invested principal is not recouped to ₹0 within {stats?.agreement_years || 6} years, Cavree contractually pays the remaining balance. If completed earlier, commission payouts continue through the full agreement tenure.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#6ee7b7' }}>
                                ₹{parseFloat(stats?.cumulative_net_sales || stats?.total_sold_all_time || 0).toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>net sales accrued</span>
                        </div>
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '8px', overflow: 'hidden', minWidth: '220px' }}>
                            <div style={{
                                width: `${Math.min(100, stats?.guarantee_target_progress || 0)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #d4af37)',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                            <span>{stats?.guarantee_target_progress || 0}% of Target Met</span>
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
                        ₹{parseFloat(stats?.commission_wallet_balance || stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        ₹{parseFloat(stats?.invested_wallet_balance !== undefined && stats?.invested_wallet_balance !== null ? stats?.invested_wallet_balance : stats?.investment_amount).toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>10% Net Billings</span>
                        <span style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 'bold' }}>₹{parseFloat(stats?.recovered_investment || 0).toLocaleString('en-IN')} recouped</span>
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
                        ₹{parseFloat(stats?.current_shelf_inventory_value || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Consigned Worth</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>₹{parseFloat(stats?.total_consignment_received_value || 0).toLocaleString('en-IN')}</span>
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
                                Target: ₹{parseFloat(stats?.minimum_guarantee_target || 0).toLocaleString('en-IN')} &bull; {stats?.guarantee_target_progress || 0}% realized via net sales.
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
                                Assign roles (Cashiers, Managers, Auditors), toggle active access, and register staff.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-champagne)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Manage Employees</span>
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
                                                <th>Customer</th>
                                                <th>Total Bill</th>
                                                <th style={{ textAlign: 'right' }}>Commission ({commissionPercent}%)</th>
                                                <th style={{ textAlign: 'center' }}>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map((ord) => {
                                                const gross = parseFloat(ord.total_price) || 0;
                                                const comm = gross * (commissionPercent / 100);

                                                return (
                                                    <tr key={ord.id}>
                                                        <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                            {ord.invoice_number}
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>Verified Buyer</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>••••••••••</div>
                                                        </td>
                                                        <td style={{ fontWeight: 'bold' }}>
                                                            ₹{gross.toFixed(2)}
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7' }}>
                                                            +₹{comm.toFixed(2)}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleShareWhatsApp(ord)}
                                                                style={{ padding: '0.25rem 0.5rem' }}
                                                                title="Share Invoice on WhatsApp"
                                                            >
                                                                <Share2 size={12} style={{ color: '#25D366' }} />
                                                            </button>
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
                                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                                    Central Logistics
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
                                Active staff assigned to {stats?.name || storeName}. Add new staff members or manage roles.
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

                            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                                <Plus size={15} /> Add New Employee
                            </button>
                        </div>
                    </div>

                    {/* Add Employee Form Drawer/Panel */}
                    {showAddForm && (
                        <form onSubmit={handleAddEmployeeSubmit} className="glass-panel" style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', marginBottom: '1.75rem', border: '1px solid var(--pos-gold-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={18} /> Register New Store Employee
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Will be submitted for Super Admin Approval</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="form-label">Full Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. Rahul Sharma" 
                                        value={empName}
                                        onChange={(e) => setEmpName(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Email Address *</label>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="e.g. rahul@cavree.com" 
                                        value={empEmail}
                                        onChange={(e) => setEmpEmail(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Assigned Role</label>
                                    <select 
                                        className="form-input form-select"
                                        value={empRole}
                                        onChange={(e) => setEmpRole(e.target.value)}
                                    >
                                        <option value="CASHIER">Store Cashier</option>
                                        <option value="STORE_MANAGER">Store Manager</option>
                                        <option value="INVENTORY_MANAGER">Inventory Auditor</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Login Password *</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Min. 6 characters" 
                                        value={empPassword}
                                        onChange={(e) => setEmpPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={empSubmitting}>
                                    <Check size={16} />
                                    <span>{empSubmitting ? 'Registering...' : 'Save & Submit Employee'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Employee Table */}
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Staff Member</th>
                                    <th>Assigned Role</th>
                                    <th>Approval Status</th>
                                    <th style={{ textAlign: 'center' }}>Account Status</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
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
                                                <span className="badge badge-gold">{emp.role.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.approval_status === 'APPROVED' ? 'badge-success' : (emp.approval_status === 'REJECTED' ? 'badge-danger' : 'badge-warning')}`}>
                                                    {emp.approval_status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`badge ${emp.is_active_employee ? 'badge-success' : 'badge-danger'}`}>
                                                    {emp.is_active_employee ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className={`btn btn-sm ${emp.is_active_employee ? 'btn-secondary' : 'btn-danger'}`}
                                                    onClick={() => handleToggleEmployeeActive(emp.id)}
                                                    style={{ padding: '0.35rem 0.75rem' }}
                                                >
                                                    <Power size={12} /> {emp.is_active_employee ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--pos-text-secondary)' }}>
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
                                        ₹{parseFloat(stats?.invested_wallet_balance !== undefined && stats?.invested_wallet_balance !== null ? stats?.invested_wallet_balance : stats?.investment_amount).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                                <TrendingUp size={28} style={{ color: '#60a5fa' }} />
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--pos-text-secondary)' }}>Recouped via 10% Billings:</span>
                                    <span style={{ color: '#6ee7b7', fontWeight: 'bold' }}>₹{parseFloat(stats?.recovered_investment || 0).toLocaleString('en-IN')} ({stats?.recovery_percent || 0}%)</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, stats?.recovery_percent || 0)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #60a5fa, #10b981)',
                                        borderRadius: '999px'
                                    }} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                                Initial: ₹{parseFloat(stats?.investment_amount || 0).toLocaleString('en-IN')} &bull; Cavree contractually guarantees buyout of remaining balance if &gt; ₹0 at 6 years.
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
                                    <span style={{ color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>₹{parseFloat(stats?.cumulative_net_sales || stats?.total_sold_all_time || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, stats?.guarantee_target_progress || 0)}%`,
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

                    {/* Sales & Commission Breakdown Ledger */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    <TrendingUp size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Transaction Commission Ledger ({filteredInvoices.length} Invoices)
                                </h3>
                                <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.2rem 0 0 0' }}>
                                    Per-invoice ledger displaying gross billings, net base revenue, and investor commission allocations.
                                </p>
                            </div>

                            <div style={{ position: 'relative', minWidth: '280px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by Invoice # or Payment Method..."
                                    value={invoiceSearch}
                                    onChange={(e) => setInvoiceSearch(e.target.value)}
                                    style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                                />
                                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                            </div>
                        </div>

                        {filteredInvoices.length > 0 ? (
                            <div className="table-responsive">
                                <table className="glass-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Date &amp; Time</th>
                                            <th>Customer</th>
                                            <th>Total Bill Amount</th>
                                            <th>Payment Method</th>
                                            <th style={{ textAlign: 'right' }}>Calculated Commission ({commissionPercent}%)</th>
                                            <th style={{ textAlign: 'center' }}>Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((ord) => {
                                            const gross = parseFloat(ord.total_price) || 0;
                                            const comm = (gross * (commissionPercent / 100));

                                            return (
                                                <tr key={ord.id}>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                        {ord.invoice_number}
                                                    </td>
                                                    <td style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                                        {new Date(ord.created_at).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>Verified Buyer</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>••••••••••</div>
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>
                                                        ₹{gross.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-blue">{ord.payment_method}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#6ee7b7', fontSize: '0.9375rem' }}>
                                                        + ₹{comm.toFixed(2)}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleShareWhatsApp(ord)}
                                                            style={{ padding: '0.25rem 0.5rem' }}
                                                            title="Share on WhatsApp"
                                                        >
                                                            <Share2 size={12} style={{ color: '#25D366' }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                                No sales transactions found matching your filter.
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
        </div>
    );
}
