import React, { useEffect, useState } from 'react';
import {
    Store, DollarSign, Package, Users, ArrowRightLeft, Power,
    Plus, Shield, Send, Search, CheckCircle, AlertTriangle,
    TrendingUp, ArrowUpRight, Wallet, Percent, Clock, Sparkles, Filter,
    ShoppingCart, ArrowRight, Share2, Printer, Check, RefreshCw, X
} from 'lucide-react';
import { dashboardService, catalogService, transferService, employeeService, orderService } from '../services/api';
import '../styles/website.css';

interface FranchiseDashboardProps {
    onNavigateToBilling?: () => void;
    onNavigateToAudit?: () => void;
}

export default function FranchiseDashboard({ onNavigateToBilling, onNavigateToAudit }: FranchiseDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'products' | 'wallet'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search States
    const [productSearch, setProductSearch] = useState('');
    const [productStockFilter, setProductStockFilter] = useState<'all' | 'low' | 'out'>('all');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [invoiceSearch, setInvoiceSearch] = useState('');

    // Stock Transfer Form
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [transferQty, setTransferQty] = useState('');
    const [transferSubmitting, setTransferSubmitting] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

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
            
            if (prodRes.data && prodRes.data.length > 0) {
                setSelectedProductId(prodRes.data[0].id);
            }
        } catch (err) {
            console.error("Failed to load franchise dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleRequestTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !transferQty) return;
        setTransferSubmitting(true);

        try {
            await transferService.requestTransfer({
                product_id: selectedProductId,
                quantity: parseInt(transferQty)
            });
            setTransferQty('');
            setShowTransferModal(false);
            alert("Stock transfer request sent to Central Warehouse successfully!");
            loadDashboardData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to submit transfer request.");
        } finally {
            setTransferSubmitting(false);
        }
    };

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

    const handleShareWhatsApp = (order: any) => {
        const phone = order.customer_phone?.replace(/[^0-9]/g, '') || '';
        const itemsSummary = order.items?.map((it: any) => `• ${it.product_name} x ${it.quantity} = ₹${(parseFloat(it.unit_price) * it.quantity).toFixed(2)}`).join('%0A') || '';
        const text = `🛍️ *CAVREE INVOICE RECEIPT*%0AStore: ${stats?.name || storeName}%0AInvoice No: *${order.invoice_number}*%0ADate: ${new Date(order.created_at).toLocaleDateString()}%0A%0A*Items:*%0A${itemsSummary}%0A%0A*Total Paid: ₹${parseFloat(order.total_price).toFixed(2)}*%0A%0AThank you for shopping at Cavree!`;
        const targetPhone = phone && phone.length === 10 ? `91${phone}` : phone;
        window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    };

    // Filter Products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                              p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                              (p.barcode && p.barcode.includes(productSearch));
        
        const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
        const qty = franchiseInv.quantity || 0;
        const minLevel = p.minimum_stock_level || 5;

        if (productStockFilter === 'out') return matchesSearch && qty === 0;
        if (productStockFilter === 'low') return matchesSearch && qty > 0 && qty <= minLevel;
        return matchesSearch;
    });

    const lowStockCount = products.filter(p => {
        const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
        return (franchiseInv.quantity || 0) <= (p.minimum_stock_level || 5);
    }).length;

    // Filter Employees
    const filteredEmployees = employees.filter(emp => 
        (emp.employee_id && emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.first_name && emp.user.first_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.last_name && emp.user.last_name.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.username && emp.user.username.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.user?.email && emp.user.email.toLowerCase().includes(employeeSearch.toLowerCase())) ||
        (emp.role && emp.role.toLowerCase().includes(employeeSearch.toLowerCase()))
    );

    // Filter Invoices
    const filteredInvoices = orders.filter(o => 
        o.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        o.customer_phone.includes(invoiceSearch) ||
        o.customer_name.toLowerCase().includes(invoiceSearch.toLowerCase())
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
                marginBottom: '2rem',
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
                            ⚡ {commissionPercent}% Commission Rate
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.25rem 0', color: 'var(--pos-text-primary)' }}>
                        Welcome, <span style={{ background: 'var(--pos-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{adminName}</span>
                    </h1>
                    <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 0 0', maxWidth: '650px', lineHeight: '1.5' }}>
                        Franchise Executive Dashboard &bull; Manage live store employees, monitor shelf inventory, track central consignments, and audit dynamic commission earnings.
                    </p>
                </div>

                {/* Quick Action Trigger Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {onNavigateToBilling && (
                        <button
                            className="btn btn-primary"
                            onClick={onNavigateToBilling}
                            style={{ padding: '0.85rem 1.4rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <ShoppingCart size={18} />
                            <span>Launch POS Billing</span>
                            <ArrowRight size={15} />
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowTransferModal(true)}
                        style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                        <ArrowRightLeft size={16} />
                        <span>+ Request Consignment</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================== */}
            {/* 4 LUXURY KPI COMMAND CARDS (2 Columns on Mobile with Reduced Size)         */}
            {/* ========================================================================== */}
            <div className="kpi-grid">
                
                {/* 1. Live Wallet Balance */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)', cursor: 'pointer' }} onClick={() => setActiveTab('wallet')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Live Wallet
                        </span>
                        <Wallet size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-gold-light)' }}>
                        ₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Net commission</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--pos-gold-light)', fontWeight: 'bold' }}>Payout &rarr;</span>
                    </div>
                </div>

                {/* 2. Today's Gross Sales & Commission */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)', cursor: 'pointer' }} onClick={() => setActiveTab('wallet')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Today's Sales
                        </span>
                        <TrendingUp size={18} style={{ color: 'var(--pos-accent-green)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: '#6ee7b7' }}>
                        ₹{parseFloat(stats?.sales_today || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>Today</span>
                        <span style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 'bold' }}>+{commissionPercent}% Comm</span>
                    </div>
                </div>

                {/* 3. Active Shelf Stock */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)', cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span className="kpi-label" style={{ textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                            Shelf Stock
                        </span>
                        <Package size={18} style={{ color: 'var(--pos-gold-metallic)' }} />
                    </div>
                    <div className="kpi-val" style={{ color: 'var(--pos-text-primary)' }}>
                        {stats?.active_stock_count || 0} <span style={{ fontSize: '0.8rem', color: 'var(--pos-text-secondary)' }}>units</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid var(--pos-border-subtle)' }}>
                        <span className="kpi-sub" style={{ color: 'var(--pos-text-secondary)' }}>{products.length} SKUs</span>
                        {lowStockCount > 0 ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                                {lowStockCount} Low
                            </span>
                        ) : (
                            <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>Good</span>
                        )}
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
            {/* NAVIGATION TABS FOR FRANCHISE COMMAND (Overview / Employees / Products / Wallet) */}
            {/* ========================================================================== */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid var(--pos-border-gold)',
                paddingBottom: '0.85rem',
                marginBottom: '1.75rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <button
                    className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
                >
                    <TrendingUp size={14} />
                    <span>📊 Command Overview</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('employees')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
                >
                    <Users size={14} />
                    <span>👥 Store Employees ({employees.length})</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('products')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
                >
                    <Package size={14} />
                    <span>📦 Products &amp; Shelf Inventory ({products.length})</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('wallet')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}
                >
                    <Wallet size={14} />
                    <span>💰 Live Wallet &amp; Ledger (₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN')})</span>
                </button>
            </div>

            {/* ========================================================================== */}
            {/* TAB 1: OVERVIEW & COMMAND HUB                                             */}
            {/* ========================================================================== */}
            {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 4 Interactive Quick-Action Command Modules */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        
                        {/* Module 1: POS Billing */}
                        <div
                            className="glass-panel"
                            style={{ cursor: 'pointer', borderTop: '4px solid var(--pos-gold-primary)', transition: 'transform 0.2s' }}
                            onClick={() => onNavigateToBilling ? onNavigateToBilling() : null}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--pos-gold-gradient-subtle)', color: 'var(--pos-gold-primary)', border: '1px solid var(--pos-border-gold)' }}>
                                    <ShoppingCart size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                        Counter POS Billing
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>QR Scanner &bull; Laser &bull; mPOS</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Scan tags, process instant checkout, deduct store stock, and calculate GST.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-light)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Open Billing Terminal</span>
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
                                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-champagne)' }}>
                                        Store Staff Directory
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{employees.length} Staff Members</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Assign roles (Cashiers, Managers, Auditors), toggle active access, and add employees.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-champagne)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Manage Employees</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        {/* Module 3: Inventory & Consignments */}
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
                                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: '#6ee7b7' }}>
                                        Shelf Inventory
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{stats?.active_stock_count || 0} Units in Stock</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                View stock levels, low-stock warnings, and request additional consignment from Central Warehouse.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-accent-green)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>Inspect Inventory</span>
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
                                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)' }}>
                                        Commission Ledger
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{commissionPercent}% Net Share</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                                Transparent per-bill commission earnings, GST deductions, and bank payout requests.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--pos-gold-light)', fontWeight: 'bold', fontSize: '0.8125rem', gap: '0.35rem' }}>
                                <span>View Wallet &amp; Ledger</span>
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
                                                            <div style={{ fontWeight: 600 }}>{ord.customer_name || 'Walk-in'}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>{ord.customer_phone}</div>
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
                                <button className="btn btn-primary btn-sm" onClick={() => setShowTransferModal(true)}>
                                    + Request Transfer
                                </button>
                            </div>

                            {transfers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Tracking #</th>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transfers.slice(0, 5).map((t) => (
                                                <tr key={t.id}>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                        {t.transfer_number}
                                                    </td>
                                                    <td>{t.product_name}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{t.quantity}</td>
                                                    <td>
                                                        <span className={`badge ${t.status === 'RECEIVED' ? 'badge-success' : (t.status === 'IN_TRANSIT' ? 'badge-primary' : 'badge-warning')}`}>
                                                            {t.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {t.status === 'IN_TRANSIT' ? (
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleReceiveTransfer(t.id)}
                                                                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                                                                title="Accept package and add to store shelf stock"
                                                            >
                                                                📥 Receive Stock
                                                            </button>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                                                {t.status === 'RECEIVED' ? '✓ Stocked' : 'Awaiting Dispatch'}
                                                            </span>
                                                        )}
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
                            <h2 style={{ fontSize: '1.35rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                    <label className="form-label">Assigned Role *</label>
                                    <select 
                                        className="form-input form-select" 
                                        value={empRole} 
                                        onChange={(e) => setEmpRole(e.target.value)}
                                    >
                                        <option value="CASHIER">Cashier / POS Operator</option>
                                        <option value="STORE_MANAGER">Store Manager</option>
                                        <option value="INVENTORY_MANAGER">Inventory Manager</option>
                                        <option value="SALES_EXECUTIVE">Sales Executive</option>
                                        <option value="AUDITOR">Store Auditor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Initial Password *</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Set employee password" 
                                        value={empPassword} 
                                        onChange={(e) => setEmpPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={empSubmitting}>
                                    {empSubmitting ? 'Registering Employee...' : 'Submit & Generate Employee ID'}
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
            {/* TAB 3: PRODUCTS & SHELF INVENTORY                                         */}
            {/* ========================================================================== */}
            {activeTab === 'products' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Store Products &amp; Shelf Inventory ({filteredProducts.length})
                            </h2>
                            <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                Real-time quantities on shelf at {stats?.name || storeName}, minimum thresholds, and consignment requests.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Stock Filter Pills */}
                            <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--pos-border-gold)' }}>
                                <button
                                    className={`btn btn-sm ${productStockFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setProductStockFilter('all')}
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                                >
                                    All ({products.length})
                                </button>
                                <button
                                    className={`btn btn-sm ${productStockFilter === 'low' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setProductStockFilter('low')}
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                                >
                                    Low Stock
                                </button>
                                <button
                                    className={`btn btn-sm ${productStockFilter === 'out' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setProductStockFilter('out')}
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                                >
                                    Out of Stock
                                </button>
                            </div>

                            <div style={{ position: 'relative', minWidth: '240px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by SKU, Barcode, Name..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                                />
                                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                            </div>

                            <button className="btn btn-primary" onClick={() => setShowTransferModal(true)}>
                                <ArrowRightLeft size={15} /> + Request Consignment
                            </button>
                        </div>
                    </div>

                    {/* Product Inventory Table (Clean Product Name, Price, Stock) */}
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th style={{ textAlign: 'center' }}>Price</th>
                                    <th style={{ textAlign: 'center' }}>Stock</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((p) => {
                                        const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
                                        const qty = franchiseInv.quantity || 0;
                                        const minStock = p.minimum_stock_level || 5;

                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: 'var(--pos-text-primary)', fontSize: '0.9375rem' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                                        {p.sku} {p.size ? `• Size: ${p.size}` : ''}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontSize: '1rem' }}>
                                                    ₹{parseFloat(p.selling_price).toFixed(2)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        fontSize: '1.05rem',
                                                        fontWeight: 'bold',
                                                        color: qty === 0 ? 'var(--pos-accent-red)' : (qty <= minStock ? '#fde047' : '#6ee7b7')
                                                    }}>
                                                        {qty}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', marginLeft: '0.25rem' }}>units</span>
                                                    {qty === 0 && <span className="badge badge-danger" style={{ marginLeft: '0.4rem', fontSize: '0.62rem' }}>Out</span>}
                                                    {qty > 0 && qty <= minStock && <span className="badge badge-warning" style={{ marginLeft: '0.4rem', fontSize: '0.62rem' }}>Low</span>}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => {
                                                            setSelectedProductId(p.id);
                                                            setShowTransferModal(true);
                                                        }}
                                                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                                    >
                                                        Request Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--pos-text-secondary)' }}>
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================================================== */}
            {/* TAB 4: LIVE WALLET & TRANSACTION COMMISSION LEDGER                        */}
            {/* ========================================================================== */}
            {activeTab === 'wallet' && (
                <div>
                    {/* Financial Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Current Wallet Balance
                                    </span>
                                    <h2 style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-light)' }}>
                                        ₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </h2>
                                </div>
                                <Wallet size={28} style={{ color: 'var(--pos-gold-primary)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Available for bank payout</span>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowPayoutModal(true)}>
                                    Request Payout
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Franchise Commission Rate
                                    </span>
                                    <h2 style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: '#6ee7b7' }}>
                                        {commissionPercent}%
                                    </h2>
                                </div>
                                <Percent size={28} style={{ color: 'var(--pos-accent-green)' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.65rem 0 0 0' }}>
                                Contractual commission applied on net merchandise revenue
                            </p>
                        </div>

                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Registered Capital Structure
                                    </span>
                                    <h2 style={{ fontSize: '2rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-champagne)' }}>
                                        ₹{parseFloat(stats?.investment_amount || 0).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                                <Store size={28} style={{ color: 'var(--pos-gold-champagne)' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.65rem 0 0 0' }}>
                                Initial invested capital for {stats?.name || storeName}
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
                                    Breakdown of sales revenue and calculated franchise commission credit.
                                </p>
                            </div>

                            <div style={{ position: 'relative', minWidth: '260px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by Invoice # or Customer Phone..."
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
                                                        <div style={{ fontWeight: 600 }}>{ord.customer_name || 'Walk-in'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{ord.customer_phone}</div>
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
            {/* MODAL: REQUEST STOCK CONSIGNMENT                                          */}
            {/* ========================================================================== */}
            {showTransferModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '480px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowRightLeft size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Request Stock Consignment
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(false)}>
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleRequestTransfer}>
                            <div className="form-group">
                                <label className="form-label">Select Product from Catalog *</label>
                                <select 
                                    className="form-input form-select"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                                    required
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.sku} &bull; {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Requested Quantity (Units) *</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    placeholder="e.g. 50" 
                                    value={transferQty}
                                    onChange={(e) => setTransferQty(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={transferSubmitting}>
                                    <Send size={15} />
                                    <span>{transferSubmitting ? 'Submitting...' : 'Send Request to Admin'}</span>
                                </button>
                            </div>
                        </form>
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
                                    <label className="form-label">Available Wallet Balance</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'Cinzel, serif', padding: '0.5rem 0' }}>
                                        ₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                                        max={stats?.wallet_balance || 999999}
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
