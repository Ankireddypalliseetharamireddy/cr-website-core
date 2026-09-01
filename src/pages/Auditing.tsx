import { useEffect, useState } from 'react';
import {
    ClipboardCheck, Search, CheckCircle, ArrowLeft,
    Save
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
                system_stock: p.stock !== undefined ? p.stock : 25, // default or live stock
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
            
            // Reload stock
            setTimeout(() => {
                loadStoreStock();
                setAuditSuccess(null);
            }, 3000);
        } catch (err: any) {
            console.error("Audit submission failed", err);
            alert(err.response?.data?.error || "Audit submission failed. Please check network connection.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = auditItems.filter(it => 
        it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.barcode && it.barcode.includes(searchQuery))
    );

    return (
        <div className="main-content">
            
            {/* Header with Navigation Back Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onBack}>
                        <ArrowLeft size={16} /> Back to Hub
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardCheck size={22} style={{ color: 'var(--accent-green)' }} />
                            Store Physical Inventory Audit
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                            Reconcile physical stock counts against system records at {storeName}.
                        </p>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSubmitAudit}
                    disabled={submitting || loading}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={18} />
                    <span>{submitting ? 'Submitting Reconciliation...' : 'Submit Audit Report'}</span>
                </button>
            </div>

            {auditSuccess && (
                <div className="badge badge-success" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', justifyContent: 'center', borderRadius: '8px' }}>
                    <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                    {auditSuccess}
                </div>
            )}

            {/* Audit Summary KPI Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-panel">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total SKUs Audited</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                        {auditItems.length} Products
                    </div>
                </div>

                <div className="glass-panel">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Balanced Products</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)', marginTop: '0.25rem' }}>
                        {auditItems.length - totalVariances.length} SKUs
                    </div>
                </div>

                <div className="glass-panel">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Shortages Detected</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)', marginTop: '0.25rem' }}>
                        {shortageItems.length} SKUs
                    </div>
                </div>

                <div className="glass-panel">
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Net Discrepancy Units</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalDiscrepancyUnits < 0 ? 'var(--accent-red)' : totalDiscrepancyUnits > 0 ? 'var(--accent-green)' : 'var(--text-primary)', marginTop: '0.25rem' }}>
                        {totalDiscrepancyUnits > 0 ? `+${totalDiscrepancyUnits}` : totalDiscrepancyUnits} Units
                    </div>
                </div>
            </div>

            {/* Product Physical Count Reconciliation Table */}
            <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 className="panel-title" style={{ margin: 0 }}>
                        Store Inventory Master ({filteredItems.length} items)
                    </h3>
                    <div style={{ position: 'relative', minWidth: '260px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Filter by product name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '0.85rem', color: 'var(--text-secondary)' }} />
                    </div>
                </div>

                {loading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading store stock list...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>SKU &amp; Product</th>
                                    <th>Selling Price</th>
                                    <th style={{ textAlign: 'center' }}>System Stock</th>
                                    <th style={{ textAlign: 'center' }}>Physical Count</th>
                                    <th style={{ textAlign: 'center' }}>Variance</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => {
                                    const variance = item.physical_count - item.system_stock;
                                    const isBalanced = variance === 0;
                                    const isShortage = variance < 0;

                                    return (
                                        <tr key={item.id} style={{ background: !isBalanced ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    SKU: {item.sku} {item.barcode && `| Barcode: ${item.barcode}`}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ₹{item.selling_price}
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                                                {item.system_stock}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, -1)}
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: '70px', textAlign: 'center', padding: '0.35rem', fontWeight: 'bold', fontSize: '1rem' }}
                                                        value={item.physical_count}
                                                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                        min={0}
                                                    />
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleIncrement(item.id, 1)}
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                                                <span style={{
                                                    color: isBalanced ? 'var(--accent-green)' : isShortage ? 'var(--accent-red)' : 'var(--accent-blue)'
                                                }}>
                                                    {variance > 0 ? `+${variance}` : variance}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {isBalanced ? (
                                                    <span className="badge badge-success">Balanced</span>
                                                ) : isShortage ? (
                                                    <span className="badge badge-danger">Shortage ({variance})</span>
                                                ) : (
                                                    <span className="badge badge-blue">Surplus (+{variance})</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
