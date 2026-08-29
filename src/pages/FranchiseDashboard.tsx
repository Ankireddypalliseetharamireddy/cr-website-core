import React, { useEffect, useState } from 'react';
import { Store, DollarSign, Package, Users, ArrowRightLeft, FileText, Power, Plus } from 'lucide-react';
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

    const handleToggleEmployee = async (id: number) => {
        try {
            await employeeService.toggleEmployeeActive(id);
            alert("Employee status toggled!");
            loadDashboardData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to toggle active status.");
        }
    };

    if (loading || !stats) {
        return <div className="main-content"><p>Loading franchise operation metrics...</p></div>;
    }

    return (
        <div className="main-content">
            
            {/* KPI Cards Grid */}
            <div className="grid-responsive">
                
                {/* Wallet Balance Card */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Wallet Balance (Earnings)</span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-green)' }}>
                                ₹{parseFloat(stats.wallet_balance || 0).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <DollarSign size={28} style={{ color: 'var(--accent-green)', opacity: 0.8 }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Dynamic UPI checkout commissions (excluding GST)</p>
                </div>

                {/* Investment Capital Card */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Invested Capital</span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#fff' }}>
                                ₹{parseFloat(stats.investment_amount || 0).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <Store size={28} style={{ color: 'var(--accent-purple)', opacity: 0.8 }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Initial registered capital structure</p>
                </div>

                {/* All-time Sales Card */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>All-Time Sales Revenue</span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
                                ₹{parseFloat(stats.total_sold_all_time || 0).toLocaleString('en-IN')}
                            </h2>
                        </div>
                        <DollarSign size={28} style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total store sales billing volume (inclusive of GST)</p>
                </div>

                {/* Active Stock Count Card */}
                <div className="kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-orange)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Active Store Stock</span>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--accent-orange)' }}>
                                {stats.active_stock_count || 0}
                            </h2>
                        </div>
                        <Package size={28} style={{ color: 'var(--accent-orange)', opacity: 0.8 }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total units of clothes currently in stock</p>
                </div>
            </div>

            {/* Split Panel: Left (Inventory & Staff Ledger), Right (Request Transfers) */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '1.5rem' }}>
                
                {/* Left Columns: Stock Levels & Staff Ledger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Inventory Table */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <Package size={18} style={{ color: 'var(--accent-blue)' }} />
                            Store Stock Levels
                        </h3>
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th>SKU / barcode</th>
                                    <th>Active Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => {
                                    const franchiseInv = p.franchise_stock.find((f: any) => f.quantity !== undefined) || { quantity: 0 };
                                    const qty = franchiseInv.quantity || 0;
                                    
                                    let statusLabel = 'In Stock';
                                    let statusClass = 'badge-success';
                                    if (qty === 0) {
                                        statusLabel = 'Out of Stock';
                                        statusClass = 'badge-danger';
                                    } else if (qty <= p.minimum_stock_level) {
                                        statusLabel = 'Low Stock';
                                        statusClass = 'badge-warning';
                                    }

                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    Size: {p.size || 'Free'} &bull; Color: {p.color || 'None'}
                                                </div>
                                            </td>
                                            <td>
                                                <div>{p.sku}</div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.barcode}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{qty}</span> units
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

                    {/* Franchise Employees Ledger */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className="panel-title" style={{ margin: 0 }}>
                                <Users size={18} style={{ color: 'var(--accent-purple)' }} />
                                Store Employees Directory
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                                <Plus size={14} /> Add Store Staff
                            </button>
                        </div>

                        {showAddForm && (
                            <form onSubmit={handleAddEmployeeSubmit} className="glass-panel" style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Register New Store Employee</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
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
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <select 
                                        className="form-input" 
                                        value={empRole} 
                                        onChange={(e) => setEmpRole(e.target.value)}
                                    >
                                        <option value="CASHIER">Cashier (POS Operator)</option>
                                        <option value="STORE_MANAGER">Store Manager</option>
                                        <option value="INVENTORY_MANAGER">Inventory Manager</option>
                                        <option value="SALES_EXECUTIVE">Sales Executive</option>
                                        <option value="AUDITOR">Store Auditor</option>
                                        <option value="DELIVERY_STAFF">Delivery Staff</option>
                                    </select>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Login Password" 
                                        value={empPassword} 
                                        onChange={(e) => setEmpPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={empSubmitting}>
                                        {empSubmitting ? 'Registering...' : 'Register Employee'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {employees.length > 0 ? (
                            <table className="glass-table">
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Name / Email</th>
                                        <th>Role</th>
                                        <th>Approval Status</th>
                                        <th>System Access</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} style={{ opacity: emp.is_active_employee ? 1 : 0.5 }}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{emp.employee_id || 'Generating...'}</td>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{emp.user.first_name} {emp.user.last_name || ''}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {emp.user.email} &bull; @{emp.user.username}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-blue">{emp.role.replace('_', ' ')}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.approval_status === 'APPROVED' ? 'badge-success' : emp.approval_status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                                    {emp.approval_status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${emp.is_active_employee ? 'badge-success' : 'badge-danger'}`}>
                                                    {emp.is_active_employee ? 'Active' : 'Terminated'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggleEmployee(emp.id)} title="Toggle Account Access">
                                                        <Power size={12} /> {emp.is_active_employee ? 'Disable' : 'Enable'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                                No store staff registered yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Request Stock Transfer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Transfer Request Form */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <ArrowRightLeft size={18} style={{ color: 'var(--accent-orange)' }} />
                            Request Stock Transfer
                        </h3>
                        <form onSubmit={handleRequestTransfer}>
                            <div className="form-group">
                                <label className="form-label">Select Product to Request</label>
                                <select className="form-input form-select" value={selectedProductId} onChange={(e) => setSelectedProductId(parseInt(e.target.value))} required>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} (SZ: {p.size || 'Free'})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Request Quantity</label>
                                <input type="number" className="form-input" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} placeholder="e.g. 50" required />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={transferSubmitting}>
                                {transferSubmitting ? 'Sending Request...' : 'Submit Transfer Request'}
                            </button>
                        </form>
                    </div>

                    {/* Stock Transfer History */}
                    <div className="glass-panel">
                        <h3 className="panel-title">
                            <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                            Transfer Requests History
                        </h3>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {transfers.length > 0 ? (
                                transfers.map((t) => (
                                    <div key={t.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{t.product_name}</span>
                                            <span className={`badge ${t.status === 'APPROVED' ? 'badge-success' : t.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            <span>Quantity: {t.quantity} units</span>
                                            <span>{new Date(t.transfer_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                                    No transfer records found.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
