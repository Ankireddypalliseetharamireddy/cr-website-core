import React, { useEffect, useState } from 'react';
import {
    Store, DollarSign, Package, Users, ArrowRightLeft, Power,
    Plus, Shield, Send, Search, CheckCircle, AlertTriangle,
    TrendingUp, ArrowUpRight, Wallet, Percent, Clock, Sparkles, Filter
} from 'lucide-react';
import { dashboardService, catalogService, transferService, employeeService, orderService } from '../services/api';
import '../styles/website.css';

export default function FranchiseDashboard() {
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

    if (loading) {
        return (
            <div className="main-content">
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--pos-text-secondary)' }}>
                    <p>Loading franchise store analytics &amp; management ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            
            {/* Top Store Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-gold">
                            <Store size={12} style={{ marginRight: '0.3rem' }} />
                            {stats?.name || 'Franchise Store Operations'}
                        </span>
                        <span className="badge badge-blue">
                            Location: {stats?.location || 'Indiranagar, Bangalore'}
                        </span>
                        <span className="badge badge-purple">
                            Commission: {commissionPercent}%
                        </span>
                    </div>
                    <h1 className="page-title" style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        Franchise Administration &amp; Operations
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setShowTransferModal(true)}>
                        <ArrowRightLeft size={15} /> Request Stock Consignment
                    </button>
                    <button className="btn btn-primary" onClick={() => { setActiveTab('employees'); setShowAddForm(true); }}>
                        <Plus size={15} /> Add Store Employee
                    </button>
                </div>
            </div>

            {/* Navigation Filter Tabs for Franchise Admin (Overview / Employees / Products / Wallet) */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid var(--pos-border-gold)',
                paddingBottom: '0.75rem',
                marginBottom: '1.75rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <button
                    className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                    <TrendingUp size={14} />
                    <span>📊 Store Overview</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('employees')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                    <Users size={14} />
                    <span>👥 Store Employees ({employees.length})</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('products')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                    <Package size={14} />
                    <span>📦 Products &amp; Stock ({products.length})</span>
                </button>

                <button
                    className={`btn btn-sm ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('wallet')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                    <Wallet size={14} />
                    <span>💰 Wallet &amp; Earnings (₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN')})</span>
                </button>
            </div>

            {/* ========================================== */}
            {/* TAB 1: OVERVIEW                            */}
            {/* ========================================== */}
            {activeTab === 'overview' && (
                <div>
                    {/* 4 KPI Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        
                        {/* Live Wallet Balance */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)', cursor: 'pointer' }} onClick={() => setActiveTab('wallet')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Live Wallet Balance
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-light)' }}>
                                        ₹{parseFloat(stats?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </h2>
                                </div>
                                <DollarSign size={26} style={{ color: 'var(--pos-gold-primary)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Commission earnings</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center' }}>View &rarr;</span>
                            </div>
                        </div>

                        {/* Active Store Stock */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)', cursor: 'pointer' }} onClick={() => setActiveTab('products')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Active Store Stock
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: '#6ee7b7' }}>
                                        {stats?.active_stock_count || 0} <span style={{ fontSize: '0.9rem', color: 'var(--pos-text-secondary)' }}>units</span>
                                    </h2>
                                </div>
                                <Package size={26} style={{ color: 'var(--pos-accent-green)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Across {products.length} SKUs</span>
                                <span style={{ fontSize: '0.75rem', color: '#6ee7b7', display: 'flex', alignItems: 'center' }}>Manage &rarr;</span>
                            </div>
                        </div>

                        {/* Active Store Staff */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)', cursor: 'pointer' }} onClick={() => setActiveTab('employees')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        Store Staff Members
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-champagne)' }}>
                                        {employees.length} <span style={{ fontSize: '0.9rem', color: 'var(--pos-text-secondary)' }}>staff</span>
                                    </h2>
                                </div>
                                <Users size={26} style={{ color: 'var(--pos-gold-champagne)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Assigned to this store</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--pos-gold-champagne)', display: 'flex', alignItems: 'center' }}>Directory &rarr;</span>
                            </div>
                        </div>

                        {/* All-time Sales */}
                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                        All-Time Gross Sales
                                    </span>
                                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-light)' }}>
                                        ₹{parseFloat(stats?.total_sold_all_time || 0).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                                <Sparkles size={26} style={{ color: 'var(--pos-gold-metallic)' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>Total billed transactions</p>
                        </div>
                    </div>

                    {/* Quick Split Preview: Recent Consignments & Top Selling SKUs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Top Selling Products */}
                        <div className="glass-panel">
                            <h3 className="panel-title">
                                <Sparkles size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                Top Selling Store Products
                            </h3>
                            {stats?.top_products && stats.top_products.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th style={{ textAlign: 'right' }}>Units Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top_products.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 600 }}>{item.product__name}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                                        {item.total_qty} units
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--pos-text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
                                    No sales transactions recorded yet.
                                </p>
                            )}
                        </div>

                        {/* Recent Stock Consignment Transfers */}
                        <div className="glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    <ArrowRightLeft size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Recent Consignment Transfers
                                </h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowTransferModal(true)}>
                                    + Request Transfer
                                </button>
                            </div>
                            {transfers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="glass-table">
                                        <thead>
                                            <tr>
                                                <th>Transfer #</th>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transfers.slice(0, 5).map((t) => (
                                                <tr key={t.id}>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>{t.transfer_number}</td>
                                                    <td>{t.product_name}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{t.quantity}</td>
                                                    <td>
                                                        <span className={`badge ${t.status === 'RECEIVED' ? 'badge-success' : (t.status === 'IN_TRANSIT' ? 'badge-primary' : 'badge-warning')}`}>
                                                            {t.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--pos-text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
                                    No pending consignment transfers.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* TAB 2: STORE EMPLOYEES                     */}
            {/* ========================================== */}
            {activeTab === 'employees' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Store Employees Directory ({filteredEmployees.length})
                            </h2>
                            <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                Active staff assigned to {stats?.name || 'this franchise'}. Add new staff members or manage access.
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

            {/* ========================================== */}
            {/* TAB 3: PRODUCTS & SHELF INVENTORY          */}
            {/* ========================================== */}
            {activeTab === 'products' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: 0, color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={20} style={{ color: 'var(--pos-gold-primary)' }} />
                                Store Products &amp; Shelf Inventory ({filteredProducts.length})
                            </h2>
                            <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                                Real-time quantities on shelf at {stats?.name || 'Store'}, minimum thresholds, and consignment requests.
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

                    {/* Product Inventory Table */}
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>SKU &amp; Barcode</th>
                                    <th>Product Title</th>
                                    <th>Size &amp; Attributes</th>
                                    <th>Unit Selling Price</th>
                                    <th style={{ textAlign: 'center' }}>Live Shelf Stock</th>
                                    <th style={{ textAlign: 'center' }}>Stock Status</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((p) => {
                                        const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
                                        const qty = franchiseInv.quantity || 0;
                                        const minStock = p.minimum_stock_level || 5;
                                        
                                        let statusLabel = 'In Stock';
                                        let statusClass = 'badge-success';
                                        if (qty === 0) {
                                            statusLabel = 'Out of Stock';
                                            statusClass = 'badge-danger';
                                        } else if (qty <= minStock) {
                                            statusLabel = `Low Stock (<= ${minStock})`;
                                            statusClass = 'badge-warning';
                                        }

                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                        {p.sku}
                                                    </div>
                                                    {p.barcode && (
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--pos-text-secondary)' }}>
                                                            {p.barcode}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '0.8125rem', color: 'var(--pos-text-secondary)' }}>
                                                        Size: {p.size || 'Free'} &bull; GST: {p.gst_percentage}%
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>
                                                    ₹{parseFloat(p.selling_price).toFixed(2)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: qty === 0 ? 'var(--pos-accent-red)' : (qty <= minStock ? '#fde047' : 'var(--pos-text-primary)') }}>
                                                        {qty}
                                                    </span> units
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`badge ${statusClass}`}>{statusLabel}</span>
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
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--pos-text-secondary)' }}>
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* TAB 4: WALLET & COMMISSIONS                */}
            {/* ========================================== */}
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
                            <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.65rem 0 0 0' }}>
                                Accumulated commissions earned on counter sales
                            </p>
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
                                Initial invested capital for {stats?.name || 'this branch'}
                            </p>
                        </div>
                    </div>

                    {/* Sales & Commission Breakdown Ledger */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                    <TrendingUp size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                    Transaction Commission Ledger ({orders.length} Invoices)
                                </h3>
                                <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.2rem 0 0 0' }}>
                                    Breakdown of sales revenue and calculated franchise commission credit.
                                </p>
                            </div>
                        </div>

                        {orders.length > 0 ? (
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((ord) => {
                                            const gross = parseFloat(ord.total_price) || 0;
                                            // 15% estimated net commission on sales
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
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                                No sales transactions yet to calculate commission earnings.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL: REQUEST STOCK CONSIGNMENT           */}
            {/* ========================================== */}
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
        </div>
    );
}
