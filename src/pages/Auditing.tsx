import { useEffect, useState } from 'react';
import {
    ClipboardCheck, Search, CheckCircle, ArrowLeft,
    Save, AlertTriangle, Package, Check, RefreshCw
} from 'lucide-react';
import { catalogService, orderService } from '../services/api';
import '../styles/website.css';

interface AuditProduct {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    selling_price: string;
    system_stock: number;
    physical_count: number;
}

interface AuditingProps {
    onBack: () => void;
}

export default function Auditing({ onBack }: AuditingProps) {
    const [auditItems, setAuditItems] = useState<AuditProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [auditSuccess, setAuditSuccess] = useState<string | null>(null);

    const storeName = localStorage.getItem('franchiseId') || 'Cavree Store';

    const loadStoreStock = async () => {
        setLoading(true);
        try {
            const res = await catalogService.getProducts();
            const products = res.data;
            const items: AuditProduct[] = products.map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                barcode: p.barcode,
                selling_price: p.selling_price,
                system_stock: p.stock !== undefined ? p.stock : 25,
                physical_count: p.stock !== undefined ? p.stock : 25
            }));
            setAuditItems(items);
        } catch (err) {
            console.error("Failed to load store stock for auditing", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStoreStock();
    }, []);

    const handleCountChange = (productId: number, val: string) => {
        const parsed = parseInt(val, 10);
        const count = isNaN(parsed) ? 0 : Math.max(0, parsed);
        setAuditItems(prev => prev.map(item => 
            item.id === productId ? { ...item, physical_count: count } : item
        ));
    };

    const handleIncrement = (productId: number, delta: number) => {
        setAuditItems(prev => prev.map(item => 
            item.id === productId ? { ...item, physical_count: Math.max(0, item.physical_count + delta) } : item
        ));
    };

    // Calculate Variance Totals
    const totalVariances = auditItems.filter(it => it.physical_count !== it.system_stock);
    const shortageItems = auditItems.filter(it => it.physical_count < it.system_stock);
    const totalDiscrepancyUnits = auditItems.reduce((sum, it) => sum + (it.physical_count - it.system_stock), 0);

    const handleSubmitAudit = async () => {
        if (!window.confirm(`Submit audit report for ${auditItems.length} products with ${totalVariances.length} discrepancies?`)) {
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                items: auditItems.map(it => ({
                    product_id: it.id,
                    physical_count: it.physical_count
                }))
            };

            await orderService.submitAudit(payload);
            setAuditSuccess(`Audit reconciliation submitted successfully for ${storeName}! System stocks have been aligned.`);
            
            setTimeout(() => {
                loadStoreStock();
                setAuditSuccess(null);
            }, 3000);
        } catch (err: any) {
            console.error("Audit submission failed", err);
            alert(err.response?.data?.error || "Failed to submit audit report.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = auditItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchQuery))
    );

    return (
        <div className="main-content">
            
            {/* Header with Back Button and Quick Submission */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onBack}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Hub</span>
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '1.65rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardCheck size={24} style={{ color: 'var(--pos-accent-green)' }} />
                            Store Inventory Audit &amp; Reconciliation
                        </h1>
                        <p style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', margin: '0.2rem 0 0 0' }}>
                            Perform shelf physical verification for {storeName} and record variances.
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSubmitAudit}
                    disabled={submitting || auditItems.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem' }}
                >
                    <Save size={18} />
                    <span>{submitting ? 'Saving Audit...' : 'Submit Audit Report'}</span>
                </button>
            </div>

            {/* Success Notification Alert */}
            {auditSuccess && (
                <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={24} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Audit Logged Successfully</div>
                        <div style={{ fontSize: '0.875rem' }}>{auditSuccess}</div>
                    </div>
                </div>
            )}

            {/* 3 Summary Statistic Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-gold-primary)' }}>
                    <div style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Catalog SKUs</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'Cinzel, serif' }}>
                        {auditItems.length} Products
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>In active franchise catalog</span>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Discrepant Items</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalVariances.length > 0 ? '#fde047' : 'var(--pos-accent-green)' }}>
                        {totalVariances.length} SKUs
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>{shortageItems.length} shortages identified</span>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--pos-accent-green)' }}>
                    <div style={{ color: 'var(--pos-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Net Variance Units</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalDiscrepancyUnits === 0 ? 'var(--pos-accent-green)' : (totalDiscrepancyUnits < 0 ? 'var(--pos-accent-red)' : 'var(--pos-gold-light)') }}>
                        {totalDiscrepancyUnits > 0 ? `+${totalDiscrepancyUnits}` : totalDiscrepancyUnits} Units
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--pos-text-secondary)' }}>Physical vs Central ERP count</span>
                </div>
            </div>

            {/* Audit Verification Table */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 className="panel-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                        Physical Stock Ledger ({filteredItems.length})
                    </h3>
                    <div style={{ position: 'relative', minWidth: '280px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Filter by SKU or Product Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                        />
                        <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '0.95rem', color: 'var(--pos-text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>Loading catalog for physical count...</p>
                ) : filteredItems.length > 0 ? (
                    <div className="table-responsive">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Product SKU</th>
                                    <th>Product Name</th>
                                    <th>Unit Selling Price</th>
                                    <th style={{ textAlign: 'center' }}>System ERP Stock</th>
                                    <th style={{ textAlign: 'center' }}>Physical Shelf Count</th>
                                    <th style={{ textAlign: 'center' }}>Variance Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => {
                                    const diff = item.physical_count - item.system_stock;
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--pos-gold-light)', fontFamily: 'monospace' }}>
                                                {item.sku}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {item.name}
                                                {item.barcode && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--pos-text-secondary)' }}>Barcode: {item.barcode}</div>
                                                )}
                                            </td>
                                            <td>₹{item.selling_price}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--pos-text-secondary)' }}>
                                                {item.system_stock}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.physical_count}
                                                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                        className="form-input"
                                                        style={{ width: '65px', textAlign: 'center', padding: '0.45rem', fontSize: '0.9375rem', fontWeight: 'bold' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {diff === 0 ? (
                                                    <span className="badge badge-success">
                                                        <Check size={11} style={{ marginRight: '0.2rem' }} /> Match
                                                    </span>
                                                ) : diff < 0 ? (
                                                    <span className="badge badge-danger">
                                                        {diff} Shortage
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning">
                                                        +{diff} Surplus
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--pos-text-secondary)' }}>
                        <Package size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', color: 'var(--pos-gold-primary)' }} />
                        <p>No products found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
