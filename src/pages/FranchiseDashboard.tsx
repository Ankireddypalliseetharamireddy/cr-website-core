import React, { useEffect, useState } from 'react';
import { Store, DollarSign, Package, Users, ArrowRightLeft, Power, Plus, Shield, Send } from 'lucide-react';
import { dashboardService, catalogService, transferService, employeeService } from '../services/api';
import '../styles/website.css';

export default function FranchiseDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Stock Transfer Form
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [transferQty, setTransferQty] = useState('');
    const [transferSubmitting, setTransferSubmitting] = useState(false);

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
            const [statsRes, prodRes, transRes, empRes] = await Promise.all([
                dashboardService.getFranchiseStats(),
                catalogService.getProducts(),
                transferService.getTransfers(),
                employeeService.getEmployees()
            ]);

            setStats(statsRes.data);
            setProducts(prodRes.data);
            setTransfers(transRes.data);
            setEmployees(empRes.data);
            
            if (prodRes.data.length > 0) {
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
            alert("Stock transfer request sent to Super Admin successfully!");
            loadDashboardData();
        } catch (err) {
            console.error(err);
            alert("Failed to submit transfer request.");
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

    if (loading) {
        return (
            <div className="main-content">
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--pos-text-secondary)' }}>
                    <p>Loading franchise store analytics &amp; inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            
            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.65rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Store size={24} style={{ color: 'var(--pos-gold-primary)' }} />
                        {stats?.name || 'Franchise Store Operations'}
                    </h1>
                    <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
                        Location: {stats?.location || 'Central Retail Branch'} &bull; Commission Rate: <strong style={{ color: 'var(--pos-gold-light)' }}>{stats?.commission_percentage}%</strong>
                    </p>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    <Plus size={16} /> Add Store Employee
                </button>
            </div>

            {/* 4 KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                
                {/* Wallet Balance */}
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>Commission earnings credited directly</p>
                </div>

                {/* Investment Capital */}
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-metallic)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                Invested Capital
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-text-primary)' }}>
                                ₹{parseFloat(stats?.investment_amount || 0).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <Store size={26} style={{ color: 'var(--pos-gold-metallic)' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>Registered store capital</p>
                </div>

                {/* All-time Sales */}
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                All-Time Gross Sales
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: '#6ee7b7' }}>
                                ₹{parseFloat(stats?.total_sold_all_time || 0).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <DollarSign size={26} style={{ color: 'var(--pos-accent-green)' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>Total sales volume at counter</p>
                </div>

                {/* Active Stock Count */}
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-champagne)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--pos-text-secondary)', fontWeight: 700 }}>
                                Active Store Stock
                            </span>
                            <h2 style={{ fontSize: '1.75rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.35rem 0 0 0', color: 'var(--pos-gold-light)' }}>
                                {stats?.active_stock_count || 0} <span style={{ fontSize: '0.9rem', color: 'var(--pos-text-secondary)' }}>units</span>
                            </h2>
                        </div>
                        <Package size={26} style={{ color: 'var(--pos-gold-champagne)' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)', margin: '0.5rem 0 0 0' }}>Total clothes available in shelf inventory</p>
                </div>
            </div>

            {/* Split Panel: Left (Stock Levels & Staff Ledger), Right (Request Transfers) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Left Column: Stock Levels & Staff Ledger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Inventory Table */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <Package size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                            Store Stock Levels
                        </h3>
                        <div className="table-responsive">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Product Details</th>
                                        <th>SKU</th>
                                        <th>Active Stock</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => {
                                        const franchiseInv = p.franchise_stock?.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
                                        const qty = franchiseInv.quantity || 0;
                                        
                                        let statusLabel = 'In Stock';
                                        let statusClass = 'badge-success';
                                        if (qty === 0) {
                                            statusLabel = 'Out of Stock';
                                            statusClass = 'badge-danger';
                                        } else if (qty <= (p.minimum_stock_level || 5)) {
                                            statusLabel = 'Low Stock';
                                            statusClass = 'badge-warning';
                                        }

                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>
                                                        Size: {p.size || 'Free'} &bull; Selling: ₹{p.selling_price}
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', color: 'var(--pos-gold-light)' }}>
                                                    {p.sku}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--pos-text-primary)' }}>{qty}</span> units
                                                </td>
                                                <td>
                                                    <span className={`badge ${statusClass}`}>{statusLabel}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Franchise Employees Ledger */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                                <Users size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                                Store Staff Directory
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                                <Plus size={14} /> Add Staff Member
                            </button>
                        </div>

                        {showAddForm && (
                            <form onSubmit={handleAddEmployeeSubmit} className="glass-panel" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--pos-border-gold)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} /> Register New Store Employee
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Full Name" 
                                        value={empName} 
                                        onChange={(e) => setEmpName(e.target.value)} 
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="Email Address" 
                                        value={empEmail} 
                                        onChange={(e) => setEmpEmail(e.target.value)} 
                                        required 
                                    />
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
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Initial Password" 
                                        value={empPassword} 
                                        onChange={(e) => setEmpPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={empSubmitting}>
                                        {empSubmitting ? 'Registering...' : 'Submit for Approval'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="table-responsive">
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Name / Username</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} style={{ opacity: emp.is_active_employee ? 1 : 0.5 }}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                {emp.employee_id || emp.user?.username}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{emp.user?.first_name} {emp.user?.last_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>{emp.user?.email}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-gold">{emp.role.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.approval_status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                                                    {emp.approval_status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className={`btn btn-sm ${emp.is_active_employee ? 'btn-secondary' : 'btn-danger'}`}
                                                    onClick={() => handleToggleEmployeeActive(emp.id)}
                                                    style={{ padding: '0.25rem 0.65rem' }}
                                                >
                                                    <Power size={11} /> {emp.is_active_employee ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Request Stock Transfer Form & Queue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Stock Transfer Request Form */}
                    <div className="glass-panel" style={{ borderTop: '4px solid var(--pos-gold-primary)' }}>
                        <h3 className="panel-title">
                            <ArrowRightLeft size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                            Request Stock Consignment
                        </h3>
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
                                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
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

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={transferSubmitting}>
                                <Send size={15} />
                                <span>{transferSubmitting ? 'Submitting Request...' : 'Send Transfer Request to Admin'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Active Consignment Status Queue */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <ArrowRightLeft size={18} style={{ color: 'var(--pos-gold-primary)' }} />
                            Active Consignment Queue
                        </h3>
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
                                    {transfers.length > 0 ? (
                                        transfers.map((t) => (
                                            <tr key={t.id}>
                                                <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)' }}>{t.transfer_number}</td>
                                                <td>{t.product_name}</td>
                                                <td style={{ fontWeight: 'bold' }}>{t.quantity}</td>
                                                <td>
                                                    <span className={`badge ${t.status === 'RECEIVED' ? 'badge-success' : (t.status === 'IN_TRANSIT' ? 'badge-primary' : 'badge-warning')}`}>
                                                        {t.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--pos-text-secondary)', padding: '1.5rem' }}>
                                                No pending transfer consignments.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
